/**
 * scripts/lib/content-evaluator.js — 内容质量 LLM 评估器（self-check v2）
 *
 * self-check-lite 只能用 grep 检测格式/致命问题，对「解读内容是否真正覆盖原文、是否
 * 曲解、是否突兀跳跃」这类语义质量无能为力（其 issues.content 在 v1 恒空）。本评估器
 * 补这一层：用 LLM 按 SPEC-interpretation.md §七「内容检查」rubric 给生成的 interpretation
 * 打 1-5 分并给出具体扣分项，供 llm-batch.js 在格式门通过后做第二道质量门。
 *
 * 设计取舍：
 * - 仅在格式门（fatal=0 && format=0）通过后调用，避免在格式都没过的篇上浪费评估调用。
 * - rubric 只取 SPEC §七内容检查的客观可判项，不做主观「写得好不好」判断，降低误杀。
 * - 评估器自身失败时降级为放行（score=5），不阻断已有产出——评估器是质量增强不是硬约束。
 */

import { callLLM } from './llm-client.js'

/**
 * SPEC §七「内容检查」rubric，转成 LLM 可执行评分项。
 * 每项给明确的"扣分触发条件"，让评估器判断而非自由发挥。
 */
const CONTENT_RUBRIC = `# 内容质量评估 rubric（套 SPEC-interpretation.md §七内容检查）

按以下 4 项逐项判定，每命中一项扣分并在 issues 中给出具体描述（指明原文哪句/哪段的问题）：

1. **表层覆盖缺失** — 解读是否完整覆盖 source.md 原文的每一句/每一独立理论点？
   扣分条件：原文有论点被整段跳过、或仅引未解、或核心句一笔带过未做训诂。
   （注：source 分层标签作标题属格式问题，不在此项；此处只管"内容是否被解读到"。）

2. **曲解原义** — 解读是否曲解、过度引申、脱离原文臆想？
   扣分条件：解读结论在原文中找不到依据、把原文未说的观点强加进去、
   或对流派分歧做了"唯一正确"式的武断判定（客观陈列分歧不扣分）。

3. **通俗性不足** — 术语是否当场释义、融入写作语言？
   扣分条件：堆砌未释义的行业术语让普通读者无法跟上、或把应通俗化的格局判定
   直接甩术语不解释"意味着什么"。（原文引用块保留术语原貌不扣分。）

4. **行文突兀跳跃** — 内容是否由浅入深自然展开？
   扣分条件：段落间无逻辑过渡、深层洞见与表层释义割裂、或硬凑深化洞见（原文信息
   单薄却强写升华）。原文确有深层意蕴时撰、表层已尽时不强写——不强写不算扣分。

## 评分规则

- **5 分**：4 项全部通过
- **4 分**：命中 1 项轻微问题
- **3 分及以下**：命中 ≥2 项，或任一问题严重（如整段论点被跳过、明显曲解原义）

## 输出格式（严格 JSON，不要 markdown 围栏）

\`\`\`json
{
  "score": 1-5 的整数,
  "issues": [
    { "item": "表层覆盖缺失|曲解原义|通俗性不足|行文突兀跳跃", "desc": "具体问题，指明原文位置" }
  ]
}
\`\`\`

只输出 JSON，不要任何额外文字。`

/**
 * 评估 interpretation.md 的内容质量。
 *
 * @param {Object} opts
 * @param {string} opts.output - 已 post-process 的 interpretation.md 全文
 * @param {string} opts.sourceText - source.md 全文（评估覆盖性的对照基准）
 * @param {object} opts.config - {model, ...}，复用生成用的 config
 * @param {object} opts.client - 共享的 Anthropic client
 * @param {AbortSignal} [opts.signal]
 * @param {number} [opts.retryBaseMs]
 * @returns {Promise<{score: number, issues: {item: string, desc: string}[], failed: boolean}>}
 *   failed=true 表示评估器自身出错，已降级为放行（score=5, issues=[]）。
 */
export async function evaluateContent({ output, sourceText, config, client, signal, retryBaseMs }) {
  const system = `你是术数学术审稿人，按给定 rubric 客观评估一篇 interpretation.md 的内容质量。
只做内容语义评估，不评格式（格式已由前置 grep 门把关）。严格输出 JSON。`

  const user = `## 待评估的 interpretation.md

${output}

## 对照基准：source.md 原文

${sourceText}

---

${CONTENT_RUBRIC}`

  try {
    const raw = await callLLM(client, {
      model: config.model,
      system,
      messages: [{ role: 'user', content: user }],
      maxTokens: 4096,
      signal,
      retryBaseMs,
      // 评估是结构化判断任务，关掉 extended thinking——评估输出短，
      // thinking 反而吃预算且不可观测，对"客观对照 rubric"无增益。
      extendedThinking: false,
    })
    return parseEvalResult(raw)
  } catch (err) {
    // 评估器自身失败：降级放行，不阻断已有产出。
    // 宁可放过让 self-check skill 后续人工审，不可误杀已合规的产出。
    return { score: 5, issues: [], failed: true, error: err.message }
  }
}

/**
 * 解析评估器 LLM 输出为 {score, issues}。容忍围栏包裹与前后杂字。
 * @param {string} raw
 * @returns {{score: number, issues: {item: string, desc: string}[]}}
 */
function parseEvalResult(raw) {
  const jsonStr = extractJson(raw)
  if (!jsonStr) {
    return { score: 5, issues: [], failed: true, error: '评估器输出无可解析 JSON' }
  }
  let parsed
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    return { score: 5, issues: [], failed: true, error: '评估器输出 JSON 解析失败' }
  }
  const score = Number(parsed.score)
  const issues = Array.isArray(parsed.issues) ? parsed.issues.filter(i => i && i.item) : []
  return {
    score: Number.isInteger(score) && score >= 1 && score <= 5 ? score : 5,
    issues,
  }
}

/** 从可能含 markdown 围栏或前后杂字的文本中提取第一个 JSON 对象。 */
function extractJson(text) {
  if (!text) return null
  // 优先取 ```json ... ``` 围栏内容
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  // 兜底：取第一个 { 到最后一个 } 之间的内容
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end > start) return text.slice(start, end + 1)
  return null
}
