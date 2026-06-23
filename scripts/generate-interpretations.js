#!/usr/bin/env node
/**
 * generate-interpretations.js — 批量生成 interpretation.md 的 CLI 入口
 *
 * 用法：
 *   node scripts/generate-interpretations.js <slug> [chapters] [--force] [--dry-run]
 *                                        [--api-key <key>] [--base-url <url>] [--model <id>]
 *
 * 双轨批量入口 B。入口 A 是 subagent 派发（详见 shared/subagent-batch.md）。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import { parseCliArgs } from './lib/generate-interpretations-cli.js'
import { resolveConfig, ConfigError } from './lib/env.js'
import { loadSpecBundle } from './lib/spec-bundle.js'
import { generateInterpretations } from './lib/llm-batch.js'
import { progressBar, formatDuration } from './lib/utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

function resolveChapters(slug, requested) {
  const catalogPath = path.join(ROOT, `books/${slug}/catalog.md`)
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`找不到 books/${slug}/catalog.md`)
  }
  const catalog = fs.readFileSync(catalogPath, 'utf-8')
  // 提取所有篇章名（从表格中）
  const allChapters = [...catalog.matchAll(/^\|\s*\d+\s*\|\s*([^|]+?)\s*\|/gm)].map(m => m[1].trim())

  if (!requested) return allChapters // 整本
  // 精确匹配 + 模糊匹配
  const resolved = []
  for (const req of requested) {
    const exact = allChapters.find(c => c === req)
    if (exact) { resolved.push(exact); continue }
    const fuzzy = allChapters.find(c => c.startsWith(req))
    if (fuzzy) { resolved.push(fuzzy); continue }
    throw new Error(`未匹配篇章名：${req}（候选：${allChapters.slice(0, 5).join(', ')}...）`)
  }
  return resolved
}

function printDryRun(slug, chapters) {
  console.log(`\n# dry-run 预览\n`)
  console.log(`书: ${slug}`)
  console.log(`篇章数: ${chapters.length}`)
  console.log(`\n篇章列表:`)
  chapters.forEach((c, i) => console.log(`  ${i + 1}. ${c}`))
  const estimatedMs = chapters.length * 60_000 // 每篇 60s 估算
  console.log(`\n预计耗时: ${formatDuration(estimatedMs)}`)
  console.log(`\n实跑命令: node scripts/generate-interpretations.js ${slug} ${chapters.join(',')} --force\n`)
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2))

  if (args.help || !args.slug) {
    console.log(`用法: node scripts/generate-interpretations.js <slug> [chapters] [--force] [--dry-run]
                          [--api-key <key>] [--base-url <url>] [--model <id>] [--concurrency <n>|-c <n>]`)
    process.exit(args.help ? 0 : 1)
  }

  // 1. 解析篇章（不需 API key）
  const chapters = resolveChapters(args.slug, args.chapters)

  // 2. dry-run 直接退出（不需 API key）
  if (args.dryRun) {
    printDryRun(args.slug, chapters)
    process.exit(0)
  }

  // 3. 实跑才需要 API key
  let config
  try {
    config = resolveConfig({ apiKey: args.apiKey, baseUrl: args.baseUrl, model: args.model, concurrency: args.concurrency })
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(err.message)
      process.exit(1)
    }
    throw err
  }

  console.log(`\n# 批量生成 interpretation.md`)
  console.log(`书: ${args.slug} | 篇章: ${chapters.length} 篇 | 模型: ${config.model} | 并发: ${config.concurrency}\n`)

  const start = Date.now()
  const specBundle = loadSpecBundle(args.slug, { projectRoot: ROOT })

  const results = await generateInterpretations({
    slug: args.slug,
    chapters,
    specBundle,
    config,
    projectRoot: ROOT,
    force: args.force,
    onProgress: (current, total, chapter, status) => {
      const bar = progressBar(current, total)
      process.stdout.write(`\r${bar} ${chapter.padEnd(12)} ${status}    `)
    },
  })

  console.log(`\n\n# 收尾报告`)
  console.log(`总耗时: ${formatDuration(Date.now() - start)}`)
  const success = results.filter(r => r.status === 'success').length
  const failed = results.filter(r => r.status === 'failed').length
  const skipped = results.filter(r => r.status === 'skipped').length
  console.log(`成功: ${success} | 失败: ${failed} | 跳过: ${skipped}`)

  if (failed > 0) {
    console.log(`\n失败篇章：`)
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`  - ${r.chapter}: ${r.reason}`)
    })
  }

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(err => {
  console.error(`\n❌ 致命错误: ${err.message}\n`)
  console.error(err.stack)
  process.exit(1)
})
