#!/usr/bin/env node
/**
 * runner-smj.js — 一次性跑完 三命通会 全部 380 篇
 * 由 subagent 调用，直接复刻 scripts/generate-interpretations.js 的实跑路径，
 * 仅追加：把 onProgress 的进度用结构化 JSON 行打到 stderr（主 agent 长轮询 stdout）。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import { resolveConfig } from './lib/env.js'
import { loadSpecBundle } from './lib/spec-bundle.js'
import { generateInterpretations } from './lib/llm-batch.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

async function main() {
  // 1. 读篇章
  const chaptersTxt = fs.readFileSync('/tmp/smj_chapters.txt', 'utf-8')
  const chapters = chaptersTxt.split('\n').map(s => s.trim()).filter(Boolean)
  if (chapters.length === 0) {
    console.error('FATAL: /tmp/smj_chapters.txt 为空')
    process.exit(2)
  }

  // 2. 配置
  let config
  try {
    config = resolveConfig({})
  } catch (err) {
    console.error('FATAL: ' + err.message)
    process.exit(2)
  }

  // 3. 规范装订（4 份：specInterpretation / general / shuSpecial / catalog）
  const specBundle = loadSpecBundle('三命通会', { projectRoot: ROOT })

  // 4. 进度探针 → stderr（结构化 JSON 行，主 agent 可 grep）
  const progressLog = fs.createWriteStream('/tmp/smj_progress.log', { flags: 'a' })
  const onProgress = (current, total, chapter, status) => {
    const elapsed = Date.now() - START
    const line = JSON.stringify({ t: Date.now(), current, total, chapter, status, elapsedMs: elapsed })
    progressLog.write(line + '\n')
    // stderr 一行，主 agent 也能看到
    process.stderr.write(`PROGRESS ${current}/${total} ${chapter} ${status}\n`)
  }

  const START = Date.now()

  console.error(`# 启动 三命通会 批量生成，共 ${chapters.length} 篇`)
  console.error(`# 模型: ${config.model}`)
  console.error(`# baseUrl: ${config.baseUrl}`)

  const results = await generateInterpretations({
    slug: '三命通会',
    chapters,
    specBundle,
    config,
    projectRoot: ROOT,
    force: true,
    onProgress,
  })

  // 5. 收尾报告写到 /tmp/smj_result.json
  const succeeded = results.filter(r => r.status === 'success').length
  const failed = results.filter(r => r.status === 'failed').length
  const skipped = results.filter(r => r.status === 'skipped').length
  const fatalList = results
    .filter(r => r.status === 'failed')
    .map(r => ({ chapter: r.chapter, reason: r.reason }))
  const elapsedMs = Date.now() - START
  const summary = {
    total: chapters.length,
    succeeded,
    failed,
    skipped,
    fatalList,
    elapsedMs,
  }
  fs.writeFileSync('/tmp/smj_result.json', JSON.stringify(summary, null, 2), 'utf-8')
  console.error(`# 完成 成功:${succeeded} 失败:${failed} 跳过:${skipped} 耗时:${elapsedMs}ms`)
}

main().catch(err => {
  console.error('FATAL: ' + err.message)
  console.error(err.stack)
  process.exit(2)
})