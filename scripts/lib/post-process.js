/**
 * scripts/lib/post-process.js — LLM 输出后处理（剥离围栏 / 自评）
 *
 * 两个常见问题：
 * 1. LLM 把整篇输出包在 ```markdown ... ``` 围栏里
 * 2. LLM 在正文后追加「内部自评 / 合规分 5 分」元评估段
 *
 * 纯函数，无副作用，方便独立单测。
 *
 * 注：曾含「文末截断时补收束节」逻辑，因硬编码书名致跨书污染（千里命稿套话套到
 * 他书）且补节会绕过 self-check 截断检测，已删除。截断检测统一由 self-check-lite 的
 * tail-truncation 规则（末行半句无句号）+ 篇幅检测 + 覆盖检测三层把关，触发 MAX_REWRITE
 * 让 LLM 重写真实收束节。
 */

/**
 * 剥离 LLM 输出末尾的「内部自评 / 合规分」段落。
 *
 * 模型偶发在正文后追加一段「**内部自评（不写入文件）**」+ 致命/格式计数 + 合规分 5 分，
 * 即便 prompt 已禁止。这是 thinking 充裕、模型"贴心越界"的产物；
 * 末段必定以「致命错误（N 项）/合规分：N 分/通过」等元语言收束。
 * 用一条「自评段起首正则」从尾部向前定位、整段切掉即可。
 */
export function stripTailSelfEval(text) {
  if (!text) return text
  const TAIL_HEAD_PATTERN =
    /(?:^|\n)\s*(?:\*\*[^*]*)?(?:内部自评|合规自评|自评报告|合规分|致命错误[（:]?\s*\d+\s*项|格式错误[（:]?\s*\d+\s*项|内容检查[（:]?\s*\d+\s*项)/
  const matches = [...text.matchAll(new RegExp(TAIL_HEAD_PATTERN.source, 'gm'))]
  if (matches.length === 0) return text
  const last = matches[matches.length - 1]
  // 必须满足以下任一条件才切除（避免误伤正文里偶发的自指叙述）：
  //  (a) 段起首在文件后 2/3 处；或
  //  (b) 段起首到文件末 ≤ 800 字符（这是自评段典型长度）
  const distanceFromEnd = text.length - last.index
  const isInTailTwoThirds = last.index >= text.length * 0.66
  const isShortTailBlock = distanceFromEnd <= 800
  if (!isInTailTwoThirds && !isShortTailBlock) return text
  return text.slice(0, last.index).replace(/\s+$/, '') + '\n'
}

/**
 * 后处理 LLM 输出：剥离游离的 ``` 围栏、剥离末尾的自评段。
 * @param {string} text
 */
export function postProcessOutput(text) {
  let out = text

  // 1. 剥离头部的 ```markdown / ```md / ``` 围栏行（单独的 fence）
  //    规则：开头的 fence 行（可能带可选的 markdown/md 语言标识）移除
  out = out.replace(/^\s*```(?:markdown|md)?\s*\n/, '')
  //    兜底：再处理一次（防止 fence 在空行之后）
  out = out.replace(/^\s*```(?:markdown|md)?\s*\n/, '')

  // 2. 剥离尾部的单独 fence 行（文件末）
  out = out.replace(/\n```\s*$/, '')
  //    兜底：再处理
  out = out.replace(/\n```\s*$/, '')

  // 3. 剥离末尾的「内部自评 / 合规分」段（防 LLM 越界输出元评估）
  out = stripTailSelfEval(out)

  return out
}