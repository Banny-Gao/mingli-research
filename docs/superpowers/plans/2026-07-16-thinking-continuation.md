# thinking 截断自动续轮 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 当 MiniMax-M3 adaptive thinking 耗尽 max_tokens 导致响应只含 thinking 块无 text 输出时，`callLLM` 自动续轮直到拿到 text 或达到上限。

**Architecture:** 在 `scripts/lib/llm-client.js` 的 `callLLM` 内部引入续轮循环。抽离单次调用+重试为内部函数 `callOnce`，外层循环检测 `stop_reason === 'max_tokens'` 时把 assistant 完整 content blocks（含 thinking+signature）原样回填，追加极简 user 消息 `"请继续。"`，最多续 3 轮。对外签名与返回类型不变。

**Tech Stack:** Node.js ESM、@anthropic-ai/sdk、vitest

**Spec:** `docs/superpowers/specs/2026-07-16-thinking-continuation-design.md`

---

## File Structure

- **Modify:** `scripts/lib/llm-client.js` — 唯一代码改动文件；新增 `MAX_CONTINUATIONS` 常量、`callOnce` 内部函数、续轮循环。
- **Create:** `scripts/lib/__tests__/llm-client.test.js` — callLLM 单元测试（mock Anthropic SDK，模拟多轮续轮场景）。

---

### Task 1: 为 callLLM 建立测试基座 + 写失败的续轮测试

**Files:**
- Create: `scripts/lib/__tests__/llm-client.test.js`

- [ ] **Step 1: 创建测试文件，写一个最简单的"单轮正常返回"测试，确保基座可运行**

```js
// scripts/lib/__tests__/llm-client.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

// mock @anthropic-ai/sdk — 每个测试自己塞 create 的 resolve 值
const mockCreate = vi.fn()
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: (...args) => mockCreate(...args) },
  })),
}))

// 动态导入以确保 mock 生效
const { callLLM, createLLMClient } = await import('../llm-client.js')

describe('callLLM', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function makeResponse({ text, stopReason = 'end_turn', thinking = null }) {
    const content = []
    if (thinking) {
      content.push({ type: 'thinking', thinking: thinking.text, signature: thinking.signature })
    }
    if (text !== null && text !== undefined) {
      content.push({ type: 'text', text })
    }
    return { content, stop_reason: stopReason }
  }

  it('returns text from single end_turn response', async () => {
    mockCreate.mockResolvedValueOnce(
      makeResponse({ text: 'hello world' })
    )
    const client = createLLMClient({ apiKey: 'sk-test', baseUrl: 'https://api.test' })
    const result = await callLLM(client, {
      system: 'sys',
      messages: [{ role: 'user', content: 'hi' }],
      maxTokens: 100,
    })
    expect(result).toBe('hello world')
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: 运行测试，确认基座通过**

Run: `npx vitest run scripts/lib/__tests__/llm-client.test.js`
Expected: FAIL（因为新文件还没暴露足够的行为给续轮测试，但单轮 test 应该通过）。

> 说明：此时 `callLLM` 已存在，"单轮正常返回"应当直接 PASS。如果这一步就失败，说明 mock 或导入路径有问题，先修复再继续。

- [ ] **Step 3: 添加续轮场景的失败测试**

在同一 `describe` 中追加：

```js
it('continues when first response only has thinking (max_tokens)', async () => {
  // 首轮：只有 thinking，stop_reason=max_tokens
  mockCreate.mockResolvedValueOnce(
    makeResponse({
      text: null,
      stopReason: 'max_tokens',
      thinking: { text: 'internal reasoning...', signature: 'sig-1' },
    })
  )
  // 第二轮：返回 text，end_turn
  mockCreate.mockResolvedValueOnce(
    makeResponse({ text: '完整输出' })
  )

  const client = createLLMClient({ apiKey: 'sk-test', baseUrl: 'https://api.test' })
  const result = await callLLM(client, {
    system: 'sys',
    messages: [{ role: 'user', content: '请写一篇长文' }],
    maxTokens: 1024,
    extendedThinking: true,
  })

  expect(result).toBe('完整输出')
  expect(mockCreate).toHaveBeenCalledTimes(2)

  // 验证第二轮 messages 正确回填了 assistant thinking 块并加了 "请继续。"
  const secondCallArgs = mockCreate.mock.calls[1][0]
  expect(secondCallArgs.messages).toHaveLength(3) // [user, assistant, user]
  expect(secondCallArgs.messages[1].role).toBe('assistant')
  expect(secondCallArgs.messages[1].content).toEqual([
    { type: 'thinking', thinking: 'internal reasoning...', signature: 'sig-1' },
  ])
  expect(secondCallArgs.messages[2]).toEqual({ role: 'user', content: '请继续。' })
})

