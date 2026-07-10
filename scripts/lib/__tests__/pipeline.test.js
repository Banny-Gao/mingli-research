import { describe, it, expect } from 'vitest'
import { buildPipelinePrompt } from '../pipeline.js'

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

  it('references 9-step pipeline via SPEC pointers', () => {
    const prompt = buildPipelinePrompt({
      sourceText: 'x',
      condition: { 模式: '短篇', 案例: '否', 注家: '否', 异文: '否', 脱漏: '否', 超长: '否' },
      specBundle,
    })
    // v2 瘦身：9 步清单由 prompt 内的 §五指针触发，不再内联 Step 名。
    expect(prompt).toContain('§五 Step')
    expect(prompt).toContain('Step 3-4')
    expect(prompt).toContain('Step 7-9')
    // 关键行为锚点仍需显式提醒：自评门槛 + 按需撰深化洞见
    expect(prompt).toContain('≥ 4 才输出')
    expect(prompt).toContain('按需撰写深化洞见')
  })

  it('includes condition report', () => {
    const prompt = buildPipelinePrompt({
      sourceText: 'x',
      condition: {
        模式: '密集',
        案例: '是（2 个）',
        注家: '是（任铁樵）',
        异文: '是',
        脱漏: '否',
        超长: '否',
      },
      specBundle,
    })
    expect(prompt).toContain('密集')
    expect(prompt).toContain('任铁樵')
    expect(prompt).toContain('异文：是')
  })

  it('references §七 self-evaluation via SPEC pointer', () => {
    const prompt = buildPipelinePrompt({
      sourceText: 'x',
      condition: { 模式: '标准', 案例: '否', 注家: '否', 异文: '否', 脱漏: '否', 超长: '否' },
      specBundle,
    })
    // v2 瘦身：§七 自评清单由 prompt 内的 §七指针触发；
    // 自评分数阈值（≥ 4）和"按需撰深化洞见"是行为锚点，保留显式提醒。
    expect(prompt).toContain('§七')
    expect(prompt).toContain('自评 ≥ 4 才输出')
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
