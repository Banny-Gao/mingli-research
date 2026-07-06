/**
 * scripts/lib/shared/prompt.js — 自适配 prompt 工具
 *
 * 问题背景：inquirer 的 select / search / confirm 等 TUI prompt 在
 * 非 TTY 环境（Git Bash on Tabby、某些 IDE 终端、CI 子进程）下会丢键入，
 * 立即触发 ExitPromptError。
 *
 * 设计：检测 process.stdin.isTTY + process.stdout.isTTY，
 *  - 都为 true → 走 inquirer select（方向键原生体验）
 *  - 任一为 false/ undefined → 降级 input + 关键词匹配（零依赖方向键）
 *
 * 在 select 选项少于 8 个时，input 模式更省事（无需看完整列表）；
 * 选项多时可附 search 过滤（在 input 模式下用 substring 模糊匹配 name）。
 */

import { select, input, confirm } from '@inquirer/prompts'

const HAS_FULL_TTY =
  Boolean(process.stdin.isTTY) && Boolean(process.stdout.isTTY)

/**
 * 把选项转为可打印的"编号 list"，非 TTY 模式下作为辅助提示打印。
 */
function printChoices(message, choices) {
  // 只列 value 不带 name 的 disabled 分隔项
  let i = 1
  console.log(`\n${message}`)
  for (const c of choices) {
    if (c.value == null || c.disabled) continue
    const desc = c.description ? ` — ${c.description}` : ''
    console.log(`   ${i}. ${c.name}${desc}`)
    i++
  }
  console.log('')
}

/**
 * 关键词匹配规则化：中文 / 拼音首字母 / 简单 substring。
 * 把选项 value、name、description 都纳入匹配集合（不区分大小写）。
 */
function buildMatcher(question) {
  const lcChoices = question.choices
    .map((c, idx) => ({
      ...c,
      idx: idx + 1,
      haystack: `${c.name || ''} ${c.description || ''} ${c.value || ''}`
        .toLowerCase()
        .replace(/\s+/g, ''),
    }))
    .filter(c => c.value != null && !c.disabled)

  return ans => {
    const t = (ans || '').trim().toLowerCase().replace(/\s+/g, '')
    if (!t) return null
    // 1. 数字精确（"1"、"2"）
    const n = Number(t)
    if (Number.isInteger(n) && n >= 1 && n <= lcChoices.length) {
      return lcChoices[n - 1]
    }
    // 2. value 精确（"character" / "character,"）
    for (const c of lcChoices) {
      if ((c.value || '').toLowerCase() === t) return c
      if ((c.name || '').toLowerCase() === t) return c
    }
    // 3. substring 模糊（name / value / description 任一含）
    const fuzzy = lcChoices.find(c => c.haystack.includes(t))
    return fuzzy || null
  }
}

/**
 * 自适配 select：在 TTY 下用 inquirer，在非 TTY 下走 input + 数字/关键词匹配。
 *
 * @param {object} q - inquirer select 兼容的 question 对象
 * @returns {Promise<any>}
 */
export async function smartSelect(q) {
  if (HAS_FULL_TTY) {
    return select(q)
  }
  printChoices(q.message, q.choices)
  const match = buildMatcher(q)
  while (true) {
    const ans = await input({ message: `输入编号 / 名称 / 关键词（默认 ${q.default != null ? q.default : '回车选首个'}）：` })
    const m = match(ans || String(q.default ?? ''))
    if (m) return m.value
    if (!ans && q.default != null) return q.default
    console.log(`   ⚠️  无法识别 "${ans}"，请重试`)
  }
}

/**
 * 自适配 confirm：TTY 下用 inquirer；非 TTY 用 input + y/n 字符。
 */
export async function smartConfirm(q) {
  if (HAS_FULL_TTY) return confirm(q)
  while (true) {
    const ans = (
      await input({ message: `${q.message} (y/n, ${q.default ? '默认 y' : '默认 n'}):` })
    )
      .trim()
      .toLowerCase()
    if (!ans) return Boolean(q.default)
    if (ans === 'y' || ans === 'yes' || ans === '是' || ans === '好') return true
    if (ans === 'n' || ans === 'no' || ans === '否' || ans === '不') return false
    console.log('   ⚠️  请回答 y 或 n')
  }
}

export { HAS_FULL_TTY }