it('concatenates text across continuations', async () => {
  // 首轮：部分 text + thinking，max_tokens
  mockCreate.mockResolvedValueOnce(
    makeResponse({
      text: '第一段。',
      stopReason: 'max_tokens',
      thinking: { text: 'thinking-a', signature: 'sig-a' },
    })
  )
  // 次轮：继续 text，max_tokens
  mockCreate.mockResolvedValueOnce(
    makeResponse({
      text: '第二段。',
      stopReason: 'max_tokens',
      thinking: { text: 'thinking-b', signature: 'sig-b' },
    })
  )
  // 三轮：end_turn
  mockCreate.mockResolvedValueOnce(
    makeResponse({ text: '第三段。' })
  )

  const client = createLLMClient({ apiKey: 'sk-test', baseUrl: 'https://api.test' })
  const result = await callLLM(client, {
    system: 'sys',
    messages: [{ role: 'user', content: '长文' }],
    maxTokens: 1024,
    extendedThinking: true,
  })

  expect(result).toBe('第一段。第二段。第三段。')
  expect(mockCreate).toHaveBeenCalledTimes(3)
})

it('throws after hitting continuation limit with no text', async () => {
  // 连续 4 次（首+3续）都返回 only thinking, max_tokens
  for (let i = 0; i < 4; i++) {
    mockCreate.mockResolvedValueOnce(
      makeResponse({
        text: null,
        stopReason: 'max_tokens',
        thinking: { text: `thinking-${i}`, signature: `sig-${i}` },
      })
    )
  }
  const client = createLLMClient({ apiKey: 'sk-test', baseUrl: 'https://api.test' })
  await expect(
    callLLM(client, {
      system: 'sys',
      messages: [{ role: 'user', content: 'x' }],
      maxTokens: 1024,
      extendedThinking: true,
    })
  ).rejects.toThrow(/LLM 未返回文本内容/)
  expect(mockCreate).toHaveBeenCalledTimes(4) // 首+3续
})

