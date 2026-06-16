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

  it('has 12 fatal rules (10 基础 + tail-truncation + stray-fence)', () => {
    expect(INTERPRETATION_RULES.fatal).toHaveLength(12)
  })

  it('has 3 format rules', () => {
    expect(INTERPRETATION_RULES.format).toHaveLength(3)
  })

  it('every rule has id, label, regex, promptDesc', () => {
    for (const cat of ['fatal', 'format']) {
      for (const rule of INTERPRETATION_RULES[cat]) {
        expect(rule).toHaveProperty('id')
        expect(rule).toHaveProperty('label')
        expect(rule).toHaveProperty('regex')
        expect(rule).toHaveProperty('promptDesc')
        expect(rule.regex).toBeInstanceOf(RegExp)
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
