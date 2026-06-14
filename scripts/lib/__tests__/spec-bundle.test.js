import { describe, it, expect } from 'vitest'
import { loadSpecBundle } from '../spec-bundle.js'

describe('loadSpecBundle', () => {
  it('returns object with 5 spec fields', () => {
    // 实际执行会读真实文件——此测试仅验证返回结构
    // 在 fixture 环境下跑
    const result = loadSpecBundle('子平真诠', '论用神', {
      projectRoot: '/Users/gaozhipeng/Desktop/mingli-research',
    })
    expect(result).toHaveProperty('specInterpretation')
    expect(result).toHaveProperty('general')
    expect(result).toHaveProperty('shuSpecial')
    expect(result).toHaveProperty('catalog')
    expect(result).toHaveProperty('sourceText')
  })

  it('throws when SPEC-interpretation.md missing', () => {
    expect(() =>
      loadSpecBundle('x', 'y', { projectRoot: '/nonexistent' })
    ).toThrow(/SPEC-interpretation\.md/)
  })

  it('loads bazi.md for 术数=命', () => {
    const result = loadSpecBundle('子平真诠', '论用神', {
      projectRoot: '/Users/gaozhipeng/Desktop/mingli-research',
    })
    expect(result.shuSpecial).toContain('子平八字')
  })
})
