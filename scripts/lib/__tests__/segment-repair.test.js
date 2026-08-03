import { describe, it, expect } from 'vitest'
import {
  splitSegments,
  locateRuleHits,
  planRepair,
  buildSegmentRepairPrompt,
  isRepairAcceptable,
  applySegmentRepairs,
} from '../segment-repair.js'
import { runSelfCheckLite } from '../self-check-lite.js'

const LONG = '此言方局与三合之别，论命者当细辨其气之专杂与势之顺逆，方不致误判用神。'

describe('splitSegments', () => {
  it('splits by ## headings', () => {
    const text = '## 甲\n\nA 段内容。\n\n## 乙\n\nB 段内容。'
    const segs = splitSegments(text)
    expect(segs).toHaveLength(2)
    expect(segs[0].heading).toBe('甲')
    expect(segs[1].heading).toBe('乙')
    expect(segs[0].text).toContain('A 段内容')
    expect(segs[1].text).toContain('B 段内容')
  })

  it('captures preamble before first ## as heading-null segment', () => {
    const text = '> **定位**：卷二 · 第 105 篇\n\n## 甲\n\nA 段。'
    const segs = splitSegments(text)
    expect(segs).toHaveLength(2)
    expect(segs[0].heading).toBeNull()
    expect(segs[0].text).toContain('定位')
    expect(segs[1].heading).toBe('甲')
  })

  it('treats text with no ## as a single segment', () => {
    const segs = splitSegments('没有标题的正文。')
    expect(segs).toHaveLength(1)
    expect(segs[0].heading).toBeNull()
  })

  it('segment offsets slice back to the original text', () => {
    const text = '## 甲\n\nA。\n\n## 乙\n\nB。'
    for (const s of splitSegments(text)) {
      expect(text.slice(s.start, s.end)).toBe(s.text)
    }
  })

  it('returns [] for empty input', () => {
    expect(splitSegments('')).toEqual([])
  })
})

describe('locateRuleHits', () => {
  it('locates a body-scope violation to its line', () => {
    const text = `## 甲\n\n${LONG}\n\n## 乙\n\n本解读认为此句为纲。`
    const { hits } = locateRuleHits(text)
    const hit = hits.find(h => h.ruleId === 'meta-self-ref')
    expect(hit).toBeTruthy()
    expect(hit.lineText).toContain('本解读')
  })

  it('ignores body-scope hits inside blockquotes (原文转录豁免)', () => {
    const text = `## 甲\n\n> 【任氏曰】此造正合本文成局。\n\n${LONG}`
    const { hits } = locateRuleHits(text)
    expect(hits.some(h => h.ruleId === 'meta-self-ref')).toBe(false)
  })

  it('locates full-scope citation violation inside a blockquote', () => {
    const text = `## 甲\n\n> 【原文】禄命之学，不详所自起……此其大略也。\n\n${LONG}`
    const { hits } = locateRuleHits(text)
    expect(hits.some(h => h.ruleId === 'truncated-citation')).toBe(true)
  })

  it('reports unlocatable when file-level rule matches no single line', () => {
    // stray-fence 以 \n``` 锚定文件末，逐行扫描定位不到 → 应进 unlocatable
    const text = `## 甲\n\n${LONG}\n\`\`\``
    const { unlocatable } = locateRuleHits(text)
    expect(unlocatable).toContain('stray-fence')
  })

  it('returns no hits for clean text', () => {
    const text = `## 甲\n\n${LONG}\n\n## 乙\n\n${LONG}`
    expect(locateRuleHits(text).hits).toHaveLength(0)
  })
})

describe('planRepair', () => {
  it('plans a repair targeting only the offending segment', () => {
    const text = `## 甲\n\n${LONG.repeat(6)}\n\n## 乙\n\n${LONG.repeat(6)}\n\n## 丙\n\n本解读认为此为纲。${LONG.repeat(5)}`
    const plan = planRepair(text, runSelfCheckLite(text))
    expect(plan.repairable).toBe(true)
    expect(plan.segments).toHaveLength(1)
    expect(plan.segments[0].heading).toBe('丙')
    expect(plan.segments[0].issues[0].ruleId).toBe('meta-self-ref')
  })

  it('refuses structural incompleteness — 内容缺失按段修无解', () => {
    const text = '## 甲\n\n短。'
    const check = { issues: { fatal: ['结构残缺：有效正文仅 120 字符（< 600）'], format: [] } }
    const plan = planRepair(text, check)
    expect(plan.repairable).toBe(false)
    expect(plan.reason).toContain('结构')
  })

  it('refuses structural coverage gap — 同属内容缺失', () => {
    const text = '## 甲\n\n内容。'
    const check = { issues: { fatal: ['结构覆盖缺失：intr ##/src ## = 4/10 = 40%'], format: [] } }
    const plan = planRepair(text, check)
    expect(plan.repairable).toBe(false)
    expect(plan.reason).toContain('结构')
  })

  it('refuses when affected segments exceed the ratio cap (系统性偏差)', () => {
    // 3 段里 2 段有问题（67% > 50%）→ 退回整篇重生成
    const text = `## 甲\n\n本解读云。${LONG.repeat(8)}\n\n## 乙\n\n本解读又云。${LONG.repeat(8)}\n\n## 丙\n\n${LONG.repeat(8)}`
    const plan = planRepair(text, runSelfCheckLite(text))
    expect(plan.repairable).toBe(false)
    expect(plan.reason).toContain('系统性偏差')
  })

  it('refuses when rule hit cannot be localized', () => {
    const text = `## 甲\n\n${LONG.repeat(10)}\n\n## 乙\n\n${LONG.repeat(10)}\n\`\`\``
    const plan = planRepair(text, runSelfCheckLite(text))
    expect(plan.repairable).toBe(false)
    expect(plan.reason).toContain('无法定位')
  })

  it('attributes a preamble hit to the preamble segment', () => {
    const text = `> 原文体量：按标准档组织\n\n## 甲\n\n${LONG.repeat(10)}\n\n## 乙\n\n${LONG.repeat(10)}`
    const plan = planRepair(text, runSelfCheckLite(text))
    expect(plan.repairable).toBe(true)
    expect(plan.segments[0].heading).toBeNull()
    expect(plan.segments[0].issues.some(i => i.ruleId === 'pipeline-jargon')).toBe(true)
  })
})

