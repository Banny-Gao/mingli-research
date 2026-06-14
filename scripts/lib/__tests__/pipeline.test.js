import { describe, it, expect } from 'vitest'
import { buildPipelinePrompt, evalComplianceScore } from '../pipeline.js'

describe('buildPipelinePrompt', () => {
  const specBundle = {
    specInterpretation: '# SPEC-interpretation content',
    general: '# general content',
    shuSpecial: '# bazi content',
    catalog: '# catalog content',
  }

  it('includes all 5 spec sections in order', () => {
    const prompt = buildPipelinePrompt({
      sourceText: '源文内容',
      condition: { 模式: '标准', 案例: '否', 注家: '否', 异文: '否', 脱漏: '否', 超长: '否' },
      specBundle,
    })
    expect(prompt).toContain('SPEC-interpretation content')
    expect(prompt).toContain('general content')
    expect(prompt).toContain('bazi content')
    expect(prompt).toContain('catalog content')
    expect(prompt).toContain('源文内容')
  })

  it('includes 9-step pipeline instructions', () => {
    const prompt = buildPipelinePrompt({
      sourceText: 'x',
      condition: { 模式: '短篇', 案例: '否', 注家: '否', 异文: '否', 脱漏: '否', 超长: '否' },
      specBundle,
    })
    expect(prompt).toContain('内容结构梳理')
    expect(prompt).toContain('逐段引用')
    expect(prompt).toContain('案例 / 分歧处理')
    expect(prompt).toContain('深化洞见')
    expect(prompt).toContain('图解补充')
    expect(prompt).toContain('自评合规分')
    expect(prompt).toContain('输出最终文件')
  })

  it('includes condition report', () => {
    const prompt = buildPipelinePrompt({
      sourceText: 'x',
      condition: { 模式: '密集', 案例: '是（2 个）', 注家: '是（任铁樵）', 异文: '是', 脱漏: '否', 超长: '否' },
      specBundle,
    })
    expect(prompt).toContain('密集')
    expect(prompt).toContain('任铁樵')
    expect(prompt).toContain('异文：是')
  })

  it('includes §七 self-evaluation instructions', () => {
    const prompt = buildPipelinePrompt({
      sourceText: 'x',
      condition: { 模式: '标准', 案例: '否', 注家: '否', 异文: '否', 脱漏: '否', 超长: '否' },
      specBundle,
    })
    expect(prompt).toContain('自评合规分')
    expect(prompt).toContain('致命错误')
    expect(prompt).toContain('格式错误')
    expect(prompt).toContain('内容检查')
  })

  it('forbids meta self-reference phrases', () => {
    const prompt = buildPipelinePrompt({
      sourceText: 'x',
      condition: { 模式: '标准', 案例: '否', 注家: '否', 异文: '否', 脱漏: '否', 超长: '否' },
      specBundle,
    })
    expect(prompt).toContain('本解读')
    expect(prompt).toContain('禁止')
  })
})

describe('evalComplianceScore', () => {
  it('returns 5 when no fatal/format/content issues', () => {
    const issues = { fatal: [], format: [], content: [] }
    expect(evalComplianceScore(issues)).toBe(5)
  })

  it('returns 4 when no fatal/format and ≤1 content issue', () => {
    const issues = { fatal: [], format: [], content: ['一项内容瑕疵'] }
    expect(evalComplianceScore(issues)).toBe(4)
  })

  it('returns 3 or below when fatal exists', () => {
    const issues = { fatal: ['元自我引用'], format: [], content: [] }
    expect(evalComplianceScore(issues)).toBeLessThanOrEqual(3)
  })

  it('returns 3 or below when format issues exist', () => {
    const issues = { fatal: [], format: ['引文未用块引用'], content: [] }
    expect(evalComplianceScore(issues)).toBeLessThanOrEqual(3)
  })

  it('returns 3 or below when content issues ≥ 2', () => {
    const issues = { fatal: [], format: [], content: ['a', 'b'] }
    expect(evalComplianceScore(issues)).toBeLessThanOrEqual(3)
  })
})
