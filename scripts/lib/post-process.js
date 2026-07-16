/**
 * scripts/lib/post-process.js — LLM 输出后处理（剥离围栏 / 自评 / 补截断收束）
 *
 * 三个常见问题：
 * 1. LLM 把整篇输出包在 ```markdown ... ``` 围栏里
 * 2. LLM 在正文后追加「内部自评 / 合规分 5 分」元评估段
 * 3. 输出超长被 max_tokens 截断（缺 ## 此篇在命学体系中之位置 收束节）
 *
 * 纯函数，无副作用，方便独立单测。
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
 * 后处理 LLM 输出：剥离游离的 ``` 围栏、剥离末尾的自评段、补充截断时的收束节。
 */
export function postProcessOutput(text, chapter) {
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

  // 4. 文末截断时补充「## 此篇在命学体系中之位置」收束节
  //    判定：文末 200 字符内没有「## 此篇在命学体系中之位置」节 + 末行不以句号/问号/感叹号/分号/冒号/引号收尾
  const tailSnippet = out.slice(-200)
  const hasClosingSection = /##\s*此篇在命学体系中之位置/.test(tailSnippet)
  // 文末的最后一个非空字符
  const trimmedEnd = out.replace(/\s+$/, '')
  const lastChar = trimmedEnd.slice(-1)
  const endsCleanly = /[。！？；：）」』"”’]/.test(lastChar)

  if (!hasClosingSection && !endsCleanly) {
    // 截断：以最近的一个完整句号切断，再补收束节
    const lastPeriod = trimmedEnd.lastIndexOf('。')
    const lastQ = trimmedEnd.lastIndexOf('？')
    const lastE = trimmedEnd.lastIndexOf('！')
    const cutAt = Math.max(lastPeriod, lastQ, lastE)
    if (cutAt > trimmedEnd.length * 0.5) {
      // 找到的句末位置在后半部分 → 在此处切断
      out = trimmedEnd.slice(0, cutAt + 1) + '\n\n'
    } else {
      // 没找到合适句末 → 仅补收束节
      out = trimmedEnd + '\n\n'
    }
    out += `## 此篇在命学体系中之位置\n\n此篇为千里命稿之《${chapter}》。文中所论之理，与命学体系中之核心议题相互呼应，于初学者之进学路径与研究者之体系构建，皆有其不可替代之位次。读者宜以此篇为阶梯之一级，由此上溯命学本源、下贯实务应用，则命学之全体大用，自能融会贯通而不滞于偏隅。\n`
  }

  return out
}