import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: (...args) => mockCreate(...args) },
  })),
}))

const { callLLM, createLLMClient } = await import('../llm-client.js')

describe('callLLM', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function makeResponse({ text, stopReason = 'end_turn', thinking = null }) {
    const content = []
    if (thinking) content.push({ type: 'thinking', thinking: thinking.text, signature: thinking.signature })
    if (text !== null && text !== undefined) content.push({ type: 'text', text })
    return { content, stop_reason: stopReason }
  }

  it('returns text from single end_turn response', async () => {
    mockCreate.mockResolvedValueOnce(makeResponse({ text: 'hello world' }))
    const client = createLLMClient({ apiKey: 'sk-test', baseUrl: 'https://api.test' })
    const result = await callLLM(client, { system: 'sys', messages: [{ role: 'user', content: 'hi' }], maxTokens: 100 })
    expect(result).toBe('hello world')
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })

  it('continues when first response only has thinking (max_tokens)', async () => {
    mockCreate.mockResolvedValueOnce(makeResponse({ text: null, stopReason: 'max_tokens', thinking: { text: 'internal reasoning...', signature: 'sig-1' } }))
    mockCreate.mockResolvedValueOnce(makeResponse({ text: '完整输出' }))
    const client = createLLMClient({ apiKey: 'sk-test', baseUrl: 'https://api.test' })
    const result = await callLLM(client, { system: 'sys', messages: [{ role: 'user', content: '请写一篇长文' }], maxTokens: 1024, extendedThinking: true })
    expect(result).toBe('完整输出')
    expect(mockCreate).toHaveBeenCalledTimes(2)
    const secondCallArgs = mockCreate.mock.calls[1][0]
    expect(secondCallArgs.messages).toHaveLength(3)
    expect(secondCallArgs.messages[1].role).toBe('assistant')
    expect(secondCallArgs.messages[1].content).toEqual([{ type: 'thinking', thinking: 'internal reasoning...', signature: 'sig-1' }])
    expect(secondCallArgs.messages[2]).toEqual({ role: 'user', content: '请继续。' })
  })

  it('concatenates text across continuations', async () => {
    mockCreate.mockResolvedValueOnce(makeResponse({ text: '第一段。', stopReason: 'max_tokens', thinking: { text: 'thinking-a', signature: 'sig-a' } }))
    mockCreate.mockResolvedValueOnce(makeResponse({ text: '第二段。', stopReason: 'max_tokens', thinking: { text: 'thinking-b', signature: 'sig-b' } }))
    mockCreate.mockResolvedValueOnce(makeResponse({ text: '第三段。' }))
    const client = createLLMClient({ apiKey: 'sk-test', baseUrl: 'https://api.test' })
    const result = await callLLM(client, { system: 'sys', messages: [{ role: 'user', content: '长文' }], maxTokens: 1024, extendedThinking: true })
    expect(result).toBe('第一段。第二段。第三段。')
    expect(mockCreate).toHaveBeenCalledTimes(3)
  })

  it('throws after hitting continuation limit with no text', async () => {
    for (let i = 0; i < 4; i++) {
      mockCreate.mockResolvedValueOnce(makeResponse({ text: null, stopReason: 'max_tokens', thinking: { text: `thinking-${i}`, signature: `sig-${i}` } }))
    }
    const client = createLLMClient({ apiKey: 'sk-test', baseUrl: 'https://api.test' })
    await expect(callLLM(client, { system: 'sys', messages: [{ role: 'user', content: 'x' }], maxTokens: 1024, extendedThinking: true })).rejects.toThrow(/LLM 未返回文本内容/)
    expect(mockCreate).toHaveBeenCalledTimes(4)
  })

  it('returns accumulated partial text after hitting continuation limit', async () => {
    // 4 次都返回部分 text + max_tokens（续轮上限被打满）
    for (let i = 0; i < 4; i++) {
      mockCreate.mockResolvedValueOnce(
        makeResponse({ text: `段${i + 1}。`, stopReason: 'max_tokens', thinking: { text: `t-${i}`, signature: `s-${i}` } })
      )
    }
    const client = createLLMClient({ apiKey: 'sk-test', baseUrl: 'https://api.test' })
    const result = await callLLM(client, { system: 'sys', messages: [{ role: 'user', content: 'x' }], maxTokens: 1024, extendedThinking: true })
    expect(result).toBe('段1。段2。段3。段4。')
    expect(mockCreate).toHaveBeenCalledTimes(4)
  })

  it('does NOT continue when stop_reason is end_turn even if no text', async () => {
    mockCreate.mockResolvedValueOnce(makeResponse({ text: null, stopReason: 'end_turn' }))
    const client = createLLMClient({ apiKey: 'sk-test', baseUrl: 'https://api.test' })
    await expect(callLLM(client, { system: 'sys', messages: [{ role: 'user', content: 'x' }], maxTokens: 100 })).rejects.toThrow(/LLM 未返回文本内容/)
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })
})
