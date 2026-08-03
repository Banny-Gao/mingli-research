import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { generateInterpretations } from '../llm-batch.js'

// Mock @anthropic-ai/sdk
// callLLM 走流式：messages.stream(params) → stream.finalMessage() → message。
// mockStream 把"单次 create 返回 message"的 handler 包装成 stream 形态，兼容原测试语义。
// 提供 .on() no-op 以兼容 callLLM 的 onStreamTick 监听（默认 mock 不发 delta 事件）。
const mockCreate = vi.fn().mockResolvedValue({
  content: [{ type: 'text', text: '## 标题\n\n> 【原文】原文。\n\n解读。' }],
  stop_reason: 'end_turn',
})
const mockStream = handler => async params => {
  const message = await handler(params)
  const listeners = {}
  return {
    finalMessage: async () => message,
    on: (event, fn) => { listeners[event] = fn; return this },
  }
}
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      stream: mockStream(() => mockCreate()),
    },
  })),
}))

// Mock 内容评估器：默认返回高分（score=5）跳过内容门，使测试聚焦于被测行为而非评估器
// （内容评估器自身的行为由 content-evaluator.test.js 单独覆盖）
vi.mock('../content-evaluator.js', () => ({
  evaluateContent: vi.fn().mockResolvedValue({ score: 5, issues: [], failed: false }),
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
    expect(onProgress).toHaveBeenCalledWith(1, 1, TEST_CHAPTER, expect.any(String), expect.any(Object))
  })

  it('invokes onChapterStart before onProgress (开始反馈先于完成)', async () => {
    const order = []
    const onChapterStart = vi.fn((...a) => order.push(['start', a]))
    const onProgress = vi.fn((...a) => order.push(['done', a]))
    await generateInterpretations({
      slug: TEST_SLUG,
      chapters: [TEST_CHAPTER],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
      onChapterStart,
      onProgress,
    })
    expect(onChapterStart).toHaveBeenCalledTimes(1)
    expect(onChapterStart).toHaveBeenCalledWith(1, 1, TEST_CHAPTER)
    // start 必须先于 done（同篇内顺序）
    expect(order[0][0]).toBe('start')
    expect(order[1][0]).toBe('done')
  })

  it('passes onStreamTick through to callLLM（透传不报错）', async () => {
    const onStreamTick = vi.fn()
    const results = await generateInterpretations({
      slug: TEST_SLUG,
      chapters: [TEST_CHAPTER],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
      onStreamTick,
    })
    expect(onStreamTick).not.toHaveBeenCalled()
    expect(results[0].status).toBe('success')
  })

  it('retries 3 times on 429 rate limit', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    let callCount = 0
    Anthropic.mockImplementation(() => ({
      messages: {
        stream: mockStream(() => {
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
        stream: mockStream(({ messages }) => {
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
        stream: mockStream(() => {
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

// === C: pickLlmParams — 密集/超长模式 LLM 参数选择（关 thinking + 大 max_tokens）===
import { pickLlmParams, buildContinuePrompt } from '../llm-batch.js'

describe('pickLlmParams (C)', () => {
  // thinking 永远开（adaptive）—— 质量优先不关 thinking；仅按篇幅分档 max_tokens
  it('密集 → extendedThinking=true, maxTokens=32000', () => {
    const r = pickLlmParams({ 模式: '密集', 超长: '否' })
    expect(r).toEqual({ extendedThinking: true, maxTokens: 32000 })
  })

  it('超长 → extendedThinking=true, maxTokens=64000（即使模式非密集，超长优先）', () => {
    const r = pickLlmParams({ 模式: '标准', 超长: '是（6000 字符）' })
    expect(r).toEqual({ extendedThinking: true, maxTokens: 64000 })
  })

  it('密集 + 超长 → maxTokens=64000（超长档覆盖密集档）', () => {
    const r = pickLlmParams({ 模式: '密集', 超长: '是（8000 字符）' })
    expect(r.maxTokens).toBe(64000)
  })

  it('标准 → extendedThinking=true, maxTokens=12800', () => {
    const r = pickLlmParams({ 模式: '标准', 超长: '否' })
    expect(r).toEqual({ extendedThinking: true, maxTokens: 12800 })
  })

  it('短篇 → extendedThinking=true, maxTokens=12800', () => {
    const r = pickLlmParams({ 模式: '短篇', 超长: '否' })
    expect(r).toEqual({ extendedThinking: true, maxTokens: 12800 })
  })

  it('thinking 永远 true（任何模式都不关 thinking）', () => {
    for (const c of [
      { 模式: '短篇', 超长: '否' },
      { 模式: '标准', 超长: '否' },
      { 模式: '密集', 超长: '否' },
      { 模式: '标准', 超长: '是（5000 字符）' },
    ]) {
      expect(pickLlmParams(c).extendedThinking).toBe(true)
    }
  })
})

// === D: buildContinuePrompt — 长文续轮附 source 标题锚点 ===
describe('buildContinuePrompt (D)', () => {
  it('source ## ≥ 5 → continuePrompt 含标题清单锚点', () => {
    const source = ['## 甲木', '## 乙木', '## 丙火', '## 丁火', '## 戊土'].join('\n\n')
    const p = buildContinuePrompt(source)
    expect(p).toContain('请继续。')
    expect(p).toContain('甲木')
    expect(p).toContain('戊土')
    expect(p).toContain('逐一覆盖')
  })

  it('source ## < 5 → 默认「请继续。」（无锚点）', () => {
    const source = '## 甲木\n\n## 乙木'
    const p = buildContinuePrompt(source)
    expect(p).toBe('请继续。')
  })

  it('source ## > 15 → 清单截断为前 15 + 等 N 节', () => {
    const heads = Array.from({ length: 20 }, (_, i) => `## 节${i + 1}`)
    const p = buildContinuePrompt(heads.join('\n\n'))
    expect(p).toContain('等20节')
    expect(p).not.toContain('节16、') // 第 16 个不进清单
  })
})

// === C 集成：generateOne 把 pickLlmParams 传给 callLLM ===
describe('pickLlmParams via generateOne (C integration)', () => {
  let TMP_ROOT

  beforeEach(() => {
    vi.clearAllMocks()
    TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-batch-c-'))
  })
  afterEach(() => {
    if (TMP_ROOT) fs.rmSync(TMP_ROOT, { recursive: true, force: true })
  })

  it('dense source → callLLM receives maxTokens=32000, thinking=adaptive', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const captured = []
    Anthropic.mockImplementation(() => ({
      messages: {
        stream: mockStream(params => {
          captured.push(params)
          return Promise.resolve({
            content: [{ type: 'text', text: '## 标题\n\n> 【原文】原文。\n\n解读。' }],
          })
        }),
      },
    }))

    const dir = path.join(TMP_ROOT, `books/${TEST_SLUG}/articles/dense-chap`)
    fs.mkdirSync(dir, { recursive: true })
    const body = '甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥'.repeat(100)
    fs.writeFileSync(path.join(dir, 'source.md'), `# 密集原文\n\n${body}`, 'utf-8')

    await generateInterpretations({
      slug: TEST_SLUG,
      chapters: ['dense-chap'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
    })

    expect(captured.length).toBeGreaterThan(0)
    expect(captured[0].max_tokens).toBe(32000)
    expect(captured[0].thinking).toEqual({ type: 'adaptive' }) // thinking 永远开
  })
})

// === B: 格式问题注入下轮 prompt（fatal + format 都注入）===
describe('format issues injection (B)', () => {
  let TMP_ROOT

  beforeEach(() => {
    vi.clearAllMocks()
    TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-batch-b-'))
  })
  afterEach(() => {
    if (TMP_ROOT) fs.rmSync(TMP_ROOT, { recursive: true, force: true })
  })

  it('injects format issues into next-round prompt when format>0', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const capturedPrompts = []
    let callIdx = 0
    Anthropic.mockImplementation(() => ({
      messages: {
        stream: mockStream(({ messages }) => {
          callIdx++
          capturedPrompts.push(messages[0].content)
          // 第 1 轮：输出含格式错误（引文未用块引用 → format 命中 missing-blockquote）
          // 第 2 轮：干净输出，过门
          const text =
            callIdx === 1
              ? '## 标题\n\n【原文】原文。\n\n解读。' // 格式错误：【原文】未用 > 块引用
              : '## 标题\n\n> 【原文】原文。\n\n解读。'
          return Promise.resolve({ content: [{ type: 'text', text }] })
        }),
      },
    }))

    const dir = path.join(TMP_ROOT, `books/${TEST_SLUG}/articles/fmt-chap`)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'source.md'), '# 原文\n\n内容。', 'utf-8')

    const results = await generateInterpretations({
      slug: TEST_SLUG,
      chapters: ['fmt-chap'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
    })

    expect(results[0].status).toBe('success')
    // 第 2 轮 prompt 必须包含格式问题的注入标记
    expect(capturedPrompts.length).toBeGreaterThanOrEqual(2)
    expect(capturedPrompts[1]).toContain('格式问题')
  })
})

// === D: 长文续轮锚点（source ## ≥ 5 时 continuePrompt 带 标题清单）===
// 核心逻辑见 buildContinuePrompt 纯函数测试；此处验证 generateOne 把它传给 callLLM
describe('continuation anchor wiring (D integration)', () => {
  let TMP_ROOT

  beforeEach(() => {
    vi.clearAllMocks()
    TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-batch-d-'))
  })
  afterEach(() => {
    if (TMP_ROOT) fs.rmSync(TMP_ROOT, { recursive: true, force: true })
  })

  it('short source (## < 5) → generateOne 正常完成（continuePrompt 默认值路径无异常）', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    let captured = null
    Anthropic.mockImplementation(() => ({
      messages: {
        stream: mockStream(params => {
          captured = params
          return Promise.resolve({
            content: [{ type: 'text', text: '## 标题\n\n> 【原文】原文。\n\n解读。' }],
          })
        }),
      },
    }))

    const dir = path.join(TMP_ROOT, `books/${TEST_SLUG}/articles/short-chap`)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'source.md'), '# 短文\n\n内容。', 'utf-8')

    await generateInterpretations({
      slug: TEST_SLUG,
      chapters: ['short-chap'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
    })

    expect(captured).not.toBeNull()
    expect(captured.max_tokens).toBe(12800) // 短篇 = 默认
  })
})

// === 按段精确修复（取代整篇重生成）===
// 纯逻辑由 segment-repair.test.js 覆盖；此处验证 generateOne 的接线：
// 格式门不过时先走按段修，修好即落盘、不再整篇重生成。
describe('segment repair integration', () => {
  let TMP_ROOT

  beforeEach(() => {
    vi.clearAllMocks()
    TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-batch-seg-'))
  })
  afterEach(() => {
    if (TMP_ROOT) fs.rmSync(TMP_ROOT, { recursive: true, force: true })
  })

  const LONG = '此言方局与三合之别，论命者当细辨其气之专杂与势之顺逆，方不致误判用神。'
  // 3 段，仅第 3 段含「本解读」→ 1/3 段受影响（未超 50% 上限），可按段修
  const DIRTY = `## 甲\n\n${LONG.repeat(10)}\n\n## 乙\n\n${LONG.repeat(10)}\n\n## 丙\n\n本解读认为此为纲。${LONG.repeat(8)}`
  const CLEAN_SEG = `## 丙\n\n此为纲。${LONG.repeat(8)}`

  function setupChapter(name) {
    const dir = path.join(TMP_ROOT, `books/${TEST_SLUG}/articles/${name}`)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'source.md'), '# 原文\n\n源文内容。', 'utf-8')
    return dir
  }

  it('repairs only the offending segment and keeps others byte-identical', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const prompts = []
    let idx = 0
    Anthropic.mockImplementation(() => ({
      messages: {
        stream: mockStream(({ messages }) => {
          idx++
          prompts.push(messages[0].content)
          // 第 1 次：整篇生成（含违规段）；第 2 次：按段修复请求 → 返回干净段
          return Promise.resolve({ content: [{ type: 'text', text: idx === 1 ? DIRTY : CLEAN_SEG }] })
        }),
      },
    }))

    const dir = setupChapter('seg-chap')
    const results = await generateInterpretations({
      slug: TEST_SLUG,
      chapters: ['seg-chap'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
    })

    expect(results[0].status).toBe('success')
    expect(results[0].repairedBySegment).toBe(true)
    // 恰好 2 次调用：1 次整篇生成 + 1 次单段修复（而非 2 次整篇重生成）
    expect(prompts).toHaveLength(2)
    // 第 2 次是按段修 prompt，只含违规段、不含整篇 SPEC 流水线
    expect(prompts[1]).toContain('只修这一段')
    expect(prompts[1]).toContain('本解读认为此为纲')
    expect(prompts[1]).not.toContain('## 甲')

    // 落盘内容：违规段已修，未受影响段落逐字保留
    const written = fs.readFileSync(path.join(dir, 'interpretation.md'), 'utf-8')
    expect(written).not.toContain('本解读')
    expect(written).toContain(`## 甲\n\n${LONG.repeat(10)}`)
    expect(written).toContain(`## 乙\n\n${LONG.repeat(10)}`)
  })

  it('falls back to full regeneration for structural incompleteness (内容缺失修不了)', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const prompts = []
    let idx = 0
    Anthropic.mockImplementation(() => ({
      messages: {
        stream: mockStream(({ messages }) => {
          idx++
          prompts.push(messages[0].content)
          // 第 1 次：有效正文 170 字符（≥100 不豁免、<600 判残缺）→ 结构残缺，按段修无解
          // 第 2 次：整篇重生成后篇幅达标（680 字符）
          return Promise.resolve({
            content: [
              { type: 'text', text: idx === 1 ? `## 甲\n\n${LONG.repeat(5)}` : `## 甲\n\n${LONG.repeat(20)}` },
            ],
          })
        }),
      },
    }))

    setupChapter('struct-chap')
    const results = await generateInterpretations({
      slug: TEST_SLUG,
      chapters: ['struct-chap'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
    })

    expect(results[0].status).toBe('success')
    expect(results[0].repairedBySegment).toBeFalsy()
    // 第 2 次必须是整篇重生成（含注入的问题清单），而非按段修
    expect(prompts[1]).toContain('请重新生成')
    expect(prompts[1]).not.toContain('只修这一段')
  })

  it('falls back to full regeneration when repair drops content (LLM 删内容守卫)', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const prompts = []
    let idx = 0
    Anthropic.mockImplementation(() => ({
      messages: {
        stream: mockStream(({ messages }) => {
          idx++
          prompts.push(messages[0].content)
          if (idx === 1) return Promise.resolve({ content: [{ type: 'text', text: DIRTY }] })
          // 第 2 次是按段修，但返回被大幅删减的段 → 应被 isRepairAcceptable 拒绝
          if (idx === 2) return Promise.resolve({ content: [{ type: 'text', text: '## 丙\n\n短。' }] })
          return Promise.resolve({ content: [{ type: 'text', text: `## 甲\n\n${LONG.repeat(20)}` }] })
        }),
      },
    }))

    setupChapter('drop-chap')
    const results = await generateInterpretations({
      slug: TEST_SLUG,
      chapters: ['drop-chap'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
    })

    expect(results[0].status).toBe('success')
    expect(results[0].repairedBySegment).toBeFalsy()
    // 修复被拒 → 第 3 次走整篇重生成
    expect(prompts[2]).toContain('请重新生成')
  })

  it('emits onSegmentRepair progress events', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    let idx = 0
    Anthropic.mockImplementation(() => ({
      messages: {
        stream: mockStream(() => {
          idx++
          return Promise.resolve({ content: [{ type: 'text', text: idx === 1 ? DIRTY : CLEAN_SEG }] })
        }),
      },
    }))

    setupChapter('evt-chap')
    const events = []
    await generateInterpretations({
      slug: TEST_SLUG,
      chapters: ['evt-chap'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
      onSegmentRepair: e => events.push(e),
    })

    expect(events.some(e => e.phase === 'start')).toBe(true)
    expect(events.some(e => e.phase === 'success')).toBe(true)
    const start = events.find(e => e.phase === 'start')
    expect(start.segmentCount).toBe(1)
    expect(start.headings).toEqual(['丙'])
  })

  it('emits retry event when round-1 repair still fails the gate, then succeeds round 2', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    let idx = 0
    Anthropic.mockImplementation(() => ({
      messages: {
        stream: mockStream(() => {
          idx++
          // 1 整篇生成；2 第一轮修复仍含违规；3 第二轮修复干净
          if (idx === 1) return Promise.resolve({ content: [{ type: 'text', text: DIRTY }] })
          if (idx === 2) return Promise.resolve({ content: [{ type: 'text', text: '## 丙\n\n本解读仍在。' + LONG.repeat(8) }] })
          return Promise.resolve({ content: [{ type: 'text', text: CLEAN_SEG }] })
        }),
      },
    }))

    setupChapter('retry-chap')
    const events = []
    const results = await generateInterpretations({
      slug: TEST_SLUG,
      chapters: ['retry-chap'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
      onSegmentRepair: e => events.push(e),
    })

    expect(results[0].status).toBe('success')
    expect(results[0].repairedBySegment).toBe(true)
    expect(events.map(e => e.phase)).toEqual(['start', 'retry', 'start', 'success'])
    const retry = events.find(e => e.phase === 'retry')
    expect(retry.round).toBe(1)
    expect(typeof retry.score).toBe('number')
  })

  it('passes onStreamTick to the segment-repair call (修复期心跳不冻结)', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const repairTick = vi.fn()
    let idx = 0
    Anthropic.mockImplementation(() => ({
      messages: {
        // 不复用 mockStream（它要求 handler 返回 message 并包装成无事件流），
        // 这里需要自定义流：第 2 次（修复调用）发 text delta 触发 onStreamTick
        stream: async () => {
          idx++
          if (idx === 1) {
            // 第 1 次：整篇生成（含违规段），无事件
            return {
              finalMessage: async () => ({ content: [{ type: 'text', text: DIRTY }], stop_reason: 'end_turn' }),
              on: () => this,
            }
          }
          // 第 2 次：按段修复，on('text') 立即触发一次心跳
          return {
            finalMessage: async () => ({ content: [{ type: 'text', text: CLEAN_SEG }], stop_reason: 'end_turn' }),
            on: (event, fn) => {
              if (event === 'text') fn('修', { length: 1 })
              return this
            },
          }
        },
      },
    }))

    setupChapter('tick-chap')
    const results = await generateInterpretations({
      slug: TEST_SLUG,
      chapters: ['tick-chap'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
      onStreamTick: repairTick,
    })

    expect(results[0].status).toBe('success')
    expect(repairTick).toHaveBeenCalled()
  })

  it('uses a small max_tokens for segment repair (不占长文预算)', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const captured = []
    let idx = 0
    Anthropic.mockImplementation(() => ({
      messages: {
        stream: mockStream(params => {
          idx++
          captured.push(params)
          return Promise.resolve({ content: [{ type: 'text', text: idx === 1 ? DIRTY : CLEAN_SEG }] })
        }),
      },
    }))

    setupChapter('tok-chap')
    await generateInterpretations({
      slug: TEST_SLUG,
      chapters: ['tok-chap'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
    })

    expect(captured).toHaveLength(2)
    expect(captured[1].max_tokens).toBe(8000)
    // 局部措辞修正不开 thinking
    expect(captured[1].thinking).toBeUndefined()
  })
})

describe('content evaluator gating (A)', () => {
  let TMP_ROOT

  beforeEach(() => {
    vi.clearAllMocks()
    TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-batch-a-'))
  })
  afterEach(() => {
    if (TMP_ROOT) fs.rmSync(TMP_ROOT, { recursive: true, force: true })
  })

  // 格式干净的固定 mock 输出（格式门一次过，直接进入落盘前评估）
  const CLEAN_OUTPUT = '## 标题\n\n> 【原文】原文。\n\n解读。'
  function mockCleanLLM(Anthropic, capturedPrompts) {
    let callIdx = 0
    Anthropic.mockImplementation(() => ({
      messages: {
        stream: mockStream(({ messages }) => {
          callIdx++
          if (capturedPrompts) capturedPrompts.push(messages[0].content)
          return Promise.resolve({ content: [{ type: 'text', text: CLEAN_OUTPUT }] })
        }),
      },
    }))
  }

  it('content score < 4 → status=failed, 不落盘, 写 .lastfailed+.lasteval, 不重写', async () => {
    const { evaluateContent } = await import('../content-evaluator.js')
    evaluateContent.mockResolvedValueOnce({
      score: 3,
      issues: [{ item: '表层覆盖缺失', desc: '甲木一节未解读' }],
      failed: false,
    })

    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const capturedPrompts = []
    mockCleanLLM(Anthropic, capturedPrompts)

    const dir = path.join(TMP_ROOT, `books/${TEST_SLUG}/articles/eval-chap`)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'source.md'), '# 原文\n\n内容。', 'utf-8')

    const results = await generateInterpretations({
      slug: TEST_SLUG,
      chapters: ['eval-chap'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
    })

    expect(results[0].status).toBe('failed')
    expect(results[0].reason).toContain('内容') // 失败原因含内容评估
    // 内容门不过不重写：LLM 只调用 1 次（格式门一次过，无重写轮）
    expect(capturedPrompts).toHaveLength(1)
    // 不落盘 interpretation.md，写 .lastfailed + .lasteval
    const outPath = path.join(dir, 'interpretation.md')
    expect(fs.existsSync(outPath)).toBe(false)
    expect(fs.existsSync(`${outPath}.lastfailed`)).toBe(true)
    expect(fs.existsSync(`${outPath}.lasteval`)).toBe(true)
  })

  it('content score >= 4 → status=success, 落盘', async () => {
    const { evaluateContent } = await import('../content-evaluator.js')
    evaluateContent.mockResolvedValueOnce({ score: 5, issues: [], failed: false })

    const Anthropic = (await import('@anthropic-ai/sdk')).default
    mockCleanLLM(Anthropic, null)

    const dir = path.join(TMP_ROOT, `books/${TEST_SLUG}/articles/ok-chap`)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'source.md'), '# 原文\n\n内容。', 'utf-8')

    const results = await generateInterpretations({
      slug: TEST_SLUG,
      chapters: ['ok-chap'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
    })

    expect(results[0].status).toBe('success')
    expect(results[0].contentScore).toBe(5)
    expect(fs.existsSync(path.join(dir, 'interpretation.md'))).toBe(true)
  })

  it('evaluator fails → 降级放行（score=5 视为通过），落盘 success', async () => {
    const { evaluateContent } = await import('../content-evaluator.js')
    evaluateContent.mockResolvedValueOnce({ score: 5, issues: [], failed: true, error: 'API down' })

    const Anthropic = (await import('@anthropic-ai/sdk')).default
    mockCleanLLM(Anthropic, null)

    const dir = path.join(TMP_ROOT, `books/${TEST_SLUG}/articles/degraded-chap`)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'source.md'), '# 原文\n\n内容。', 'utf-8')

    const results = await generateInterpretations({
      slug: TEST_SLUG,
      chapters: ['degraded-chap'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: TMP_ROOT,
      force: true,
    })

    // 评估器失败降级为放行，不阻断已有产出
    expect(results[0].status).toBe('success')
    expect(fs.existsSync(path.join(dir, 'interpretation.md'))).toBe(true)
  })
})
