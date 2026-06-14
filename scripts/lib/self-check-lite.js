/**
 * scripts/lib/self-check-lite.js — 精简版 self-check（Node 端 grep 实现）
 *
 * v1 覆盖：致命错误（7 类）+ 格式错误（2 类），共 9 项
 * v2 评估：是否与 self-check-interpretation subagent 合并
 *
 * 套 SPEC-interpretation.md §一.4 §6 反 AI 痕迹 + §七 自检清单
 */

/**
 * @param {string} text - interpretation.md 全文
 * @returns {{fatal: number, score: number, issues: {fatal: string[], format: string[], content: string[]}}}
 */
export function runSelfCheckLite(text) {
  const issues = { fatal: [], format: [], content: [] }

  // === 致命错误（7 类） ===

  // 1. 元自我引用
  if (/本解读|本文(?!化|体)|本篇解读/.test(text)) {
    issues.fatal.push('元自我引用：含"本解读"等元表态')
  }

  // 2. 元自我标签（带【】的元标签）
  if (/【本解读|【本文|【本篇解读|【此处略】|【录入注】/.test(text)) {
    issues.fatal.push('元自我标签：含【本解读...】等元标签')
  }

  // 3. 流水线术语
  if (/mode_of\(|SPEC §\d|按 SPEC 公式判为|按用户口径|按标准档组织/.test(text)) {
    issues.fatal.push('流水线术语：含 mode_of()/SPEC §X.X 等内部术语')
  }

  // 4. 元数据块（文首）
  if (/^>\s*\*\*本篇模式\*\*|^>\s*\*\*模式判定\*\*|^>\s*\*\*体量定位\*\*|^>\s*\*\*mode_of\*\*/m.test(text)) {
    issues.fatal.push('元数据块：文首含"**本篇模式**"等元数据 blockquote')
  }

  // 5. 自创案例（"试举一试"+"试造"标记）
  if (/试举一试|试造[：:]|今试拟一|虚拟一造|姑且试一/.test(text)) {
    issues.fatal.push('自创案例：含"试造"/"虚拟一造"等自创案例标记')
  }

  // 6. 流派武断（"唯一正确"绝对定论）
  if (/唯一正确|绝对正确|毫无疑义|无可争议/.test(text)) {
    issues.fatal.push('流派武断：含"唯一正确"等绝对定论')
  }

  // 7. 截取半句引文
  // 简化检测：若一行以 "...。" 或 "……" 结尾且下一行是解读，疑似截取。
  // 须同时匹配 ASCII 三点省略号 (...，3 字符) 和中文省略号 (……，2 字符)，
  // 二者长度不同故不能用字符类量化器 [^…\.]{3}，须用显式 alternation。
  if (/>\s*【[^】]+】[^。\n]*(?:\.{3}|……)/.test(text)) {
    issues.fatal.push('截取半句引文：引文含 ... 或 …… 疑似截断')
  }

  // === 格式错误（2 类） ===

  // 1. 缺块引用（疑似引文未用 `>` 包裹）
  if (/^【原文】|^【原注】|^【诸家评】/m.test(text)) {
    issues.format.push('引文未用 `>` 块引用包裹')
  }

  // 2. 独立【白话】行
  if (/^【白话】/m.test(text)) {
    issues.format.push('独立【白话】行（应融入写作语言）')
  }

  // === 计算 score ===
  const fatal = issues.fatal.length
  const format = issues.format.length
  let score
  if (fatal > 0 || format > 0) score = 3
  else if (issues.content.length === 0) score = 5
  else if (issues.content.length === 1) score = 4
  else score = 3

  return { fatal, score, issues }
}
