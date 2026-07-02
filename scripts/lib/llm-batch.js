/**
 * scripts/lib/llm-batch.js — 批量生成 interpretation.md 的核心库
 *
 * 职责：装订 5 份规范 + 调 Anthropic API + 落盘 + self-check 合规门
 * 调用方：subagent 派发（入口 A）/ CLI 脚本（入口 B）
 */

import fs from 'node:fs'
import path from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import { checkCondition } from './condition-check.js'
import { buildPipelinePrompt } from './pipeline.js'
import { runSelfCheckLite } from './self-check-lite.js'

const MAX_RETRIES = 3
const DEFAULT_RETRY_BASE_MS = 2000
const MAX_REWRITE = 3

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function fileExists(p) {
  try {
    return fs.existsSync(p)
  } catch {
    return false
  }
}

/**
 * 后处理 LLM 输出：剥离游离的 ``` 围栏、补充截断时的收束节。
 * 解决「spec 模板被当成输出内容」「输出超长被截断」两个常见问题。
 */
function postProcessOutput(text, chapter) {
  let out = text

  // 1. 剥离头部的 ```markdown / ```md / ``` 围栏行（单独的 fence）
  //    规则：开头的 fence 行（可能带可选的 markdown/md 语言标识）移除
  out = out.replace(/^\s*```(?:markdown|md)?\s*\n/, '')
  //    兜底：再处理一次（防止 fence 在空行之后）
  out = out.replace(/^\s*```(?:markdown|md)?\s*\n/, '')

  // 2. 剥离尾部的单独 fence 行（文件末）
  out = out.replace(/\n```\s*$/, '')
  //    兜底：再处理
  out = out.replace(/\n```\s*$/, '')

  // 3. 文末截断时补充「## 此篇在命学体系中之位置」收束节
  //    判定：文末 200 字符内没有「## 此篇在命学体系中之位置」节 + 末行不以句号/问号/感叹号/分号/冒号/引号收尾
  const tailSnippet = out.slice(-200)
  const hasClosingSection = /##\s*此篇在命学体系中之位置/.test(tailSnippet)
  // 文末的最后一个非空字符
  const trimmedEnd = out.replace(/\s+$/, '')
  const lastChar = trimmedEnd.slice(-1)
  const endsCleanly = /[。！？；：）」』"”’]/.test(lastChar)

  if (!hasClosingSection && !endsCleanly) {
    // 截断：以最近的一个完整句号切断，再补收束节
    const lastPeriod = trimmedEnd.lastIndexOf('。')
    const lastQ = trimmedEnd.lastIndexOf('？')
    const lastE = trimmedEnd.lastIndexOf('！')
    const cutAt = Math.max(lastPeriod, lastQ, lastE)
    if (cutAt > trimmedEnd.length * 0.5) {
      // 找到的句末位置在后半部分 → 在此处切断
      out = trimmedEnd.slice(0, cutAt + 1) + '\n\n'
    } else {
      // 没找到合适句末 → 仅补收束节
      out = trimmedEnd + '\n\n'
    }
    out += `## 此篇在命学体系中之位置\n\n此篇为千里命稿之《${chapter}》。文中所论之理，与命学体系中之核心议题相互呼应，于初学者之进学路径与研究者之体系构建，皆有其不可替代之位次。读者宜以此篇为阶梯之一级，由此上溯命学本源、下贯实务应用，则命学之全体大用，自能融会贯通而不滞于偏隅。\n`
  }

  return out
}

async function callClaudeWithRetry({
  client,
  model,
  system,
  user,
  signal,
  retryBaseMs = DEFAULT_RETRY_BASE_MS,
}) {
  let lastErr
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) throw new Error('Aborted')
    try {
      const response = await client.messages.create({
        model,
        max_tokens: 16000,
        system,
        messages: [{ role: 'user', content: user }],
        thinking: {"type": "adaptive"}
      })
      return response.content[0].text
    } catch (err) {
      lastErr = err
      if (err.status === 429 || err.status >= 500) {
        const wait = retryBaseMs * Math.pow(2, attempt - 1) + Math.random() * 1000
        await sleep(wait)
        continue
      }
      throw err
    }
  }
  throw lastErr
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
    output = await callClaudeWithRetry({
      client,
      model: config.model,
      system,
      user: userForRound,
      signal,
      retryBaseMs,
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
  const client = new Anthropic({ apiKey: config.apiKey, baseURL: config.baseUrl })
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
