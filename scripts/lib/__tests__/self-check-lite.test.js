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

  // === 结构完整性检测（structural-incompleteness）===

  it('detects structural incompleteness: effective body < 600 chars (天道 truncated form)', () => {
    // 天道篇截断形态：3 节、有效正文 513 字符 < 600 → 命中篇幅检测
    const body = '此二句为开篇立纲，以条件句式定下全篇取径，宗字引申为统摄归向，万法以三元为所归。'.repeat(2)
    const text = `## 三元万法之宗\n\n> 【原文】欲识三元万法宗，先观帝载与神功。\n\n${body}\n\n## 帝载神功\n\n> 【原注】天有阴阳，故春木、夏火、秋金、冬水、季土，随时显其神功。\n\n${body}\n\n## 天道开篇\n\n${body}`
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
    expect(result.issues.fatal.some(i => i.includes('结构残缺'))).toBe(true)
    expect(result.score).toBeLessThan(4) // 触发重写
  })

  it('passes structural check: effective body ≥ 600 chars (君象 normal form)', () => {
    // 君象篇正常形态：有效正文 > 600 → 篇幅达标，不判残缺
    const body = '此造与上造对比鲜明，群比争财之象已成，局中偏偏缺火以行之，木之气机无从泄化，臣也得不到生拱之实益，任氏判其为上安而下难全。'.repeat(12)
    const text = `## 君象\n\n> 【原文】君盛臣衰。\n\n${body}\n\n## 本篇在体系中之笼统位置\n\n本篇以「日主为君、官杀为臣」之人伦为喻，专论君盛臣衰的格局取用法。`
    const result = runSelfCheckLite(text)
    expect(result.issues.fatal.some(i => i.includes('结构残缺'))).toBe(false)
  })

  it('skips structural check for minimal fixtures (< 100 effective chars)', () => {
    // 单测最小夹具/边界输入（< 100 字符）豁免结构检测，不误判残缺
    const text = '## 标题\n\n> 【原文】原文整句。\n\n解读正文。'
    const result = runSelfCheckLite(text)
    expect(result.issues.fatal.some(i => i.includes('结构残缺'))).toBe(false)
  })

  // === 结构覆盖检测（structural-coverage，长文场景）===

  it('detects structural coverage gap: intr ##/src ## < 60% (天干 truncated form)', () => {
    // 天干篇残缺形态：source 10 个 ##（十天干），intr 只覆盖辛壬癸 + 统会（4 个 ##）
    const source = [
      '## 甲木', '## 乙木', '## 丙火', '## 丁火', '## 戊土',
      '## 己土', '## 庚金', '## 辛金', '## 壬水', '## 癸水',
    ].join('\n\n')
    const body = '辛金软弱温润而清，畏土之叠乐水之盈，论命者见辛金透干须辨其与丙合化之机。'.repeat(4)
    const intr = [
      '## 辛金软弱，温润而清', `> 【原文】辛金软弱。\n\n${body}`,
      '## 壬水通河，周流不滞', `> 【原文】壬水通河。\n\n${body}`,
      '## 癸水至弱，达于天津', `> 【原文】癸水至弱。\n\n${body}`,
      '## 全篇之统会', `${body}`,
    ].join('\n\n')
    const result = runSelfCheckLite(intr, source)
    expect(result.fatal).toBeGreaterThan(0)
    expect(result.issues.fatal.some(i => i.includes('结构覆盖缺失'))).toBe(true)
    // issue 应列出 source 全部 ## 节名作为"应覆盖清单"（含甲木、乙木...）
    expect(result.issues.fatal.some(i => i.includes('甲木'))).toBe(true)
    expect(result.issues.fatal.some(i => i.includes('癸水'))).toBe(true)
    expect(result.score).toBeLessThan(4) // 触发重写
  })

  it('passes structural coverage: intr ##/src ## ≥ 60% (何知 normal form)', () => {
    // 何知篇正常形态：source 8 个 ##，intr 9 个 ##（LLM 改写标题，但数量达标）→ 不命中
    const source = [
      '## 何知其人富', '## 何知其人贵', '## 何知其人贫', '## 何知其人贱',
      '## 何知其人吉', '## 何知其人凶', '## 何知其人寿', '## 何知其人夭',
    ].join('\n\n')
    const body = '财气通门户官星有理会，论命者见此当辨财官之清浊与气势之顺逆。'.repeat(4)
    const intr = [
      '## 财气通门户', body, '## 官星有理会', body, '## 财神反不真', body, '## 官星还不见', body,
      '## 喜神为辅弼', body, '## 忌神辗转攻', body, '## 性定元神厚', body, '## 气浊神枯了', body,
      '## 命局吉凶对照图', body,
    ].join('\n\n')
    const result = runSelfCheckLite(intr, source)
    expect(result.issues.fatal.some(i => i.includes('结构覆盖缺失'))).toBe(false)
  })

  it('skips coverage check when source ## < 5 (短篇不适用)', () => {
    // source 仅 3 个 ##（< 5）→ 跳过覆盖检测，即使 intr 只有 1 个 ## 也不命中
    const source = '## 甲木\n\n## 乙木\n\n## 丙火'
    const body = '此篇以两造对看把君象之法从抽象理论落到具体命局，论命者当细辨君臣之强弱与火以行之枢机。'.repeat(8)
    const intr = `## 全篇统会\n\n${body}`
    const result = runSelfCheckLite(intr, source)
    expect(result.issues.fatal.some(i => i.includes('结构覆盖缺失'))).toBe(false)
  })

  it('skips coverage check when source not passed (向后兼容)', () => {
    // 不传 source 参数 → 覆盖检测不触发（向后兼容现有调用方）
    const body = '此造与上造对比鲜明，群比争财之象已成，局中偏偏缺火以行之。'.repeat(12)
    const text = `## 辛金软弱\n\n> 【原文】辛金。\n\n${body}\n\n## 全篇之统会\n\n${body}`
    const result = runSelfCheckLite(text) // 不传 source
    expect(result.issues.fatal.some(i => i.includes('结构覆盖缺失'))).toBe(false)
  })
})
