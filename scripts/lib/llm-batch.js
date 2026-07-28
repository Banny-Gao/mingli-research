/**
 * scripts/lib/llm-batch.js — 批量生成 interpretation.md 的核心库
 *
 * 职责：装订 5 份规范 + 调 Anthropic API + 落盘 + self-check 合规门
 * 调用方：subagent 派发（入口 A）/ CLI 脚本（入口 B）
 */

import fs from 'node:fs'
import path from 'node:path'
import { createLLMClient, callLLM } from './llm-client.js'
import { checkCondition } from './condition-check.js'
import { buildPipelinePrompt } from './pipeline.js'
import { runSelfCheckLite, extractH2Headings } from './self-check-lite.js'
import { postProcessOutput } from './post-process.js'
import { evaluateContent } from './content-evaluator.js'

const DEFAULT_RETRY_BASE_MS = 2000
const MAX_REWRITE = 3

// max_tokens 分档（套 claude-api skill：Opus 4.8 max output = 128K，adaptive thinking
// 计入 output 预算，故长文必须给足 max_tokens 否则 thinking 吃预算致正文截断）。
// thinking 永远开（adaptive）—— 关掉 thinking 会牺牲质量，不可接受。
//   短篇/标准 12800：原文信息量有限，12800 足够 thinking + 正文。
//   密集(≥2000) 32000：长正文 + thinking 双消耗，给到 32K 余裕。
//   超长(>5000) 64000：skill 明确要求 high effort + thinking 时 max_tokens≥64000，否则截断。
const SHORT_MAX_TOKENS = 12800
const DENSE_MAX_TOKENS = 32000
const LONG_MAX_TOKENS = 64000
// 续轮锚点只对 source ## ≥ 5 的长文有意义（短文无需覆盖清单）
const MIN_SRC_HEADS_FOR_ANCHOR = 5

/**
 * 按原文体检结论选择 LLM 调用参数。
 * thinking 永远开（adaptive）—— 质量优先，不关 thinking。
 * 仅按篇幅分档 max_tokens：超长 > 密集 > 标准。
 * 导出供单测直接验证参数选择逻辑。
 * @param {{模式: string, 超长: string}} condition
 * @returns {{extendedThinking: boolean, maxTokens: number}}
 */
export function pickLlmParams(condition) {
  const isLong = condition.超长 !== '否' // 有效字符 > 5000
  if (isLong) return { extendedThinking: true, maxTokens: LONG_MAX_TOKENS }
  const isDense = condition.模式 === '密集' // modeOf ≥ 2000
  if (isDense) return { extendedThinking: true, maxTokens: DENSE_MAX_TOKENS }
  return { extendedThinking: true, maxTokens: SHORT_MAX_TOKENS }
}

/**
 * 构造续轮消息内容。长文（source ## ≥ 5）附 source 二级标题清单作为覆盖锚点，
 * 降低续轮时 LLM 重复/漏写节概率；短文用默认「请继续。」。
 * 导出供单测直接验证锚点构造。
 * @param {string} sourceText
 * @returns {string}
 */
export function buildContinuePrompt(sourceText) {
  const heads = extractH2Headings(sourceText)
  if (heads.length < MIN_SRC_HEADS_FOR_ANCHOR) return '请继续。'
  const checklist = heads.slice(0, 15).join('、')
  const suffix = heads.length > 15 ? ` 等${heads.length}节` : ''
  return `请继续。\n\n（注意：source.md 含以下二级标题，续写时请确保逐一覆盖、勿重复：${checklist}${suffix}）`
}

/**
 * 把 self-check 的致命 + 格式问题格式化为注入下轮 prompt 的文本块。
 * @param {{fatal: string[], format: string[]}} issues
 * @returns {string} 注入文本（无问题时返回空串）
 */
function formatFormatIssuesBlock(issues) {
  const lines = []
  if (issues.fatal.length > 0) {
    lines.push('### 致命问题（必须修正）')
    issues.fatal.forEach(i => lines.push(`- ${i}`))
  }
  if (issues.format.length > 0) {
    lines.push('### 格式问题（必须修正）')
    issues.format.forEach(i => lines.push(`- ${i}`))
  }
  return lines.join('\n')
}

function fileExists(p) {
  try {
    return fs.existsSync(p)
  } catch {
    return false
  }
}

