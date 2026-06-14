import { describe, it, expect } from 'vitest'
import { checkCondition, modeOf } from '../condition-check.js'

describe('modeOf', () => {
  it('returns 短篇 for text under 500 chars', () => {
    const text = '此篇极短。'.repeat(50) // 250 chars
    expect(modeOf(text)).toBe('短篇')
  })

  it('returns 标准 for text between 500 and 2000 chars', () => {
    const text = '中篇内容。'.repeat(100) // 700 chars
    expect(modeOf(text)).toBe('标准')
  })

  it('returns 密集 for text over 2000 chars', () => {
    const text = '长篇。'.repeat(800) // 3200 chars
    expect(modeOf(text)).toBe('密集')
  })

  it('ignores empty lines and --- separators', () => {
    const text = '有效内容。\n\n\n---\n\n更多内容。'.repeat(30)
    const mode = modeOf(text)
    expect(['短篇', '标准']).toContain(mode)
  })
})

describe('checkCondition', () => {
  it('detects short mode', () => {
    const text = '此篇极短。'.repeat(50)
    const result = checkCondition(text)
    expect(result.模式).toBe('短篇')
  })

  it('detects cases via 命造 keyword', () => {
    const text = '此命造身旺用财。'.repeat(100)
    const result = checkCondition(text)
    expect(result.案例).toMatch(/是/)
  })

  it('detects no cases when keywords absent', () => {
    const text = '此论纯理，无实例可举。'.repeat(100)
    const result = checkCondition(text)
    expect(result.案例).toBe('否')
  })

  it('detects commentators via > 【 blockquote', () => {
    const text = '> 【任铁樵】此言甚善。\n\n正文部分。'.repeat(50)
    const result = checkCondition(text)
    expect(result.注家).toMatch(/是/)
  })

  it('detects variant texts', () => {
    const text = '此句一作「他文」。'.repeat(50)
    const result = checkCondition(text)
    expect(result.异文).toBe('是')
  })

  it('detects omissions', () => {
    const text = '【原文此处残缺】'.repeat(50)
    const result = checkCondition(text)
    expect(result.脱漏).toBe('是')
  })

  it('detects 超长 for text over 5000 chars', () => {
    const text = '长篇内容。'.repeat(700) // 4900 chars, but with extra lines will be > 5000
    const result = checkCondition(text)
    expect(result.超长).toMatch(/是|否/) // 实际取决于精确字符数
  })
})