describe('buildSegmentRepairPrompt', () => {
  const segment = {
    heading: '丙',
    text: '## 丙\n\n本解读认为此为纲。',
    issues: [{ label: '元自我引用', promptDesc: '「本解读」等', lineText: '本解读认为此为纲。' }],
  }

  it('includes the segment, its rules and the source', () => {
    const p = buildSegmentRepairPrompt(segment, '# 原文\n\n源文内容。')
    expect(p).toContain('本解读认为此为纲')
    expect(p).toContain('元自我引用')
    expect(p).toContain('源文内容')
    expect(p).toContain('丙')
  })

  it('instructs to return only the segment and preserve transcription', () => {
    const p = buildSegmentRepairPrompt(segment, '源文')
    expect(p).toContain('只返回修改后的这一段')
    expect(p).toContain('不得改动块引用')
  })
})

describe('isRepairAcceptable', () => {
  it('accepts a same-length repair', () => {
    expect(isRepairAcceptable('## 甲\n\n' + LONG, '## 甲\n\n' + LONG).ok).toBe(true)
  })

  it('rejects a repair that drops most of the content (防 LLM 删内容)', () => {
    const r = isRepairAcceptable('## 甲\n\n' + LONG.repeat(10), '## 甲\n\n短。')
    expect(r.ok).toBe(false)
    expect(r.reason).toContain('删减')
  })

  it('rejects a repair that drops the ## heading (标题保留校验)', () => {
    // 修复段丢了「## 甲」标题行 → 即使长度足够也应拒绝，防止静默吞掉小节
    const r = isRepairAcceptable('## 甲\n\n' + LONG.repeat(5), LONG.repeat(5))
    expect(r.ok).toBe(false)
    expect(r.reason).toContain('标题')
  })

  it('rejects a repair that changes the ## heading', () => {
    const r = isRepairAcceptable('## 甲\n\n' + LONG.repeat(5), '## 乙\n\n' + LONG.repeat(5))
    expect(r.ok).toBe(false)
    expect(r.reason).toContain('标题')
  })

  it('accepts a repair that keeps the heading (preamble 段无标题不误伤)', () => {
    // 引言段（heading 为 null）没有 ## 标题 → 不触发标题校验
    const r = isRepairAcceptable('> **定位**：卷二。\n\n' + LONG.repeat(3), '> **定位**：卷二。\n\n' + LONG.repeat(3))
    expect(r.ok).toBe(true)
  })

  it('rejects an empty repair', () => {
    expect(isRepairAcceptable('## 甲\n\n' + LONG, '   ').ok).toBe(false)
  })
})

describe('applySegmentRepairs', () => {
  it('replaces only the targeted segment, leaving others byte-identical', () => {
    const text = '## 甲\n\nA 段内容。\n\n## 乙\n\nB 段内容。\n\n## 丙\n\nC 段内容。'
    const out = applySegmentRepairs(text, [{ segIndex: 1, repaired: '## 乙\n\nB 段已修。' }])
    expect(out).toContain('A 段内容。')
    expect(out).toContain('B 段已修。')
    expect(out).not.toContain('B 段内容。')
    expect(out).toContain('C 段内容。')
  })

  it('applies multiple repairs without offset drift', () => {
    const text = '## 甲\n\nA。\n\n## 乙\n\nB。\n\n## 丙\n\nC。'
    const out = applySegmentRepairs(text, [
      { segIndex: 0, repaired: '## 甲\n\nA 修。' },
      { segIndex: 2, repaired: '## 丙\n\nC 修。' },
    ])
    expect(out).toContain('A 修。')
    expect(out).toContain('B。')
    expect(out).toContain('C 修。')
    expect(out).not.toContain('A。\n')
  })

  it('round-trips: repaired output passes self-check (方局 死局场景)', () => {
    const text = `## 甲\n\n${LONG.repeat(6)}\n\n## 乙\n\n${LONG.repeat(6)}\n\n## 丙\n\n本解读认为此为纲。${LONG.repeat(5)}`
    expect(runSelfCheckLite(text).score).toBeLessThan(4)
    const plan = planRepair(text, runSelfCheckLite(text))
    const fixed = applySegmentRepairs(text, [
      { segIndex: plan.segments[0].segIndex, repaired: `## 丙\n\n此为纲。${LONG.repeat(5)}` },
    ])
    expect(runSelfCheckLite(fixed).score).toBeGreaterThanOrEqual(4)
    // 未受影响的段落逐字保留
    expect(fixed).toContain(`## 甲\n\n${LONG.repeat(6)}`)
  })

  it('ignores unknown segIndex', () => {
    const text = '## 甲\n\nA。'
    expect(applySegmentRepairs(text, [{ segIndex: 99, repaired: 'X' }])).toBe(text)
  })
})
