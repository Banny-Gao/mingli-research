/**
 * scripts/lib/shared/progress.js — CLI 进度工具
 *
 * - spinner(text): 单 spinner 实例，非 TTY 时返回 null
 * - ProgressPanel: 多行并发状态面板，适合批量场景
 *
 * 设计取舍：
 * - ProgressPanel 没有用 log-update，因为 log-update 只能更新"最近一行"，
 *   而批量面板需要 N 行独立 cursor 控制；直接用 ANSI（\x1b[NA / \x1b[2K）
 *   可以一次刷新整组行；ora 只用于单行 spinner。
 * - 所有输出统一走 stdout；isInteractive() 同时检查 stdout/stderr 是 TTY，
 *   保证 CI / 日志重定向场景下不会出现半截光标控制序列污染日志。
 */

import ora from 'ora'

export function isInteractive() {
  return Boolean(process.stdout.isTTY) && Boolean(process.stderr.isTTY)
}

/**
 * 创建一个 spinner。spinner.text 在过程中可改，stop 时务必调用 .succeed/.fail/.stop
 * 避免光标悬挂。
 *
 * ⚠️ 契约：非 TTY 环境返回 null，每个调用方必须守护 `if (spinner)`。
 * 否则非 TTY 下 .succeed/.fail 会抛 "Cannot read properties of null"。
 */
export function spinner(text) {
  if (!isInteractive()) return null
  return ora({ text, stream: process.stdout }).start()
}

/**
 * 批量并发进度面板
 *
 * - constructor(total): total 个任务
 * - track(i, label): 注册第 i 个任务的初始 label（必须在 done/start 前调用）
 * - start(i): 标记 i 进入 spinner 态
 * - done(i, ok, msg?): 标记 i 完成，ok=true 显示 ✓，false 显示 ✗；msg 为补充信息
 * - startAutoRefresh(): 启动每秒重绘
 * - stopAutoRefresh(): 停止重绘并最后打印一次
 */
const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export class ProgressPanel {
  constructor(total) {
    this.total = total
    this.rows = new Array(total)
    for (let i = 0; i < total; i++) {
      this.rows[i] = { state: 'pending', label: '' }
    }
    this._linesPrinted = 0
    this._frame = 0
    this._timer = null
    // 每行最近一次打印的 prefix 缓存；done/failed 状态固化后停止重绘，避免每秒无意义重写整屏
    this._lastPrefix = new Array(total).fill(null)
  }

  track(index, label) {
    if (this.rows[index]) this.rows[index].label = label
  }

  start(index) {
    if (this.rows[index]) this.rows[index].state = 'running'
  }

  done(index, ok, msg) {
    if (this.rows[index]) {
      this.rows[index].state = ok ? 'done' : 'failed'
      if (msg) this.rows[index].msg = msg
    }
  }

  startAutoRefresh() {
    if (!isInteractive()) return
    if (this.total <= 0) return
    this.print() // 立即打印首帧，避免快速批量的"全部已完成"闪现
    this._timer = setInterval(() => this.print(), 1000)
  }

  stopAutoRefresh() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
    this.print()
  }

  print() {
    if (!isInteractive()) return
    if (this._linesPrinted > 0) {
      process.stdout.write(`\x1b[${this._linesPrinted}A`)
    }
    for (let i = 0; i < this.total; i++) {
      const r = this.rows[i]
      let prefix
      if (r.state === 'pending') prefix = '○'
      else if (r.state === 'running') prefix = SPINNER[this._frame % SPINNER.length]
      else if (r.state === 'done') prefix = '✓'
      else if (r.state === 'failed') prefix = '✗'
      // 终态行（done/failed）只在 prefix 首次变化时重绘，避免每秒无意义重写
      if ((r.state === 'done' || r.state === 'failed') && this._lastPrefix[i] === prefix) {
        process.stdout.write(`\x1b[2K\n`)
        continue
      }
      this._lastPrefix[i] = prefix
      const body = r.msg ? `${r.label} ${r.msg}` : r.label
      const line = `[${i + 1}/${this.total}] ${prefix} ${body}`
      process.stdout.write(`\x1b[2K${line}\n`)
    }
    this._linesPrinted = this.total
    this._frame++
  }
}
