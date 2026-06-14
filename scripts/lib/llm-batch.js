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

async function callClaudeWithRetry({ client, model, system, user, signal, retryBaseMs = DEFAULT_RETRY_BASE_MS }) {
  let lastErr
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) throw new Error('Aborted')
    try {
      const response = await client.messages.create({
        model,
        max_tokens: 8000,
        system,
        messages: [{ role: 'user', content: user }],
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

async function generateOne({ chapter, sourceText, specBundle, config, projectRoot, force, signal, onProgress, client, retryBaseMs }) {
  const articlesDir = path.join(projectRoot, `books/${config.slug}/articles/${chapter}`)
  const sourcePath = path.join(articlesDir, 'source.md')
  const interpPath = path.join(articlesDir, 'interpretation.md')

  if (!fileExists(sourcePath)) {
    return { chapter, status: 'skipped', reason: 'source.md missing' }
  }
  if (fileExists(interpPath) && !force) {
    return { chapter, status: 'skipped', reason: 'interpretation.md exists' }
  }

  // 体检
  const condition = checkCondition(sourceText)

  // 装订 prompt
  const system = `你是术数学术研究者，按 SPEC-interpretation.md 严格生成 interpretation.md。反元自我引用，禁 mode_of()/SPEC §X.X。`
  const user = buildPipelinePrompt({ sourceText, condition, specBundle })

  // 调 LLM（最多重写 3 次以达 ≥ 4 分）
  let output
  let score = 0
  for (let rewrite = 0; rewrite < MAX_REWRITE; rewrite++) {
    output = await callClaudeWithRetry({ client, model: config.model, system, user, signal, retryBaseMs })
    const check = runSelfCheckLite(output)
    score = check.score
    if (score >= 4) break
    if (rewrite === MAX_REWRITE - 1) {
      return { chapter, status: 'failed', reason: `self-check < 4 after ${MAX_REWRITE} rewrites`, report: check }
    }
  }

  // 备份（如有）
  if (fileExists(interpPath)) {
    fs.copyFileSync(interpPath, `${interpPath}.bak`)
  }

  // 落盘
  fs.writeFileSync(interpPath, output, 'utf-8')
  return { chapter, status: 'success', score }
}

/**
 * 批量生成 interpretation.md
 * @param {Object} opts
 * @param {string} opts.slug
 * @param {string[]} opts.chapters
 * @param {Object} opts.specBundle
 * @param {{apiKey: string, baseUrl: string, model: string}} opts.config
 * @param {string} opts.projectRoot
 * @param {boolean} [opts.force=false]
 * @param {Function} [opts.onProgress]
 * @param {AbortSignal} [opts.signal]
 * @param {number} [opts.retryBaseMs=2000] - 429/5xx 重试退避基数（测试可缩小）
 */
export async function generateInterpretations(opts) {
  const { slug, chapters, specBundle, config, projectRoot, force = false, onProgress, signal, retryBaseMs = DEFAULT_RETRY_BASE_MS } = opts
  const client = new Anthropic({ apiKey: config.apiKey, baseURL: config.baseUrl })

  const results = []
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i]
    if (signal?.aborted) {
      results.push({ chapter, status: 'skipped', reason: 'aborted' })
      continue
    }
    try {
      const result = await generateOne({
        chapter,
        sourceText: specBundle.sourceText,
        specBundle,
        config: { ...config, slug },
        projectRoot,
        force,
        signal,
        onProgress,
        client,
        retryBaseMs,
      })
      results.push(result)
      onProgress?.(i + 1, chapters.length, chapter, result.status)
    } catch (err) {
      results.push({ chapter, status: 'failed', reason: err.message })
      onProgress?.(i + 1, chapters.length, chapter, 'failed')
    }
  }
  return results
}
