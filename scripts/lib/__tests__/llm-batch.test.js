import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateInterpretations } from '../llm-batch.js'

// Mock @anthropic-ai/sdk
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: '## 标题\n\n> 【原文】原文。\n\n解读。' }],
      }),
    },
  })),
}))

const FAKE_BUNDLE = {
  specInterpretation: '# SPEC',
  general: '# general',
  shuSpecial: '# bazi',
  catalog: '# catalog',
  sourceText: '# 论用神\n\n正文内容。',
}

const FAKE_CONFIG = {
  apiKey: 'sk-test',
  baseUrl: 'https://api.test',
  model: 'claude-opus-4-8',
}

describe('generateInterpretations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns success array for one chapter', async () => {
    const results = await generateInterpretations({
      slug: '子平真诠',
      chapters: ['论用神'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: '/Users/gaozhipeng/Desktop/mingli-research',
      force: true,
    })
    expect(results).toHaveLength(1)
    expect(results[0].chapter).toBe('论用神')
    expect(results[0].status).toBe('success')
  })

  it('skips chapter when source.md missing', async () => {
    const results = await generateInterpretations({
      slug: '子平真诠',
      chapters: ['不存在的篇章'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: '/Users/gaozhipeng/Desktop/mingli-research',
      force: true,
    })
    expect(results[0].status).toBe('skipped')
    expect(results[0].reason).toContain('source')
  })

  it('skips chapter when interpretation.md exists and !force', async () => {
    // 假设 论用神 已有 interpretation.md（在 fixture 中）
    const results = await generateInterpretations({
      slug: '子平真诠',
      chapters: ['论用神'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: '/Users/gaozhipeng/Desktop/mingli-research',
      force: false,
    })
    expect(results[0].status).toBe('skipped')
    expect(results[0].reason).toContain('exists')
  })

  it('invokes onProgress callback per chapter', async () => {
    const onProgress = vi.fn()
    await generateInterpretations({
      slug: '子平真诠',
      chapters: ['论用神'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: '/Users/gaozhipeng/Desktop/mingli-research',
      force: true,
      onProgress,
    })
    expect(onProgress).toHaveBeenCalledWith(1, 1, '论用神', expect.any(String))
  })

  it('retries 3 times on 429 rate limit', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    let callCount = 0
    Anthropic.mockImplementation(() => ({
      messages: {
        create: vi.fn().mockImplementation(() => {
          callCount++
          if (callCount < 3) {
            const err = new Error('Rate limit')
            err.status = 429
            return Promise.reject(err)
          }
          return Promise.resolve({
            content: [{ type: 'text', text: '## 标题\n\n> 【原文】原文。\n\n解读。' }],
          })
        }),
      },
    }))

    const results = await generateInterpretations({
      slug: '子平真诠',
      chapters: ['论用神'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: '/Users/gaozhipeng/Desktop/mingli-research',
      force: true,
      retryBaseMs: 1,
    })
    expect(callCount).toBe(3)
    expect(results[0].status).toBe('success')
  })
})