async function generateOne({
  chapter,
  specBundle,
  config,
  projectRoot,
  force,
  signal,
  client,
  retryBaseMs,
  onStreamTick,
}) {
  const articlesDir = path.join(projectRoot, `books/${config.slug}/articles/${chapter}`)
  const sourcePath = path.join(articlesDir, 'source.md')
  const outputPath = path.join(articlesDir, 'interpretation.md')

  if (!fileExists(sourcePath)) {
    return { chapter, status: 'skipped', reason: 'source.md missing' }
  }
  if (fileExists(outputPath) && !force) {
    return { chapter, status: 'skipped', reason: 'interpretation.md exists' }
  }

  // per-篇 Read source.md（specBundle 不再含 sourceText）
  const sourceText = fs.readFileSync(sourcePath, 'utf-8')

  // 体检
  const condition = checkCondition(sourceText)

  // C: 按原文模式选 LLM 参数（thinking 永远开，仅按篇幅分档 max_tokens）
  const llmParams = pickLlmParams(condition)
  // D: 长文续轮附 source 标题锚点
  const continuePrompt = buildContinuePrompt(sourceText)

  // 装订 prompt
  const system = `你是术数学术研究者，按 SPEC-interpretation.md 严格生成 interpretation.md。反元自我引用，禁 mode_of()/SPEC §X.X。`
  const user = buildPipelinePrompt({ sourceText, condition, specBundle })

  // 调 LLM（最多重写 3 次以过格式门：fatal=0 && format=0，即 selfCheck score≥4）
  // 重写循环只管格式门（fatal+format 全集注入定向修正）；内容质量评估器落盘前跑一次（A）。
  let output
  let score = 0
  let lastCheck = null
  let userForRound = user
  for (let rewrite = 0; rewrite < MAX_REWRITE; rewrite++) {
    output = await callLLM(client, {
      model: config.model,
      system,
      messages: [{ role: 'user', content: userForRound }],
      maxTokens: llmParams.maxTokens,
      signal,
      retryBaseMs,
      extendedThinking: llmParams.extendedThinking,
      continuePrompt,
      onStreamTick,
    })
    // 落盘前永远跑一次后处理（剥离围栏、自评段）— 纯清理，不补内容
    output = postProcessOutput(output)
    const check = runSelfCheckLite(output, sourceText)
    score = check.score
    lastCheck = check

    // 格式门通过 → 跳出，进入落盘前内容评估
    if (score >= 4) break

    // 格式门未过（fatal 或 format 命中）→ 注入 fatal+format 全集定向修正（B）
    if (rewrite === MAX_REWRITE - 1) {
      return buildFailure(chapter, output, sourceText, check, null, outputPath, 'format')
    }
    const issuesBlock = formatFormatIssuesBlock(check.issues)
    userForRound = user + `\n\n## 上一次命中致命/格式规则（必须修正后再交）\n\n${issuesBlock}\n\n请重新生成，确保上述问题均已解决。`
  }

  // A: 落盘前跑一次内容质量评估器（格式门已过，才值得花这次调用）。
  // 评估器失败 → 降级放行（score=5）；内容不过 → 写 .lastfailed + .lasteval 不落盘，供人工介入。
  const contentEval = await evaluateContent({ output, sourceText, config, client, signal, retryBaseMs })
  if (contentEval.score < 4 && !contentEval.failed) {
    return buildFailure(chapter, output, sourceText, lastCheck, contentEval, outputPath, 'content')
  }

  // 备份（如有）— 不覆盖现有 .bak，使用 .bak.N 递增
  if (fileExists(outputPath)) {
    let bakIdx = 1
    while (fileExists(`${outputPath}.bak.${bakIdx}`)) bakIdx++
    fs.copyFileSync(outputPath, `${outputPath}.bak.${bakIdx}`)
  }

  // 落盘
  fs.writeFileSync(outputPath, output, 'utf-8')
  return {
    chapter,
    status: 'success',
    score,
    contentScore: contentEval.score,
  }
}

/**
 * 构造失败结果。E：失败 report 聚合 fatal/format/content 三类问题清单，便于人工诊断。
 * 保留 .lastfailed 供分析（评估器若跑过，一并写 .lasteval 保留评估结果）。
 * @param {'format'|'content'} kind — 格式门失败（重写 N 次仍未过）vs 内容门失败（落盘前评估未达 4 分）
 */
