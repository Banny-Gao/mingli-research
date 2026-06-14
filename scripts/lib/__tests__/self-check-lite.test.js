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
})
