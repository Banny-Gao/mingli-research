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
}

const FAKE_CONFIG = {
  apiKey: 'sk-test',
  baseUrl: 'https://api.test',
  model: 'claude-opus-4-8',
  concurrency: 1,
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

  // 回归测试：批量多篇时，per-篇 装订各自 source.md 内容到 prompt
  // （修复前：specBundle.sourceText 是首篇内容，per-篇 LLM 都收到首篇 source）
  it('reads per-chapter source.md content into each LLM call', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const capturedCalls = []
    Anthropic.mockImplementation(() => ({
      messages: {
        create: vi.fn().mockImplementation(({ messages }) => {
          capturedCalls.push(messages[0].content)
          return Promise.resolve({
            content: [{ type: 'text', text: '## 标题\n\n> 【原文】原文。\n\n解读。' }],
          })
        }),
      },
    }))

    const CHAP_A = 'chapter-A'
    const CHAP_B = 'chapter-B'
    const dirA = path.join(TMP_ROOT, `books/${TEST_SLUG}/articles/${CHAP_A}`)
    const dirB = path.join(TMP_ROOT, `books/${TEST_SLUG}/articles/${CHAP_B}`)
    fs.mkdirSync(dirA, { recursive: true })
    fs.mkdirSync(dirB, { recursive: true })
    // 两篇 source.md 内容不同
    fs.writeFileSync(path.join(dirA, 'source.md'), '# A 篇原文\n\nA 篇独有内容 AAA。', 'utf-8')
    fs.writeFileSync(path.join(dirB, 'source.md'), '# B 篇原文\n\nB 篇独有内容 BBB。', 'utf-8')

    const results = await generateInterpretations({
      slug: TEST_SLUG,
      chapters: [CHAP_A, CHAP_B],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
    })

    expect(results).toHaveLength(2)
    expect(results[0].status).toBe('success')
    expect(results[1].status).toBe('success')

    // 抓到 2 次 LLM 调用
    expect(capturedCalls).toHaveLength(2)

    // 第 1 次（chapter-A）必须含 A 篇独有标记 "AAA"，不应含 B 篇标记 "BBB"
    expect(capturedCalls[0]).toContain('AAA')
    expect(capturedCalls[0]).not.toContain('BBB')
    expect(capturedCalls[0]).toContain('A 篇原文')

    // 第 2 次（chapter-B）必须含 B 篇独有标记 "BBB"，不应含 A 篇标记 "AAA"
    expect(capturedCalls[1]).toContain('BBB')
    expect(capturedCalls[1]).not.toContain('AAA')
    expect(capturedCalls[1]).toContain('B 篇原文')
  })

  // 并发测试：3 篇 + concurrency=3，断言 LLM 调用并发峰值 ≥ 2
  it('runs chapters concurrently when concurrency > 1', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    let inFlight = 0
    let peakInFlight = 0
    Anthropic.mockImplementation(() => ({
      messages: {
        create: vi.fn().mockImplementation(() => {
          inFlight++
          peakInFlight = Math.max(peakInFlight, inFlight)
          return new Promise(resolve => {
            setTimeout(() => {
              inFlight--
              resolve({
                content: [{ type: 'text', text: '## 标题\n\n> 【原文】原文。\n\n解读。' }],
              })
            }, 50)
          })
        }),
      },
    }))

    const chapters = ['chap-1', 'chap-2', 'chap-3']
    const dirs = chapters.map(c => path.join(TMP_ROOT, `books/${TEST_SLUG}/articles/${c}`))
    dirs.forEach(d => {
      fs.mkdirSync(d, { recursive: true })
      fs.writeFileSync(path.join(d, 'source.md'), '# 原文\n\n源文。', 'utf-8')
    })

    const results = await generateInterpretations({
      slug: TEST_SLUG,
      chapters,
      specBundle: FAKE_BUNDLE,
      config: { ...FAKE_CONFIG, concurrency: 3 },
      projectRoot: TMP_ROOT,
      force: true,
    })

    expect(results).toHaveLength(3)
    expect(results.every(r => r.status === 'success')).toBe(true)
    expect(peakInFlight).toBeGreaterThanOrEqual(2)
  })
})
