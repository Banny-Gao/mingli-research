#!/usr/bin/env node
/**
 * scripts/dev.js — 监听 books/ 变动自动重新生成 + 启动 vite
 *
 * 零额外依赖，使用 Node.js 内置 fs.watch（recursive）。
 */

import { spawn, execSync } from 'child_process'
import { watch } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const BOOKS_DIR = path.join(ROOT, 'books')

const runGenerate = () => {
  console.log('[dev] Running generate.js...')
  try {
    execSync('node scripts/generate.js', { cwd: ROOT, stdio: 'inherit' })
  } catch (e) {
    console.error('[dev] generate.js failed, dev server continues with stale data.')
  }
}

// 首次运行
runGenerate()

// 启动 vite（跨平台：直接用 node 执行 vite CLI 入口，绕过 .cmd 包装器）
const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js')
const vite = spawn(process.execPath, [viteBin], {
  cwd: ROOT,
  stdio: 'inherit',
})

let debounceTimer

const onChange = (_eventType, filename) => {
  // Linux 下 filename 可能为 null，任何事件都触发
  if (filename && !filename.endsWith('.md')) return
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(runGenerate, 300)
}

console.log('[dev] Watching books/ for *.md changes...')

try {
  const watcher = watch(BOOKS_DIR, { recursive: true }, onChange)
  watcher.on('error', err => {
    console.error('[dev] fs.watch error:', err.message)
  })

  const cleanup = () => {
    watcher.close()
    vite.kill()
    process.exit()
  }
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
} catch {
  console.warn('[dev] fs.watch with recursive not supported, running without file watch.')
}
