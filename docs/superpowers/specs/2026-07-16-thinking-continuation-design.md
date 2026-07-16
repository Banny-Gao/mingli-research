# thinking 截断自动续轮 — 设计文档

**日期**: 2026-07-16
**范围**: `scripts/lib/llm-client.js` 的 `callLLM` 函数
**目标**: 当 MiniMax-M3 adaptive thinking 耗尽 `max_tokens` 导致响应中只含 thinking 块而无 text 输出时，自动发起续轮请求，直到拿到 text 或达到续轮上限。

---

## 1. 背景与问题

### 1.1 现象

执行 `node scripts/generate-interpretations.js 八字提要 寅月乙日 --force` 时，模型启用 `thinking: { type: 'adaptive' }` 后，12800 `max_tokens` 被思考过程全部消耗，响应 `content` 数组里只有 `thinking` 块、没有 `text` 块，报错：

```
LLM 未返回文本内容 (content blocks: [thinking])
```

该篇直接失败，整个批量任务中断。

### 1.2 协议依据

MiniMax 兼容 Anthropic Messages API。官方文档（<https://platform.minimaxi.com/docs/api-reference/text-anthropic-api>）指出：

- `thinking: {"type": "adaptive"}` 开启 thinking；
- **当响应包含 thinking 内容块时，后续轮次中应原样保留这些内容块**；
- 与 Anthropic 官方协议一致：`stop_reason === "max_tokens"` 表示本次输出被截断，把 assistant 的 content blocks（含 thinking）原样回填到 messages，再加一条极简 user 消息即可续轮。

Anthropic 官方 stop_reason 定义（Context7/anthropic-sdk-python）：

- `end_turn`: 自然结束，拿到完整答复；
- `max_tokens`: 被 max_tokens 截断，可通过回填 content 续轮；
- 其他：tool_use / stop_sequence / pause_turn / refusal。

---

## 2. 目标与非目标

### 2.1 目标

- thinking 被截断时自动续轮，单次 `callLLM` 调用对外返回完整 text；
- 续轮次数可控（默认上限 3，即累计最多 4 次 API 调用），防止成本失控/死循环；
- 调用方零改动：`llm-batch.js`、其他 consumer 的签名、行为不变；
- 保留现有 429/5xx 指数退避重试能力。

### 2.2 非目标

- 不改为显式 `budget_tokens` 配置（保持 adaptive）；
- 不调整 `max_tokens` 默认值（仍为 12800）；
- 不引入新的 CLI 参数、环境变量或日志系统；
- 不处理 tool_use 续轮（当前项目未使用 tool_use）；
- 不做跨 rewrite 次的记忆续轮（那是 `llm-batch.js` 的职责）。

---

## 3. 方案概述

在 `callLLM` 内部引入"续轮循环"：

1. 维护可变的 `messages` 数组，首轮使用调用方传入的 messages；
2. 维护累计 `allText` 字符串缓冲区；
3. 每次 API 调用后：
   - 把当轮的 text 块拼到 `allText`；
   - 若 `stop_reason === "max_tokens"` 且续轮次数未超限：把本次 assistant 的**完整 content blocks**（原样保留 thinking 块 + signature + 任何已输出的 text 块）追加到 messages，再加一条 `{role: 'user', content: '请继续。'}`，发起下一轮；
   - 否则视为结束：若 `allText` 非空返回它；若仍为空则抛原错 `LLM 未返回文本内容 (content blocks: [...])`。

### 3.1 续轮上限

- `MAX_CONTINUATIONS = 3`（常量，写在 `llm-client.js` 顶部，与现有 `MAX_RETRIES` 并列）；
- 含首轮调用共 4 次 API 调用，单篇 interpretation 理论 max_tokens 上限 4 × 12800 = 51200。

### 3.2 续轮消息拼装规范

第 N 轮（N ≥ 2）的 messages 结构：

```
[
  ...前 N-1 轮 messages,
  { role: 'assistant', content: <上一轮 response.content 的完整 blocks 数组> },
  { role: 'user', content: '请继续。' }
]
```

**必须原样保留**上一轮 assistant 回包中的所有块：
- `{ type: 'thinking', thinking: '...', signature: '...' }` 块——MiniMax 文档明确要求原样保留；
- `{ type: 'text', text: '...' }` 块——若上一轮已输出部分 text，回填后模型不会重复输出；
- 其他未知块类型（如 redacted_thinking）按原样透传，不做过滤。

注意：首轮参数中的 `system`、`thinking`、`max_tokens`、`model` 在续轮中保持不变；续轮不修改 system prompt。

### 3.3 text 拼接

