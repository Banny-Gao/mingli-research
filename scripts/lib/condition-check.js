/**
 * scripts/lib/condition-check.js — 原文 6 项体检
 *
 * 套 SPEC-interpretation.md §一.1 mode_of() 函数 + §六 古籍异常场景判据
 */

/**
 * 模式判定：原文 + 原注所有非空行字符数
 * < 500 字符 = 短篇 / 500-2000 = 标准 / ≥ 2000 = 密集
 * @param {string} text
 * @returns {'短篇' | '标准' | '密集'}
 */
export function modeOf(text) {
  const n = text
    .split('\n')
    .filter(line => line.trim() && line.trim() !== '---')
    .reduce((sum, line) => sum + line.length, 0)

  if (n < 500) return '短篇'
  if (n < 2000) return '标准'
  return '密集'
}

/**
 * 6 项检查
 * @param {string} text - source.md 全文
 * @returns {{模式: string, 案例: string, 注家: string, 异文: string, 脱漏: string, 超长: string}}
 */
export function checkCondition(text) {
  const 模式 = modeOf(text)
  const 有效字符 = text.replace(/\s+/g, '').length

  // 案例：扫 命造/占例/例如/如 + 八字
  const 案例命中 = (text.match(/命造|占例|例如|如[\s\S]{0,30}八字/g) || []).length
  const 案例 = 案例命中 > 0 ? `是（${案例命中} 个）` : '否'

  // 注家：扫 > 【 块引用 或 【XX】 注家标记
  const 注家命中 = (text.match(/^>\s*【|^> 【|【[一-龥]+】/gm) || [])
  const 注家 = 注家命中.length > 0 ? `是（${注家命中.length} 处）` : '否'

  // 异文：一作 X / 异文 / 另一版本
  const 异文 = /一作|异文|另一版本|别本作/.test(text) ? '是' : '否'

  // 脱漏：【脱漏】/【残缺】/【原文此处残缺】
  const 脱漏 = /【脱漏】|【残缺】|【原文此处残缺】/.test(text) ? '是' : '否'

  // 超长：有效正文字符 > 5000
  const 超长 = 有效字符 > 5000 ? `是（${有效字符} 字符）` : '否'

  return { 模式, 案例, 注家, 异文, 脱漏, 超长 }
}