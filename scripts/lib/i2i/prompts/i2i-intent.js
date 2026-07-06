/**
 * scripts/lib/i2i/prompts/i2i-intent.js — 图生图版本的设计意图分析
 *
 * 与 t2i 的 INTENT_ANALYSIS_PROMPT 区别：明确告知 LLM 有一张参考图，所有视觉描述基于参考图、
 * 但 prompt 描述可能与之冲突。用户描述是"基于参考图做什么变化"的变更指令，不是新图描述。
 */

export const I2I_INTENT_ANALYSIS_PROMPT = `你是一个图片设计意图分析器（**图生图模式**）。用户给了一张参考图，并对"参考图基础上做哪些变化"进行了描述。

⚠️ 关键前提：用户描述的是**变更指令**，不是新图描述。例如：
- "把背景换成夜晚" → 在参考图基础上把背景改为夜晚，主体保持
- "加上一行标题《xxx》" → 在参考图上叠加文字

分析维度：
1. **整体构图变化** — 相对于参考图保留 / 改动哪些部分（保留主体？替换背景？改变视角？）
2. **风格调性变化** — 美学风格是否要变（工笔→水墨？赛博朋克→复古？）
3. **色彩氛围变化** — 主色调是否调整
4. **关键视觉元素变化** — 新增/移除/修改哪些元素
5. **文字需求清单** — 用户提到了哪些文字（含《》或引号包裹内容）？各自的位置、层级、字体风格偏好

输出纯 JSON（不要 markdown 代码块）：
{
  "composition": "构图变化描述",
  "style": "风格调性描述",
  "colors": "色彩氛围描述",
  "visualElements": "关键视觉元素描述",
  "textRequirements": [
    {
      "content": "文字内容",
      "hierarchy": "primary" | "secondary" | "decorative",
      "positionHint": "用户描述的位置",
      "fontStyleHint": "用户提到的字体风格"
    }
  ]
}`

export const I2I_INTENT_SYSTEM =
  '你是图片设计意图分析器（图生图模式）。输出纯 JSON，不要 markdown 代码块。'
