/**
 * scripts/lib/interpretation-rules.js — 解读规则的单一数据源
 *
 * 所有 interpretation 审核规则在此定义一次，
 * 由 self-check-lite.js（grep 检测）和 pipeline.js（prompt 注入）共同消费。
 *
 * 新增一条规则只需在此处追加，两端自动同步。
 */

/**
 * 每一条规则有 3 部分：
 * - label: 人类可读标签
 * - regex: 对应 self-check-lite 的 grep 模式（用于 Node 端检测）
 * - promptDesc: 注入 buildPipelinePrompt 的 prose 描述（用于 LLM prompt）
 * - category: 'fatal' | 'format' | 'content'
 * - scope: 'body' | 'full'（缺省 'full'）—— grep 检测的作用域
 *
 * 注：regex 可以是 null（仅用作 prompt 约束，无对应的 grep 检测项）；
 *     promptDesc 可以是 null（纯技术检测，LLM 不需要知道具体模式）。
 *
 * ## scope 的意义（重要）
 *
 * interpretation.md 里的 `>` 块引用是**原文转录**（【原文】【原注】【任氏曰】等），
 * 以及 source 沿袭的元数据行（`> **定位**：卷二 · 第 105 篇`）。这些内容 LLM 无权改写——
 * 改了就违反转录忠实性。若规则对块引用做 grep，会把「原书自己的用词」判成「LLM 的违规」，
 * 产生 LLM 无论重写多少次都过不了的死局（实测 滴天髓阐微/方局 即因此重写 3 次全废）。
 *
 * - scope: 'body' —— 检测前剥除 `>` 块引用行。适用于「约束 LLM 自己怎么写」的规则。
 * - scope: 'full' —— 对全文检测（默认）。适用于两类：
 *     (a) 规则本身就以块引用为目标（truncated-citation / meta-blockquote）；
 *     (b) 规则检测的是结构或流水线泄漏，出现在块引用里同样是真缺陷（pipeline-jargon）。
 *
 * 每条 'body' 标注都有实测依据，勿凭直觉改动——尤其 truncated-citation 必须保持 'full'：
 * 它的 28 处命中全部落在块引用内且全部是真缺陷（LLM 用「……」省略了引文中段，
 * 对比 source.md 可确认原文并无省略号）。
 */

