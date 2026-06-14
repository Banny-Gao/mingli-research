import { describe, it, expect } from 'vitest'
import { runSelfCheckLite } from '../self-check-lite.js'

describe('runSelfCheckLite', () => {
  it('returns 0 fatal for clean text', () => {
    const text = '## 标题\n\n> 【原文】原文整句。\n\n解读正文。\n\n## 另一节\n\n> 【原注】注整句。\n\n解读续。'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBe(0)
    expect(result.issues.fatal).toEqual([])
  })

  it('detects meta self-reference (fatal)', () => {
    const text = '本解读不展开具体跨篇断言。'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
    expect(result.issues.fatal.some(i => i.includes('本解读'))).toBe(true)
  })

  it('detects pipeline jargon (fatal)', () => {
    const text = '按 SPEC §1.2 规则处理。'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
  })

  it('detects meta self-label with 【】 (fatal)', () => {
    const text = '【本解读不展开】此处略。'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
  })

  it('detects mode_of jargon (fatal)', () => {
    const text = 'mode_of() 返回标准。'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
  })

  it('detects meta blockquote header (fatal)', () => {
    const text = '> **本篇模式**\n> 标准'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
  })

  it('detects missing blockquote for cited text (format)', () => {
    const text = '【原文】原文整句。\n\n解读。' // 缺 > 块引用
    const result = runSelfCheckLite(text)
    expect(result.issues.format.length).toBeGreaterThan(0)
  })

  it('detects 自创案例 marker (fatal)', () => {
    // 自创案例典型：以"试举一例"开头但无【命造】标注
    const text = '## 试举一例\n\n试造：甲子 乙丑 丙寅 丁卯。\n\n此造身旺。'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
  })

  it('detects 独立白话行 (format)', () => {
    const text = '> 【原文】原文整句。\n\n【白话】白话解释。\n\n解读。'
    const result = runSelfCheckLite(text)
    expect(result.issues.format.some(i => i.includes('白话'))).toBe(true)
  })

  it('returns score property', () => {
    const text = '## 标题\n\n> 【原文】原文整句。\n\n解读。'
    const result = runSelfCheckLite(text)
    expect(typeof result.score).toBe('number')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(5)
  })

  it('detects Chinese ellipsis truncation (fatal)', () => {
    // 中文省略号 …… 是 2 字符，ASCII … 是单字符 → 不能用字符类量化器
    const text = '> 【原注】此段……'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
    expect(result.issues.fatal.some(i => i.includes('截取半句'))).toBe(true)
  })

  it('detects ASCII ellipsis truncation (fatal)', () => {
    // ASCII 三点省略号 ... 回归测试（rule 7 主用例）
    const text = '> 【原文】此句...'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
    expect(result.issues.fatal.some(i => i.includes('截取半句'))).toBe(true)
  })

  it('detects meta self-eval assertions (fatal — rule 8)', () => {
    const text = '## 解读\n\n本篇无野诀 ✓\n无断章取义。\n深化洞见无野诀 ✓'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
    expect(result.issues.fatal.some(i => i.includes('元自我自评'))).toBe(true)
  })

  it('detects self-check report language (fatal — rule 8)', () => {
    const text = '## 自评表\n\n| 致命错误（8 项） | 全部通过——无截取半句 |'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
    expect(result.issues.fatal.some(i => i.includes('元自我自评'))).toBe(true)
  })

  it('detects cross-chapter specific assertions (fatal — rule 9)', () => {
    const text = '## 全书定位\n\n前数篇论用神成败、变化、纯杂，至此则论 X。'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
    expect(result.issues.fatal.some(i => i.includes('具体跨篇断言'))).toBe(true)
  })

  it('detects explicit chapter position cross-refs (fatal — rule 9)', () => {
    const text = '## 定位\n\n本篇与第 31 章呼应。\n上承"用神论"之通论，下启"各格详论"。'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
    expect(result.issues.fatal.some(i => i.includes('具体跨篇断言'))).toBe(true)
  })

  it('detects cross-book citation (fatal — rule 10)', () => {
    const text = '## 旁参\n\n《滴天髓征义》卷五亦为重要参考。'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
    expect(result.issues.fatal.some(i => i.includes('跨书引述'))).toBe(true)
  })

  it('detects mechanical section-label headings (format — rule 11)', () => {
    const text = '## 原注申说\n\n> 【原注】注整句。\n\n解读。\n\n## 段一\n\n更多解读。'
    const result = runSelfCheckLite(text)
    expect(result.issues.format.some(i => i.includes('标题机械化'))).toBe(true)
  })

  it('detects §七 self-eval section reproduction (fatal — rule 8 hardened)', () => {
    const text = `## 解读

正文内容。

## 6. 自评合规分

**致命错误**：0 项
- 无断章取义、无野诀。

**格式错误**：0 项

**内容检查**：0 项
`
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
    expect(result.issues.fatal.some(i => i.includes('元自我自评'))).toBe(true)
  })

  it('detects 前承/后启 cross-chapter assertions (fatal — rule 9 hardened)', () => {
    const text = '## 定位\n\n前承《论X》之基础，后启《论Y》《论Z》等篇章。'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
    expect(result.issues.fatal.some(i => i.includes('具体跨篇断言'))).toBe(true)
  })

  it('detects 前承/「」 fullwidth-quoted chapter-name evasion (fatal — rule 9 hardened R3)', () => {
    const text1 = '## 定位\n\n前承《论X》之基础，后启《论Y》《论Z》。'
    const text2 = '## 定位\n\n前承「论X」「论Y」之铺垫，后启「论Z」之深入。'
    const text3 = '## 定位\n\n前承正官、财、印诸格之详论。'
    const text4 = '## 定位\n\n前承格局通论之大要。'
    const text5 = '## 定位\n\n前承论正官之法，后启论伤官、阳刃诸格。'

    for (const text of [text1, text2, text3, text4, text5]) {
      const r = runSelfCheckLite(text)
      expect(r.fatal, `expected fatal for: ${text.slice(0, 40)}...`).toBeGreaterThan(0)
      expect(r.issues.fatal.some(i => i.includes('具体跨篇断言'))).toBe(true)
    }
  })

  it('allows clean 笼统 chapter-position phrases (no false positive — rule 9 hardened R3)', () => {
    const text = '## 定位\n\n本书承用神取用之大端而进论成败救应之机；为后续格局详论之具应用开其端。子平之通论与命理通则之常法，于此可见一斑。'
    const result = runSelfCheckLite(text)
    expect(result.issues.fatal.some(i => i.includes('具体跨篇断言'))).toBe(false)
  })
})