it('does NOT continue when stop_reason is end_turn even if no text', async () => {
  // end_turn 但没有 text：维持原行为，直接报错（不续轮）
  mockCreate.mockResolvedValueOnce(
    makeResponse({ text: null, stopReason: 'end_turn' })
  )
  const client = createLLMClient({ apiKey: 'sk-test', baseUrl: 'https://api.test' })
  await expect(
    callLLM(client, {
      system: 'sys',
      messages: [{ role: 'user', content: 'x' }],
      maxTokens: 100,
    })
  ).rejects.toThrow(/LLM 未返回文本内容/)
  expect(mockCreate).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 4: 运行新测试，确认它们失败**

Run: `npx vitest run scripts/lib/__tests__/llm-client.test.js`
Expected: 新增的 4 个续轮测试 FAIL（因为当前 `callLLM` 在无 text 时直接抛错，不会续轮）；"单轮正常返回"测试仍然 PASS。

- [ ] **Step 5: 提交测试基座**

```bash
git add scripts/lib/__tests__/llm-client.test.js
git commit -m "test: add callLLM continuation failing tests"
```

---

### Task 2: 在 llm-client.js 实现续轮循环

**Files:**
- Modify: `scripts/lib/llm-client.js`

- [ ] **Step 1: 在 llm-client.js 顶部新增 MAX_CONTINUATIONS 常量**

打开 `scripts/lib/llm-client.js`，在 `const MAX_RETRIES = 3` 下面加一行：

```js
const MAX_RETRIES = 3
const MAX_CONTINUATIONS = 3  // thinking 截断时最多续轮次数（不含首轮）
const DEFAULT_RETRY_BASE_MS = 2000
```

- [ ] **Step 2: 抽出单次 API 调用（含 429/5xx 重试）为 callOnce 内部函数**

将现有 `for (attempt...)` 循环抽成 `callOnce`，返回原始 response（不做 text 提取、不做续轮判定）。`callLLM` 改为调用 `callOnce` 并在外面做续轮循环。把 `llm-client.js` 整个替换为以下实现：

```js
/**
 * scripts/lib/llm-client.js — 通用 Anthropic LLM 调用客户端
 *
 * 统一 Anthropic API 调用 + 重试 + thinking 截断自动续轮。
 * 消费者：llm-batch.js / text-overlay.js / 其他需要调 LLM 的模块。
 */

import Anthropic from '@anthropic-ai/sdk'
import { llmConfig } from './env.js'

const MAX_RETRIES = 3
const MAX_CONTINUATIONS = 3 // thinking 截断时最多续轮次数（不含首轮）
const DEFAULT_RETRY_BASE_MS = 2000

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 创建 Anthropic 客户端。
 * @param {{ apiKey: string, baseUrl?: string }} config
 */
export function createLLMClient(config) {
  return new Anthropic({
    apiKey: config.apiKey,
    baseURL: config.baseUrl || llmConfig.baseUrl,
  })
}

/**
 * 单次 API 调用（含 429/5xx 指数退避重试）。返回原始 response 对象。
 */
async function callOnce(client, params, { signal, retryBaseMs } = {}) {
  let lastErr
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) throw new Error('Aborted')
    try {
      return await client.messages.create(params)
    } catch (err) {
      lastErr = err
      if (err.status === 429 || err.status >= 500) {
        const wait = retryBaseMs * Math.pow(2, attempt - 1) + Math.random() * 1000
        await sleep(wait)
        continue
      }
      throw err
    }
  }
  throw lastErr
}

function extractText(response) {
  return response.content
    .filter(c => c.type === 'text' && typeof c.text === 'string')
    .map(c => c.text)
    .join('')
}

function blockTypesOf(response) {
  return response.content.map(c => c.type).join(',')
}

/**
 * 调 Anthropic Messages API，含重试与 thinking 截断自动续轮。
 *
 * @param {Anthropic} client
 * @param {{
 *   model?: string,
 *   system: string,
 *   messages: Array<{role: string, content: string | Array}>,
 *   maxTokens?: number,
 *   signal?: AbortSignal,
 *   retryBaseMs?: number,
 *   extendedThinking?: boolean,
 * }} opts
 * @returns {Promise<string>} 响应文本
 */
export async function callLLM(client, opts = {}) {
  const {
    model = llmConfig.model,
    system,
    messages,
    maxTokens = 12800,
    signal,
    retryBaseMs = DEFAULT_RETRY_BASE_MS,
    extendedThinking = false,
  } = opts

  // 构造首轮基础 params（system/model/max_tokens/thinking 固定，续轮不修改）
  const baseParams = {
    model,
    max_tokens: maxTokens,
    system,
  }
  if (extendedThinking) {
    baseParams.thinking = { type: 'adaptive' }
  }

  // 工作拷贝：续轮会往尾部追加 assistant/user 消息
  const workingMessages = [...messages]
  let allText = ''
  let continuations = 0

  while (true) {
    if (signal?.aborted) throw new Error('Aborted')

    const params = { ...baseParams, messages: workingMessages }
    const response = await callOnce(client, params, { signal, retryBaseMs })

    // 累计本轮 text
    const textThisRound = extractText(response)
    if (textThisRound) allText += textThisRound

    // 判定是否续轮：stop_reason 为 max_tokens 且未超限
    const truncated = response.stop_reason === 'max_tokens'
    if (truncated && continuations < MAX_CONTINUATIONS) {
      // 回填 assistant 完整 content blocks（含 thinking/signature/text，原样保留）
      workingMessages.push({ role: 'assistant', content: response.content })
      // 极简续轮信号
      workingMessages.push({ role: 'user', content: '请继续。' })
      continuations++
      continue
    }

    // 结束：有 text 返回 text；无 text 抛错
    if (allText) return allText
    throw new Error(`LLM 未返回文本内容 (content blocks: [${blockTypesOf(response)}])`)
  }
}
```

- [ ] **Step 3: 运行所有续轮测试，确认全部通过**

Run: `npx vitest run scripts/lib/__tests__/llm-client.test.js`
Expected: All tests PASS（5/5）。

- [ ] **Step 4: 运行已有测试，确认未回归**

Run: `npx vitest run scripts/lib/__tests__/`
Expected: 所有已有测试（llm-batch、generate-interpretations 等）全部 PASS。重点关注：
- `llm-batch.test.js`：仍然通过（因为对外签名没变）；
- 其他依赖 callLLM 的测试：仍然通过。

- [ ] **Step 5: 运行 lint**

Run: `npx eslint scripts/lib/llm-client.js scripts/lib/__tests__/llm-client.test.js`
Expected: 无错误。如果 prettier 缩进问题自动修复即可。

- [ ] **Step 6: 提交实现**

```bash
git add scripts/lib/llm-client.js scripts/lib/__tests__/llm-client.test.js
git commit -m "feat(llm): auto-continue when thinking exhausts max_tokens"
```

---

### Task 3: 手工验证真实场景

**Files:** 无新增/修改

- [ ] **Step 1: 对真实失败案例做干跑验证**

Run:
```bash
node scripts/generate-interpretations.js 八字提要 寅月乙日 --force
```

Expected:
- 不再出现 `LLM 未返回文本内容 (content blocks: [thinking])` 错误
- 寅月乙日状态变为 `success`
- 如果首轮返回只有 thinking，日志里无明显异常（续轮静默进行），耗时可能比其他篇章略长

- [ ] **Step 2: 检查生成的 interpretation.md**

Run:
```bash
ls -la books/八字提要/articles/寅月乙日/interpretation.md
head -30 books/八字提要/articles/寅月乙日/interpretation.md
```

Expected:
- 文件存在
- 内容为正常的命学解读文章，不含明显的"请继续"回显或重复段落开头

- [ ] **Step 3: （可选）跑一个完整批量验证无回归**

Run:
```bash
node scripts/generate-interpretations.js 八字提要 --dry-run
```
确认篇章解析正常；如需验证整本可加 `--force` 实跑（耗时较长，可酌情省略）。

---

### Task 4: 运行 gitnexus 检测 + 最终提交

**Files:** 无新增/修改

- [ ] **Step 1: 运行 gitnexus detect-changes 验证影响范围**

Run:
```bash
npx gitnexus analyze  # 如果索引 stale
```

然后：
```bash
# 通过 MCP 调用 detect_changes 或用 git diff 人工审查
git diff --stat
```

Expected:
- 只有 `scripts/lib/llm-client.js` 和 `scripts/lib/__tests__/llm-client.test.js` 两个文件变更；
- 没有意外改动。

- [ ] **Step 2: 使用 code-reviewer 技能做一次轻量审查**

调用 `code-reviewer` 或 superpowers:requesting-code-review 对本次改动做快速审查，重点关注：
- 续轮消息回填是否正确保留了 thinking 块 signature；
- 重试与续轮计数是否解耦；
- 是否有信号（signal）/ 内存泄漏问题。

- [ ] **Step 3: 最终确认后提交**

```bash
git add docs/superpowers/specs/2026-07-16-thinking-continuation-design.md
git add -A
git commit -m "feat(llm): auto-continue when adaptive thinking exhausts max_tokens

- Add MAX_CONTINUATIONS=3, extract callOnce() for per-call retry
- When stop_reason=max_tokens, replay assistant's full content blocks
  (thinking + signature + partial text) and send '请继续。' user turn
- Concatenate text across continuations; throw only after limit hit
- Call-site signature unchanged; llm-batch/postProcessOutput untouched
- Add unit tests for: single-turn, one-continuation, multi-round
  concatenation, limit-hit error, end_turn without text"
```

---

## Self-Review Checklist

- [x] **Spec coverage**：
  - §3.1 续轮上限 3（MAX_CONTINUATIONS = 3，Task 2 Step 1）✅
  - §3.2 消息拼装（assistant content 原样回填 + "请继续。" user 消息，Task 2 Step 2 + 断言验证，Task 1 Step 3）✅
  - §3.3 text 拼接（extractText 累加 allText，Task 1 多轮拼接测试）✅
  - §3.4 重试与续轮解耦（callOnce 内部重试，续轮计数在外层，Task 2 Step 2）✅
  - §3.5 结束判定（stop_reason !== max_tokens 或超限）✅
  - §3.6 对外接口不变（签名/Promise<string>）✅
  - §5 测试覆盖（Task 1 单轮/一轮续/多轮拼接/超限/end_turn 5 个场景）✅

- [x] **Placeholder scan**：无 TBD/TODO/later，每个代码块都是可直接粘贴的完整代码。

- [x] **Type consistency**：`callLLM`、`callOnce`、`createLLMClient`、`extractText`、`blockTypesOf` 命名一致；mock 工厂 `makeResponse` 字段与 @anthropic-ai/sdk 的 content block 结构对齐（type/thinking/signature/text/stop_reason）。
