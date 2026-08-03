import { describe, it, expect } from 'vitest'
import {
  INTERPRETATION_RULES,
  rulesToPromptProse,
  antiMetaPromptBlock,
} from '../interpretation-rules.js'

describe('INTERPRETATION_RULES', () => {
  it('has fatal, format, content categories', () => {
    expect(INTERPRETATION_RULES).toHaveProperty('fatal')
    expect(INTERPRETATION_RULES).toHaveProperty('format')
    expect(INTERPRETATION_RULES).toHaveProperty('content')
  })

  it('has 13 fatal rules (10 基础 + tail-truncation + stray-fence + structural-incompleteness)', () => {
    expect(INTERPRETATION_RULES.fatal).toHaveLength(13)
  })

  it('has 3 format rules', () => {
    expect(INTERPRETATION_RULES.format).toHaveLength(3)
  })

  it('every regex rule declares an explicit scope', () => {
    // scope 决定检测是否剥除块引用（原文转录）。漏标会静默回落到 'full'，
    // 可能让原文用词误判为 LLM 违规——必须显式声明，见 interpretation-rules.js scope 说明。
    for (const cat of ['fatal', 'format']) {
      for (const rule of INTERPRETATION_RULES[cat]) {
        expect(['body', 'full'], `${rule.id} scope`).toContain(rule.scope)
      }
    }
  })

  it('keeps citation/structure rules at full scope (防误改回归)', () => {
    // 这几条若被改成 'body' 会静默失效：
    // truncated-citation 以块引用为目标，tail-truncation/stray-fence 判文件级结构。
    const mustBeFull = ['truncated-citation', 'tail-truncation', 'stray-fence', 'meta-blockquote']
    for (const id of mustBeFull) {
      const rule = INTERPRETATION_RULES.fatal.find(r => r.id === id)
      expect(rule, `${id} 应存在`).toBeTruthy()
      expect(rule.scope, `${id} 必须为 full`).toBe('full')
    }
  })

  it('every rule has id, label, regex, promptDesc', () => {
    for (const cat of ['fatal', 'format']) {
      for (const rule of INTERPRETATION_RULES[cat]) {
        expect(rule).toHaveProperty('id')
        expect(rule).toHaveProperty('label')
        expect(rule).toHaveProperty('regex')
        expect(rule).toHaveProperty('promptDesc')
        // regex 可为 null（prompt-only 约束，硬匹配易误杀时）
        if (rule.regex !== null) {
          expect(rule.regex).toBeInstanceOf(RegExp)
        }
      }
    }
  })

  it('all rule ids are unique across categories', () => {
    const ids = new Set()
    for (const cat of ['fatal', 'format', 'content']) {
      for (const rule of INTERPRETATION_RULES[cat]) {
        expect(ids.has(rule.id), `duplicate rule id: ${rule.id}`).toBe(false)
        ids.add(rule.id)
      }
    }
  })
})

describe('rulesToPromptProse', () => {
  it('returns non-empty string for fatal category', () => {
    const prose = rulesToPromptProse('fatal')
    expect(typeof prose).toBe('string')
    expect(prose.length).toBeGreaterThan(0)
  })

  it('returns non-empty string for format category', () => {
    const prose = rulesToPromptProse('format')
    expect(typeof prose).toBe('string')
    expect(prose.length).toBeGreaterThan(0)
  })

  it('returns empty string for content category (v1 no rules)', () => {
    const prose = rulesToPromptProse('content')
    expect(prose).toBe('')
  })
})

describe('antiMetaPromptBlock', () => {
  it('returns a string block containing key phrases', () => {
    const block = antiMetaPromptBlock()
    expect(block).toContain('元自我引用')
    expect(block).toContain('mode_of')
    expect(block).toContain('此言……')
    expect(block).toContain('唯一正确')
  })
})