function buildFailure(chapter, output, sourceText, check, contentEval, outputPath, kind) {
  fs.writeFileSync(`${outputPath}.lastfailed`, output, 'utf-8')
  if (contentEval) {
    fs.writeFileSync(
      `${outputPath}.lasteval`,
      JSON.stringify({ score: contentEval.score, issues: contentEval.issues, failed: contentEval.failed }, null, 2),
      'utf-8'
    )
  }
  const parts = []
  if (check.issues.fatal.length > 0) parts.push(`致命[${check.issues.fatal.length}]: ${check.issues.fatal.join(' | ')}`)
  if (check.issues.format.length > 0) parts.push(`格式[${check.issues.format.length}]: ${check.issues.format.join(' | ')}`)
  if (contentEval && contentEval.issues.length > 0) {
    parts.push(`内容[${contentEval.issues.length}]: ${contentEval.issues.map(i => `${i.item}(${i.desc})`).join(' | ')}`)
  }
  const reasonTail = parts.length > 0 ? ` — ${parts.join(' / ')}` : ''
  const reason =
    kind === 'content'
      ? `内容质量评估未达 4 分（落盘前），不落盘${reasonTail}`
      : `格式门未通过 after ${MAX_REWRITE} rewrites${reasonTail}`
  return {
    chapter,
    status: 'failed',
    reason,
    report: { check, contentEval },
  }
}

/**
 * 批量生成 interpretation.md
 * @param {Object} opts
 * @param {string} opts.slug
 * @param {string[]} opts.chapters
 * @param {Object} opts.specBundle
 * @param {{apiKey: string, baseUrl: string, model: string, concurrency: number}} opts.config
 * @param {string} opts.projectRoot
 * @param {boolean} [opts.force=false]
 * @param {Function} [opts.onProgress] - (current, total, chapter, status, result) 单篇完成回调
 * @param {Function} [opts.onChapterStart] - (current, total, chapter) 单篇开始回调（长任务反馈）
 * @param {Function} [opts.onStreamTick] - (t: {chars, phase}) 流式心跳回调（单篇长任务进度）
 * @param {AbortSignal} [opts.signal]
 * @param {number} [opts.retryBaseMs=2000] - 429/5xx 重试退避基数（测试可缩小）
 * @param {number} [opts.concurrency] - 外层并发篇章数；缺省从 config.concurrency 取
 */
export async function generateInterpretations(opts) {
  const {
    slug,
    chapters,
    specBundle,
    config,
    projectRoot,
    force = false,
    onProgress,
    onChapterStart,
    onStreamTick,
    signal,
    retryBaseMs = DEFAULT_RETRY_BASE_MS,
    concurrency = config.concurrency,
  } = opts
  const client = createLLMClient(config)
  // client 共享于所有 worker（Anthropic SDK 线程安全）

  // 手写 sem 池：limit 个槽位，空闲即取 next index
  let nextIdx = 0
  const results = new Array(chapters.length)
  const total = chapters.length
  const limit = Math.max(1, concurrency)

  async function worker() {
    while (true) {
      if (signal?.aborted) return
      const i = nextIdx++
      if (i >= total) return
      const chapter = chapters[i]
      // 开始处理某篇时立即反馈（单篇 LLM 调用可能耗时数十秒到数分钟，否则像卡住）
      onChapterStart?.(i + 1, total, chapter)
      try {
        const result = await generateOne({
          chapter,
          specBundle,
          config: { ...config, slug },
          projectRoot,
          force,
          signal,
          client,
          retryBaseMs,
          onStreamTick,
        })
        results[i] = result
        onProgress?.(i + 1, total, chapter, result.status, result)
      } catch (err) {
        results[i] = { chapter, status: 'failed', reason: err.message }
        onProgress?.(i + 1, total, chapter, 'failed', { chapter, status: 'failed', reason: err.message })
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, total) }, () => worker())
  await Promise.all(workers)

  // 兜底：被 abort 跳过但未填入 results 的篇章
  for (let i = 0; i < total; i++) {
    if (!results[i]) {
      results[i] = { chapter: chapters[i], status: 'skipped', reason: 'aborted' }
    }
  }
  return results
}
