/**
 * scripts/lib/self-check-lite.js — 精简版 self-check（Node 端 grep 实现）
 *
 * v1.1 覆盖：致命错误（10 类）+ 格式错误（2 类），共 12 项
 * v2 评估：是否与 self-check-interpretation subagent 合并
 *
 * 套 SPEC-interpretation.md §一.2 ❌项 5 跨篇断言 + §一.4 §6 反 AI 痕迹 +
 *      §一.1 标题反机械化 + §七 自检清单
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

  // 8. 元自我自评断言（§一.4 §6 扩展）— self-check 报告语言进解读正文
  // 检测：「无野诀 / 无自创案例 / 无断章取义 / 全部通过 / 致命错误（X 项）/ ✓/✗ 标记 / 自我评分表」
  if (/无断章取义|无野诀|无自创案例|全部通过|致命错误（\d+\s*项）|^\s*[-•]\s*(无|✓|✗|已)\s*(断章|野诀|自创|触动|触碰)|深化洞见无|✓\s*$/m.test(text)) {
    issues.fatal.push('元自我自评：含"无野诀/全部通过/致命错误（X 项）"等 self-check 报告语言')
  }

  // 9. 具体跨篇断言（§一.2 ❌项 5）
  // 检测：「前数篇论 X」「上承/下启/前承/后启」「第 X 篇」「本篇与第 X 章呼应」「后文'论 X'篇当互参」
  if (/前数篇|上承.*论|下启.*论|上承「|下启「|本篇与.*呼应|本篇与.*互参|后文['『].*['』]篇当|前\s*[一二三四五六七八九十\d]+\s*篇|第\s*[一二三四五六七八九十\d]+\s*篇/.test(text)) {
    issues.fatal.push('具体跨篇断言：含"前数篇/上承/下启/第 X 篇"等无前置依据的跨篇关联')
  }

  // 10. 跨书引述（§一.2 ❌项 5）— 除非本篇原文有直接引述
  // 检测：解读正文中引用其他书名（如《滴天髓征义》卷 X），且不在 `> 【原文】` 块内
  // 简化：检测文末/末段「《XX》卷 X」+「亦为 / 可为 / 重要参考」等措辞
  // 实际更稳妥的做法：仅检测「《XX》卷 X」+「亦 / 重要 / 参考」组合
  // 为避免误伤原典互引（沈氏自己引《滴天髓》），保守规则：检测「《XX》（卷X...）...参考」类措辞
  if (/《[^》]+》[^卷]{0,10}(?:卷\s*\d+|卷\s*[一二三四五六七八九十]+).{0,30}(?:参考|亦为|亦可|对照|参见|互参)/.test(text)) {
    issues.fatal.push('跨书引述：解读正文中引其他书"卷 X"作为参考（除非本篇原文已直接引述）')
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

  // 3. 标题机械化（§一.1 反机械化规则）— 二级标题用 source 分层标签
  // 检测：「## 原注申说」「## 原文第一段」「## 段一」等
  if (/^##\s*(原注申说|原注详解|原注释义|原文第一段|原文首段|原文末段|第\s*一\s*段|第\s*二\s*段|段[一二三四])\s*$/m.test(text)) {
    issues.format.push('标题机械化：二级标题使用 source 分层标签（应从原文关键词提炼）')
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