- 每轮从 `response.content` 中筛选 `type === 'text'` 的块，按顺序 join('') 后 append 到 `allText`；
- thinking 块仅用于消息回填，不进入 `allText`（保持现有行为——不把思考过程当正文返回）；
- 续轮边界的拼接不做去重或句子完整性修补；任何截断/补尾逻辑交给 `llm-batch.js` 已有的 `postProcessOutput` 处理（它已有"文末补收束节"的兜底）。

### 3.4 重试与续轮的关系

- **重试作用域是单轮 API 调用**：每轮内部独立跑 3 次 429/5xx 指数退避；
- 某轮最终重试失败 → 整个 `callLLM` 抛错，不继续后续轮；
- 续轮次数计数器只在"成功拿到 HTTP 响应"后递增，重试阶段不计数。

### 3.5 结束判定

循环退出条件（满足任一即停）：
1. `stop_reason !== "max_tokens"`（正常 end_turn / 其他）；
2. 续轮次数达到 `MAX_CONTINUATIONS`。

退出后：
- `allText` 非空 → 返回 `allText`；
- `allText` 为空 → 抛 `Error('LLM 未返回文本内容 (content blocks: [...])')`（保持现有错误语义，便于 `llm-batch.js` 外层识别）。

### 3.6 对外接口

`callLLM(client, opts)` 签名、返回类型、参数完全不变：

```js
export async function callLLM(client, opts = {}) -> Promise<string>
```

参数新增/变更：**无**。续轮是内部实现细节，不暴露给调用方。

---

## 4. 影响面

### 4.1 修改文件

- `scripts/lib/llm-client.js` —— 唯一修改文件。

### 4.2 调用方影响

- `scripts/lib/llm-batch.js`：零改动。`callLLM` 返回 text 后走原有的 `postProcessOutput` / self-check / rewrite 流程。
- 其他 consumer（text-overlay.js 等，如有）自动受益：adaptive thinking 场景下不再因截断失败。

### 4.3 风险

- **成本**：最坏情况单篇 4 × 12800 tokens，相对现状（整轮失败白跑 12800）是合理折衷；3 轮续轮上限封顶；
- **延迟**：最坏增加约 2~3 倍单轮耗时，但远比"整轮失败、手动重跑"快；
- **文本重复**：回填部分 text 理论上存在模型续写前重复尾部的可能。依赖 MiniMax 模型自身基于 thinking 上下文续写的能力，且 `postProcessOutput` 已有截断兜底；如上线后发现重复问题，可追加一个简单的尾部去重（预留，本次不做）。

---

## 5. 测试

### 5.1 单元测试

在 `scripts/lib/__tests__/` 下（如无则新建）为 `callLLM` 增加续轮测试，使用 mock Anthropic client：

1. **单轮即返回 text**：`stop_reason: 'end_turn'`，返回 text 块 → 直接返回文本，不续轮；
2. **一轮截断二轮返回**：首轮 `stop_reason: 'max_tokens'`、只有 thinking 块；二轮 `end_turn` 有 text → 累计 text 返回；
3. **一轮截断二轮部分 text 三轮完整**：验证 text 拼接；
4. **达到续轮上限仍无 text**：抛错 `LLM 未返回文本内容`；
5. **续轮过程中 429**：验证单轮内重试，续轮计数不被重试污染；
6. **回填消息结构**：验证第二轮 messages 里正确包含 assistant thinking 块 + '请继续。' user 消息。

### 5.2 手工验证

```bash
node scripts/generate-interpretations.js 八字提要 寅月乙日 --force
```

期望：寅月乙日不再因 thinking 截断失败，成功生成 interpretation.md。

---

## 6. 实施步骤

1. 修改 `scripts/lib/llm-client.js`：
   - 顶部新增常量 `MAX_CONTINUATIONS = 3`；
   - 将现有"单次 API 调用 + 重试"逻辑抽成内部辅助函数 `callOnce(client, params)`，返回 `{ response, assistantBlocks }`；
   - 在 `callLLM` 内实现续轮循环：维护 `messages` 副本与 `allText` 累计，按 §3 规则循环；
   - 保持原有 429/5xx 重试逻辑在 `callOnce` 内部。
2. 新增单元测试（§5.1）；
3. 运行 lint 与手工验证（§5.2）；
4. 提交。

---

## 7. 未来可扩展点（本次不做）

- 通过环境变量 `LLM_MAX_CONTINUATIONS` 配置续轮上限（YAGNI，等真有需求再加）；
- 当检测到尾部重复文本时做一次去重；
- 支持 tool_use 的多轮续轮；
- 流式（stream）模式下的续轮处理。
