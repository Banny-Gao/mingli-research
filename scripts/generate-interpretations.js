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
import { resolveConfig, ConfigError, ANTHROPIC_SCHEMA } from './lib/env.js'
import { loadSpecBundle } from './lib/spec-bundle.js'
import { generateInterpretations } from './lib/llm-batch.js'
import { formatDuration } from './lib/utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

export function resolveChapters(slug, requested, projectRoot = ROOT) {
  const catalogPath = path.join(projectRoot, `books/${slug}/catalog.md`)
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`找不到 books/${slug}/catalog.md`)
  }
  const catalog = fs.readFileSync(catalogPath, 'utf-8')
  // 提取所有篇章名（从表格中）
  const allChapters = [...catalog.matchAll(/^\|\s*\d+\s*\|\s*([^|]+?)\s*\|/gm)].map(m => m[1].trim())

  // F: catalog 格式不符正则时静默返回空数组 → 批量会"成功 0 篇"误导用户，显式报错
  if (allChapters.length === 0) {
    throw new Error(
      `books/${slug}/catalog.md 未解析到任何篇章（表格需为「| 序号 | 篇名 |」格式，检查 catalog.md 是否改版或缺少数字序号列）`
    )
  }

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
  console.log(`\n⚠️ 质量优先建议：批量前先单点跑 1 篇（node scripts/generate-interpretations.js ${slug} ${chapters[0]} --force）人工验收，确认 SPEC/评估器无系统性偏差后再批量。`)
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
    config = resolveConfig(ANTHROPIC_SCHEMA, { apiKey: args.apiKey, baseUrl: args.baseUrl, model: args.model, concurrency: args.concurrency })
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

  // 友好日志：每篇开始/完成各一行（行式而非覆盖式，并发友好）
  // —— 单篇 LLM 调用含 thinking + 大 max_tokens，可能耗时数十秒到数分钟，
  //   无中途反馈会像卡住。onChapterStart 打开始行，onStreamTick 每 ~3s 打一次心跳（覆盖式），
  //   onProgress 打完成行（先 \n 把覆盖的心跳"推"到上一行）。
  const chapterStartTimes = new Map()
  const padNum = n => String(n).padStart(String(chapters.length).length, ' ')

  const results = await generateInterpretations({
    slug: args.slug,
    chapters,
    specBundle,
    config,
    projectRoot: ROOT,
    force: args.force,
    onChapterStart: (current, total, chapter) => {
      chapterStartTimes.set(chapter, Date.now())
      console.log(`[${padNum(current)}/${total}] ▶ 开始  ${chapter}`)
    },
    onStreamTick: ({ chars, phase }) => {
      // 覆盖式心跳（节流 3s 一次，由 callOnce 控制）。完成行前会换行收尾。
      const tag = phase === 'thinking' ? '🧠 思考中' : '✍️  生成中'
      process.stdout.write(`\r  ⏳ ${tag}  已输出 ${chars} 字符`)
    },
    onSegmentRepair: e => {
      // 按段修复进度：另起一行（先换行收掉可能正在覆盖的心跳行）
      if (e.phase === 'start') {
        const heads = e.headings.map(h => h || '引言').join('、')
        process.stdout.write(`\n  🔧 按段修复  ${e.segmentCount} 段（${heads}）\n`)
      } else if (e.phase === 'success') {
        process.stdout.write(`  ✅ 按段修复成功（第 ${e.round} 轮，${e.segmentCount} 段）\n`)
      } else if (e.phase === 'retry') {
        process.stdout.write(`\n  🔁 第 ${e.round} 轮修完仍不合格（格式 ${e.score}/5），进入第 ${e.round + 1} 轮\n`)
      } else if (e.phase === 'reject' || e.phase === 'error') {
        process.stdout.write(`  ↩️  按段修复放弃，退回整篇重生成 — ${e.reason}\n`)
      } else if (e.phase === 'skip') {
        process.stdout.write(`\n  ↩️  按段修复不适用，整篇重生成 — ${e.reason}\n`)
      }
    },
    onProgress: (current, total, chapter, status, result) => {
      // 先换行：把可能正在覆盖的心跳行"收"成上一行，让完成行落到新行
      process.stdout.write('\n')
      const elapsed = chapterStartTimes.has(chapter)
        ? formatDuration(Date.now() - chapterStartTimes.get(chapter))
        : '?'
      const tag = STATUS_TAG[status] || status
      const detail = formatResultDetail(result)
      console.log(`[${padNum(current)}/${total}] ${tag} ${chapter}  (${elapsed}${detail})`)
    },
  })

  console.log(`\n# 收尾报告`)
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

// 状态 → 单字标签 + emoji（终端可读）
const STATUS_TAG = {
  success: '✅ 完成',
  failed: '❌ 失败',
  skipped: '⏭ 跳过',
}

/**
 * 把 result 的分数/原因格式化为日志后缀（成功带分数、失败/跳过带原因）。
 * 失败/跳过的原因在进度行只取首行 + 条数摘要（完整原因见收尾报告的失败篇章列表，
 * 避免 2000+ 字符的评估器详情在同一终端打两遍）。
 * @param {{status: string, score?: number, contentScore?: number, reason?: string, repairedBySegment?: boolean}} [result]
 * @returns {string}
 */
function formatResultDetail(result) {
  if (!result) return ''
  if (result.status === 'success') {
    const parts = []
    if (typeof result.score === 'number') parts.push(`格式 ${result.score}/5`)
    if (typeof result.contentScore === 'number') parts.push(`内容 ${result.contentScore}/5`)
    if (result.repairedBySegment) parts.push('按段修复')
    return parts.length ? ` · ${parts.join(' / ')}` : ''
  }
  if (!result.reason) return ''
  // 失败/跳过：取「原因分类 + 条数」，丢弃评估器的逐条细节（收尾报告会完整列出）
  const brief = result.reason.split(' — ')[0]
  return ` · ${brief}`
}

// 仅当作为脚本直接运行时执行 main（被 import 时不自动运行，便于单测 import resolveChapters）
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error(`\n❌ 致命错误: ${err.message}\n`)
    console.error(err.stack)
    process.exit(1)
  })
}