export const INTERPRETATION_RULES = {
  fatal: [
    {
      id: 'meta-self-ref',
      label: '元自我引用',
      regex: /本解读|本文(?!化|体|篇|章|本)|本篇解读/,
      // body：原文转录里的「本文」是原书用语（如任氏曰「本文末句云…」、
      // 《渊海子平》「以本文为观命之镜」），非 LLM 元表态，剥引用后再检测。
      scope: 'body',
      promptDesc: '「本解读」「本文」「本篇解读」（"本文"作普通指代、不作元表态评论时不算违规）',
    },
    {
      id: 'meta-self-label',
      label: '元自我标签',
      regex: /【本解读|【本文|【本篇解读|【此处略】|【录入注】/,
      scope: 'body',
      promptDesc: '【原文此处疑似 OCR 错字】等带【】的元自我标签',
    },
    {
      id: 'pipeline-jargon',
      label: '流水线术语',
      regex: /mode_of\(|SPEC §\d|按 SPEC 公式判为|按用户口径|按标准档组织/,
      // full：流水线术语是生成器泄漏，绝不可能出现在古籍原文里——
      // 落在块引用内同样是真缺陷（实测 渊海子平/神趣八法-鬼象 首行块引用即泄漏体量判定）。
      scope: 'full',
      promptDesc: '`mode_of()` / `SPEC §X.X` / `按 SPEC 公式判为` 等仅对生成流水线有意义的内部术语',
    },
    {
      id: 'meta-blockquote',
      label: '元数据块',
      // full：规则本身就以块引用为目标（`^>` 锚定），剥引用会使其永远无法命中。
      scope: 'full',
      regex:
        /^>\s*\*\*本篇模式\*\*|^>\s*\*\*模式判定\*\*|^>\s*\*\*体量定位\*\*|^>\s*\*\*mode_of\*\*/m,
      promptDesc: '文首「**本篇模式**」「**模式判定**」等元数据 blockquote 段',
    },
    {
      id: 'self-invented-case',
      label: '自创案例',
      regex: /试举一试|试造[：:]|今试拟一|虚拟一造|姑且试一/,
      scope: 'body',
      promptDesc: '"试造""虚拟一造"等自创案例标记',
    },
    {
      id: 'school-absolutism',
      label: '流派武断',
      // 仅匹配 blockquote 外的命中（blockquote 内是「原文照录」，不视为 LLM 自我武断）
      // 实现：由 scope: 'body' 统一驱动（此前在 self-check-lite 内硬编码 id 特判）
      regex: null,
      scope: 'body',
      promptDesc: '"唯一正确""绝对正确"等绝对定论',
    },
    {
      id: 'truncated-citation',
      label: '截取半句引文',
      regex: />\s*【[^】]+】[^。\n]*(?:\.{3}|……)/,
      // full（不可改为 body）：规则以块引用为目标，且实测 28 处命中全在块引用内、
      // 全部为真缺陷——LLM 用「……」省略引文中段，比对 source.md 可确认原文并无省略号
      // （如 命理约言/杂论 source 作「…始于珞辂子，乃战国时人，与鬼谷子同时…」连续行文，
      // 解读却作「…始于珞辂子……此其大略也」）。剥引用会使这条检测彻底失效。
      scope: 'full',
      promptDesc: '引文含 ... 或 …… 截断（必须引用完整整句）',
    },
    {
      id: 'meta-self-eval',
      label: '元自我自评断言',
      scope: 'body',
      regex:
        /无断章取义|无野诀|无自创案例|全部通过|致命错误[（:]?\s*\d+\s*项[）:]?|^\s*[-•]\s*(无|✓|✗|已)\s*(断章|野诀|自创|触动|触碰)|深化洞见无|✓\s*$|^##\s*\d*\.?\s*(自评|合规分|致命错误|格式错误|内容检查)/m,
      promptDesc:
        '「无野诀 / 无自创案例 / 无断章取义 / 全部通过 / 致命错误（X 项）/ ✓/✗ 标记 / 自我评分表 / ## 自评 / ## 合规分」等任何形式的 self-check 报告语言或合规自评',
    },
    {
      id: 'cross-chapter-assertion',
      label: '具体跨篇断言',
      // body：块引用内的「第 105 篇」「卷二 · 格局十神」是 source 沿袭的定位元数据行
      // （`> **定位**：卷二 · 格局十神 · 第 105 篇`），属录入规范要求，非 LLM 跨篇断言。
      scope: 'body',
      regex:
        /前数篇|(上承|下启|前承|后启)(?=.{0,4}[《「【'"」、论章程格])|本篇与.*呼应|本篇与.*互参|后文['『"].*['』"]篇当|前\s*[一二三四五六七八九十\d]+\s*篇|第\s*[一二三四五六七八九十\d]+\s*篇/,
      promptDesc:
        "「前数篇论 X、Y、Z」(具体篇名枚举) / 「上承 / 下启 / 前承 / 后启」(具体跨篇方向定位) / 「第 X 篇 / 第 X 章」(具体位置标识) / 「本篇与第 X 章呼应 / 互参」(具体跨篇呼应) / 「后文'论 X'篇当互参」(指定后续篇名)",
    },
    {
      id: 'cross-book-citation',
      label: '跨书引述',
      // body：原文本身引他书（如任氏引《滴天髓征义》）属原书内容，不算 LLM 跨书引述。
      scope: 'body',
      regex:
        /《[^》]+》[^卷]{0,10}(?:卷\s*\d+|卷\s*[一二三四五六七八九十]+).{0,30}(?:参考|亦为|亦可|对照|参见|互参)/,
      promptDesc: '解读正文中引其他书"卷 X"作为参考（除非本篇原文已直接引述）',
    },
    {
      id: 'tail-truncation',
      label: '文末截断',
      // full（不可改为 body）：检测的是**文件物理末尾**是否半句截断（regex 以 $ 锚定字符串末）。
      // 剥除块引用会改变"末行"是哪一行，使检测目标漂移——若文件以块引用收尾，剥后会误判
      // 上一段正文为末行。截断与否是文件级结构属性，须对原始全文判定。
      scope: 'full',
      // 检测文末若干行的半句截断特征：
      // (1) 文件末行 80 字符内出现"而多/而又/而更/而以/而之"等典型半句词但无句末标点
      // (2) 文件末行 80 字符内出现"亥卯/秋火/答：金/四五/1932壬申等金"等典型短词但无句末标点
      // 关键：(?![\n]) 锚定文件物理末尾（无 m 标志，$ 是字符串末）
      regex:
        /(?:^|\n)[^\n]{0,80}(?:而[多更以之又][^\n。！？]{0,10}|(?:亥卯|秋火|答：金|四五|1932壬申等金))[^\n。！？]*(?![\n])$/,
      promptDesc:
        '文末半句截断（必须以完整句号/问号/感叹号/章节收束段「## 此篇在命学体系中之位置」收尾，禁止出现「答：金」「亥卯」「秋火」「正官」「1932壬申等金」等半句截断）',
    },
    {
      id: 'stray-fence',
      label: '游离 markdown 围栏',
      // full：围栏是文件级结构（首/末行），须对原始全文判定，理由同 tail-truncation。
      scope: 'full',
      // 仅检测首行/末行单独成行的 ```（无对应关闭或围栏包裹全文）
      // 豁免合法的 ```mermaid / ```html 等代码块（内嵌于文档中部，成对闭合）
      regex: /^```(?:markdown|md)?\s*\n|^\s*```(?:markdown|md)?\s*\n|\n```\s*$/,
      promptDesc:
        '文件首/末出现单独成行的 ``` 围栏（不得用 markdown code fence 包裹整个 interpretation.md；文档中部的 ```mermaid / ```html 等代码块属合法用法）',
    },
    {
      id: 'structural-incompleteness',
      label: '结构残缺',
      // full：实际检测在 checkStructuralCompleteness 内特判（regex: null，不走 scope 分支），
      // 该函数内部自行剥块引用算有效正文。标 full 仅为满足「每条规则显式声明 scope」约定。
      scope: 'full',
      // 篇幅信号：去 blockquote 与空白后有效正文 < 600 字符 → 判残缺。
      // 解决 adaptive thinking 吃预算致 end_turn 提前停、产出"语法完整但结构残缺"的隐性截断。
      // 实际检测在 self-check-lite.js 的 checkStructuralCompleteness 内特判（regex: null）。
      // 不检测收束节存在性——产出末节写法高度多样（## / ### / 无标题收束段），正则无法穷举且误伤正常篇。
      // "内容覆盖缺失"（如天干篇跳过甲~戊 6 干）检测不到，留待 self-check v2 LLM 评估器。
      regex: null,
      promptDesc:
        '结构残缺：有效正文（去 blockquote 与空白）不少于 600 字符；adaptive thinking 模式下须控制 thinking 预算，确保正文走完 SPEC §五 Steps 3-9 全流程，篇幅过短判为结构残缺，强制重写',
    },
  ],

  format: [
    {
      id: 'missing-blockquote',
      label: '引文未用块引用',
      regex: /^【原文】|^【原注】|^【诸家评】/m,
      // full：规则目标就是「该用 > 却没用」，命中项按定义在块引用之外（`^【` 行首锚定），
      // 剥不剥都一样；标 full 以免误导后来者以为它需要看引用内内容。
      scope: 'full',
      promptDesc: '引文未用 `>` 块引用包裹',
    },
    {
      id: 'standalone-baihua',
      label: '独立白话行',
      regex: /^【白话】/m,
      // full：`^【白话】` 行首锚定，命中按定义在块引用外（块引用行以 > 开头）。
      scope: 'full',
      promptDesc: '独立【白话】行（通俗注释应融入写作语言，不另起一行标注【白话】）',
    },
    {
      id: 'mechanical-heading',
      label: '标题机械化',
      // full：`^##` 行首锚定，标题按定义在块引用外。
      scope: 'full',
      regex:
        /^##\s*(原注申说|原注详解|原注释义|原文第一段|原文首段|原文末段|第\s*一\s*段|第\s*二\s*段|段[一二三四])\s*$/m,
      promptDesc:
        '二级标题使用 source 分层标签（"原注申说""原文第一段""段一"等），正确做法：从原文关键词提炼 / 理论概念名 / 问题或论点',
    },
  ],

  content: [
    // v1 仅轻量检查；v2 待 LLM 评估器集成
  ],
}

/**
 * 从规则配置生成 LLM prompt 用的 prose 描述
 * @param {'fatal' | 'format' | 'content'} category
 * @returns {string}
 */
export function rulesToPromptProse(category) {
  const rules = INTERPRETATION_RULES[category] || []
  return rules
    .filter(r => r.promptDesc)
    .map(r => `- ${r.promptDesc}`)
    .join('\n')
}

/**
 * 生成完整的「反元自我引用」prompt 段（供 buildPipelinePrompt 内联）
 * @returns {string}
 */
export function antiMetaPromptBlock() {
  const fatalDescs = rulesToPromptProse('fatal')
    .split('\n')
    .map(l => `- ${l.replace(/^- /, '')}`)
    .join('\n')
  const formatDescs = rulesToPromptProse('format')
    .split('\n')
    .map(l => `- ${l.replace(/^- /, '')}`)
    .join('\n')
  return `## 反元自我引用硬规则（套 §一.4 §6）

**禁止**：
- 「本解读」「本文」「本篇解读」（"本文"作普通指代、不作元表态评论时不算违规）
- 【原文此处疑似 OCR 错字】等带【】的元自我标签
- \`mode_of()\` / \`SPEC §X.X\` / \`按 SPEC 公式判为\` 等流水线术语
- 「**本篇模式**」「**模式判定**」等文首元数据 blockquote
- **元自我自评断言**：「无野诀 / 无自创案例 / 无断章取义 / 全部通过 / 致命错误（X 项）/ ✓/✗ 标记 / 自我评分表」等任何形式的 self-check 报告语言或合规自评
- 具体跨篇断言：「前数篇论 X、Y、Z」「上承 / 下启 / 前承 / 后启」「第 X 篇 / 第 X 章」「本篇与第 X 章呼应」「后文'论 X'篇当互参」
- 跨书引述（如「《滴天髓征义》卷 X」），除非本篇原文有直接引述
- "试造""虚拟一造"等自创案例
- "唯一正确""绝对正确"等绝对定论

**改写方向**：「此言……」「按……」「盖……」「观此造……」`
}
