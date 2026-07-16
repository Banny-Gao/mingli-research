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
import { runSelfCheckLite } from './self-check-lite.js'
import { postProcessOutput } from './post-process.js'

const DEFAULT_RETRY_BASE_MS = 2000
const MAX_REWRITE = 3

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

  // 装订 prompt
  const system = `你是术数学术研究者，按 SPEC-interpretation.md 严格生成 interpretation.md。反元自我引用，禁 mode_of()/SPEC §X.X。`
  const user = buildPipelinePrompt({ sourceText, condition, specBundle })

  // 调 LLM（最多重写 3 次以达 ≥ 4 分）
  let output
  let score = 0
  let lastCheck = null
  let userForRound = user
  for (let rewrite = 0; rewrite < MAX_REWRITE; rewrite++) {
    console.log('\n# message userForRound', userForRound)
    console.log(userForRound)
    
    output = await callLLM(client, {
      model: config.model,
      system,
      messages: [{ role: 'user', content: userForRound }],
      maxTokens: 12800,
      signal,
      retryBaseMs,
      extendedThinking: true,
    })
    // 落盘前永远跑一次后处理（剥离围栏、补收束节）— 解决 LLM 偶发截断
    output = postProcessOutput(output, chapter)
    const check = runSelfCheckLite(output)
    score = check.score
    lastCheck = check
    if (score >= 4) break
    if (rewrite === MAX_REWRITE - 1) {
      // LLM 多次重写仍失败 → 尝试基于最后一次输出再后处理（防止遗漏）
      const fixed = postProcessOutput(output, chapter)
      const fixedCheck = runSelfCheckLite(fixed)
      if (fixedCheck.fatal === 0 && fixedCheck.score >= 4) {
        output = fixed
        score = fixedCheck.score
        lastCheck = fixedCheck
        break
      }
      // 补救后仍失败：保留 .lastfailed 供分析
      fs.writeFileSync(`${outputPath}.lastfailed`, output, 'utf-8')
      fs.writeFileSync(`${outputPath}.lastfixed`, fixed, 'utf-8')
      return {
        chapter,
        status: 'failed',
        reason: `self-check < 4 after ${MAX_REWRITE} rewrites + post-process`,
        report: fixedCheck,
      }
    }
    // 下一轮用增强 prompt：把上一次的致命问题注入 user
    if (lastCheck && lastCheck.fatal > 0) {
      const issues = lastCheck.issues.fatal.map(i => `- ${i}`).join('\n')
      userForRound =
        user +
        `\n\n## 上一次重写命中致命规则（必须修正后再交）\n\n${issues}\n\n请重新生成，确保上述致命问题均已解决。`
    }
  }

  // 备份（如有）— 不覆盖现有 .bak，使用 .bak.N 递增
  if (fileExists(outputPath)) {
    let bakIdx = 1
    while (fileExists(`${outputPath}.bak.${bakIdx}`)) bakIdx++
    fs.copyFileSync(outputPath, `${outputPath}.bak.${bakIdx}`)
  }

  // 落盘
  fs.writeFileSync(outputPath, output, 'utf-8')
  return { chapter, status: 'success', score }
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
 * @param {Function} [opts.onProgress]
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
        })
        results[i] = result
        onProgress?.(i + 1, total, chapter, result.status)
      } catch (err) {
        results[i] = { chapter, status: 'failed', reason: err.message }
        onProgress?.(i + 1, total, chapter, 'failed')
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
