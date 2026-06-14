import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
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

const TEST_SLUG = 'test-book'
const TEST_CHAPTER = 'test-chapter'

describe('generateInterpretations', () => {
  let TMP_ROOT
  let TMP_BOOK_DIR

  beforeEach(() => {
    vi.clearAllMocks()
    // 每次测试用全新 tmpdir，避免污染真实项目 books/
    TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-batch-test-'))
    TMP_BOOK_DIR = path.join(TMP_ROOT, `books/${TEST_SLUG}/articles/${TEST_CHAPTER}`)
    fs.mkdirSync(TMP_BOOK_DIR, { recursive: true })
    fs.writeFileSync(path.join(TMP_BOOK_DIR, 'source.md'), '# Test Source\n\n源文内容。', 'utf-8')
  })

  afterEach(() => {
    // 测试后清理 tmpdir
    if (TMP_ROOT) {
      fs.rmSync(TMP_ROOT, { recursive: true, force: true })
    }
  })

  it('returns success array for one chapter', async () => {
    const results = await generateInterpretations({
      slug: TEST_SLUG,
      chapters: [TEST_CHAPTER],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
    })
    expect(results).toHaveLength(1)
    expect(results[0].chapter).toBe(TEST_CHAPTER)
    expect(results[0].status).toBe('success')
  })

  it('skips chapter when source.md missing', async () => {
    const results = await generateInterpretations({
      slug: TEST_SLUG,
      chapters: ['nonexistent-chapter'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
    })
    expect(results[0].status).toBe('skipped')
    expect(results[0].reason).toContain('source')
  })

  it('skips chapter when interpretation.md exists and !force', async () => {
    // 预创建 interpretation.md 模拟已存在
    fs.writeFileSync(path.join(TMP_BOOK_DIR, 'interpretation.md'), 'old content', 'utf-8')

    const results = await generateInterpretations({
      slug: TEST_SLUG,
      chapters: [TEST_CHAPTER],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: false,
    })
    expect(results[0].status).toBe('skipped')
    expect(results[0].reason).toContain('exists')
  })

  it('invokes onProgress callback per chapter', async () => {
    const onProgress = vi.fn()
    await generateInterpretations({
      slug: TEST_SLUG,
      chapters: [TEST_CHAPTER],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
      onProgress,
    })
    expect(onProgress).toHaveBeenCalledWith(1, 1, TEST_CHAPTER, expect.any(String))
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
      slug: TEST_SLUG,
      chapters: [TEST_CHAPTER],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
      retryBaseMs: 1,
    })
    expect(callCount).toBe(3)
    expect(results[0].status).toBe('success')
  })
})
