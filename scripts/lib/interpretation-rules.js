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
 *
 * 注：regex 可以是 null（仅用作 prompt 约束，无对应的 grep 检测项）；
 *     promptDesc 可以是 null（纯技术检测，LLM 不需要知道具体模式）。
 */

export const INTERPRETATION_RULES = {
  fatal: [
    {
      id: 'meta-self-ref',
      label: '元自我引用',
      regex: /本解读|本文(?!化|体|篇|章|本)|本篇解读/,
      promptDesc: '「本解读」「本文」「本篇解读」（"本文"作普通指代、不作元表态评论时不算违规）',
    },
    {
      id: 'meta-self-label',
      label: '元自我标签',
      regex: /【本解读|【本文|【本篇解读|【此处略】|【录入注】/,
      promptDesc: '【原文此处疑似 OCR 错字】等带【】的元自我标签',
    },
    {
      id: 'pipeline-jargon',
      label: '流水线术语',
      regex: /mode_of\(|SPEC §\d|按 SPEC 公式判为|按用户口径|按标准档组织/,
      promptDesc: '`mode_of()` / `SPEC §X.X` / `按 SPEC 公式判为` 等仅对生成流水线有意义的内部术语',
    },
    {
      id: 'meta-blockquote',
      label: '元数据块',
      regex:
        /^>\s*\*\*本篇模式\*\*|^>\s*\*\*模式判定\*\*|^>\s*\*\*体量定位\*\*|^>\s*\*\*mode_of\*\*/m,
      promptDesc: '文首「**本篇模式**」「**模式判定**」等元数据 blockquote 段',
    },
    {
      id: 'self-invented-case',
      label: '自创案例',
      regex: /试举一试|试造[：:]|今试拟一|虚拟一造|姑且试一/,
      promptDesc: '"试造""虚拟一造"等自创案例标记',
    },
    {
      id: 'school-absolutism',
      label: '流派武断',
      // 仅匹配 blockquote 外的命中（blockquote 内是「原文照录」，不视为 LLM 自我武断）
      // 实现：先剥掉所有 `> ` 开头的行，再对剩余文本做规则匹配
      regex: null,
      promptDesc: '"唯一正确""绝对正确"等绝对定论',
    },
    {
      id: 'truncated-citation',
      label: '截取半句引文',
      regex: />\s*【[^】]+】[^。\n]*(?:\.{3}|……)/,
      promptDesc: '引文含 ... 或 …… 截断（必须引用完整整句）',
    },
    {
      id: 'meta-self-eval',
      label: '元自我自评断言',
      regex:
        /无断章取义|无野诀|无自创案例|全部通过|致命错误[（:]?\s*\d+\s*项[）:]?|^\s*[-•]\s*(无|✓|✗|已)\s*(断章|野诀|自创|触动|触碰)|深化洞见无|✓\s*$|^##\s*\d*\.?\s*(自评|合规分|致命错误|格式错误|内容检查)/m,
      promptDesc:
        '「无野诀 / 无自创案例 / 无断章取义 / 全部通过 / 致命错误（X 项）/ ✓/✗ 标记 / 自我评分表 / ## 自评 / ## 合规分」等任何形式的 self-check 报告语言或合规自评',
    },
    {
      id: 'cross-chapter-assertion',
      label: '具体跨篇断言',
      regex:
        /前数篇|(上承|下启|前承|后启)(?=.{0,4}[《「【'"」、论章程格])|本篇与.*呼应|本篇与.*互参|后文['『"].*['』"]篇当|前\s*[一二三四五六七八九十\d]+\s*篇|第\s*[一二三四五六七八九十\d]+\s*篇/,
      promptDesc:
        "「前数篇论 X、Y、Z」(具体篇名枚举) / 「上承 / 下启 / 前承 / 后启」(具体跨篇方向定位) / 「第 X 篇 / 第 X 章」(具体位置标识) / 「本篇与第 X 章呼应 / 互参」(具体跨篇呼应) / 「后文'论 X'篇当互参」(指定后续篇名)",
    },
    {
      id: 'cross-book-citation',
      label: '跨书引述',
      regex:
        /《[^》]+》[^卷]{0,10}(?:卷\s*\d+|卷\s*[一二三四五六七八九十]+).{0,30}(?:参考|亦为|亦可|对照|参见|互参)/,
      promptDesc: '解读正文中引其他书"卷 X"作为参考（除非本篇原文已直接引述）',
    },
    {
      id: 'tail-truncation',
      label: '文末截断',
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
      // 仅检测首行/末行单独成行的 ```（无对应关闭或围栏包裹全文）
      // 豁免合法的 ```mermaid / ```html 等代码块（内嵌于文档中部，成对闭合）
      regex: /^```(?:markdown|md)?\s*\n|^\s*```(?:markdown|md)?\s*\n|\n```\s*$/,
      promptDesc:
        '文件首/末出现单独成行的 ``` 围栏（不得用 markdown code fence 包裹整个 interpretation.md；文档中部的 ```mermaid / ```html 等代码块属合法用法）',
    },
  ],

  format: [
    {
      id: 'missing-blockquote',
      label: '引文未用块引用',
      regex: /^【原文】|^【原注】|^【诸家评】/m,
      promptDesc: '引文未用 `>` 块引用包裹',
    },
    {
      id: 'standalone-baihua',
      label: '独立白话行',
      regex: /^【白话】/m,
      promptDesc: '独立【白话】行（通俗注释应融入写作语言，不另起一行标注【白话】）',
    },
    {
      id: 'mechanical-heading',
      label: '标题机械化',
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
