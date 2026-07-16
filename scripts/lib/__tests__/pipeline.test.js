import { describe, it, expect } from 'vitest'
import { buildPipelinePrompt } from '../pipeline.js'

describe('buildPipelinePrompt', () => {
  const specBundle = {
    specInterpretation: '# SPEC-interpretation content',
    general: '# general content',
    shuSpecial: '# bazi content',
    catalog: '# catalog content',
  }

  it('includes 4 强装载 sections in order (catalog dropped; sourceText 升格为第 4 份强装载)', () => {
    const prompt = buildPipelinePrompt({
      sourceText: '源文内容',
      condition: { 模式: '标准', 案例: '否', 注家: '否', 异文: '否', 脱漏: '否', 超长: '否' },
      specBundle,
    })
    expect(prompt).toContain('SPEC-interpretation content')
    expect(prompt).toContain('general content')
    expect(prompt).toContain('bazi content')
    expect(prompt).toContain('源文内容')
    // catalog.md 不再注入 prompt（已被目录系统吸收）
    expect(prompt).not.toContain('catalog content')
  })

  it('includes key-rule pointer instead of full step-by-step instructions', () => {
    const prompt = buildPipelinePrompt({
      sourceText: 'x',
      condition: { 模式: '短篇', 案例: '否', 注家: '否', 异文: '否', 脱漏: '否', 超长: '否' },
      specBundle,
    })
    // 不再写死 9 步（避免与 SPEC 重复灌入膨胀 thinking 预算）
    expect(prompt).not.toContain('内容结构梳理')
    expect(prompt).not.toContain('逐段引用')
    expect(prompt).not.toContain('深化洞见')
    // 保留关键规则速查（指向 SPEC）
    expect(prompt).toContain('关键规则速查')
    expect(prompt).toContain('禁止无前置跨篇读取依据的具体跨篇断言')
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

  it('inherits self-evaluation forbidden phrases from antiMetaPromptBlock (单一数据源)', () => {
    const prompt = buildPipelinePrompt({
      sourceText: 'x',
      condition: { 模式: '标准', 案例: '否', 注家: '否', 异文: '否', 脱漏: '否', 超长: '否' },
      specBundle,
    })
    // 精简后不再硬编码「自评合规分」「Step 8 5/4/3 分制」
    // 反元 prompt 块（来自 interpretation-rules.js 单一数据源）仍提供禁用示例
    expect(prompt).not.toContain('自评合规分（0-5）')
    expect(prompt).not.toContain('Step 8')
    expect(prompt).toContain('致命错误（X 项）') // 反元块禁用示例
    expect(prompt).toContain('自我评分表')
    expect(prompt).toContain('反元自我引用硬规则')
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
