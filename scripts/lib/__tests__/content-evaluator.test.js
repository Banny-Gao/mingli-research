import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    // callLLM 走流式：stream(params) → finalMessage() → message
    messages: {
      stream: async (params) => {
        const message = await mockCreate(params)
        return { finalMessage: async () => message }
      },
    },
  })),
}))

const { evaluateContent } = await import('../content-evaluator.js')
const { createLLMClient } = await import('../llm-client.js')

const OUTPUT = '## 标题\n\n> 【原文】原文。\n\n解读正文。'
const SOURCE = '## 原文标题\n\n原文。'
const CONFIG = { model: 'claude-opus-4-8' }

function makeClient() {
  return createLLMClient({ apiKey: 'sk-test', baseUrl: 'https://api.test' })
}

describe('evaluateContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('parses high score (≥4) and returns issues empty', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '```json\n{"score": 5, "issues": []}\n```' }],
      stop_reason: 'end_turn',
    })
    const result = await evaluateContent({ output: OUTPUT, sourceText: SOURCE, config: CONFIG, client: makeClient() })
    expect(result.score).toBe(5)
    expect(result.issues).toEqual([])
    expect(result.failed).toBeFalsy()
  })

  it('parses low score with issues list', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"score": 3, "issues": [{"item":"表层覆盖缺失","desc":"甲木一节未解读"}]}' }],
      stop_reason: 'end_turn',
    })
    const result = await evaluateContent({ output: OUTPUT, sourceText: SOURCE, config: CONFIG, client: makeClient() })
    expect(result.score).toBe(3)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].item).toBe('表层覆盖缺失')
  })

  it('degrades to score=5 (放行) when LLM call throws', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API down'))
    const result = await evaluateContent({ output: OUTPUT, sourceText: SOURCE, config: CONFIG, client: makeClient() })
    expect(result.score).toBe(5)
    expect(result.issues).toEqual([])
    expect(result.failed).toBe(true)
  })

  it('degrades to score=5 when output has no parseable JSON', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '评估器无法判断，抱歉。' }],
      stop_reason: 'end_turn',
    })
    const result = await evaluateContent({ output: OUTPUT, sourceText: SOURCE, config: CONFIG, client: makeClient() })
    expect(result.score).toBe(5)
    expect(result.failed).toBe(true)
  })

  it('degrades to score=5 when score field is out of range', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"score": 9, "issues": []}' }],
      stop_reason: 'end_turn',
    })
    const result = await evaluateContent({ output: OUTPUT, sourceText: SOURCE, config: CONFIG, client: makeClient() })
    expect(result.score).toBe(5)
  })

  it('filters out issues without item field', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"score": 4, "issues": [{"item":"曲解原义","desc":"x"}, {"desc":"无item"}]}' }],
      stop_reason: 'end_turn',
    })
    const result = await evaluateContent({ output: OUTPUT, sourceText: SOURCE, config: CONFIG, client: makeClient() })
    expect(result.issues).toHaveLength(1)
  })

  it('uses extendedThinking=false (评估是结构化判断，不耗 thinking 预算)', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"score": 5, "issues": []}' }],
      stop_reason: 'end_turn',
    })
    await evaluateContent({ output: OUTPUT, sourceText: SOURCE, config: CONFIG, client: makeClient() })
    const params = mockCreate.mock.calls[0][0]
    expect(params.thinking).toBeUndefined()
  })

  it('uses bounded maxTokens (4096)', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '{"score": 5, "issues": []}' }],
      stop_reason: 'end_turn',
    })
    await evaluateContent({ output: OUTPUT, sourceText: SOURCE, config: CONFIG, client: makeClient() })
    const params = mockCreate.mock.calls[0][0]
    expect(params.max_tokens).toBe(4096)
  })
})
