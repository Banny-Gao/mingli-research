import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSpecBundle } from '../spec-bundle.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '../../..')

describe('loadSpecBundle', () => {
  it('returns object with 4 spec fields', () => {
    // 实际执行会读真实文件——此测试仅验证返回结构
    // 在 fixture 环境下跑
    const result = loadSpecBundle('子平真诠', {
      projectRoot: PROJECT_ROOT,
    })
    expect(result).toHaveProperty('specInterpretation')
    expect(result).toHaveProperty('general')
    expect(result).toHaveProperty('shuSpecial')
    expect(result).toHaveProperty('catalog')
    // sourceText 已从 bundle 移除（per-篇 装订在 llm-batch.js）
    expect(result).not.toHaveProperty('sourceText')
  })

  it('throws when SPEC-interpretation.md missing', () => {
    expect(() =>
      loadSpecBundle('x', { projectRoot: '/nonexistent' })
    ).toThrow(/SPEC-interpretation\.md/)
  })

  it('loads bazi.md for 术数=命', () => {
    const result = loadSpecBundle('子平真诠', {
      projectRoot: PROJECT_ROOT,
    })
    expect(result.shuSpecial).toContain('子平八字')
  })
})
