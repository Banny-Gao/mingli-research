/**
 * scripts/lib/image-gen/prompts/intent.js — 步骤 1：设计意图分析
 *
 * 输出 JSON：composition / style / colors / visualElements / textRequirements
 * 用于指导后续步骤（背景创作 / 排版设计）。
 *
 * t2i 与 i2i 共享 SYSTEM、输出 schema 和 5 个分析维度。
 * i2i 版本多了"变更指令"前提说明（用户描述的是对参考图的改动，非新图描述）。
 */

export const INTENT_SYSTEM = '你是一个图片设计意图分析器。输出纯 JSON，不要 markdown 代码块。'

const OUTPUT_SCHEMA = `输出纯 JSON（不要 markdown 代码块）：
{
  "composition": "构图描述",
  "style": "风格调性描述",
  "colors": "色彩氛围描述",
  "visualElements": "关键视觉元素描述",
  "textRequirements": [
    {
      "content": "文字内容（《》或引号中的内容）",
      "hierarchy": "primary" | "secondary" | "decorative",
      "positionHint": "用户描述的位置",
      "fontStyleHint": "用户提到的字体风格"
    }
  ]
}`

const ANALYSIS_DIMENSIONS_T2I = `分析维度：
1. **整体构图** — 画面布局（对称/三分/对角线/中心）、视觉重心位置、留白分布、空间层次
2. **风格调性** — 美学风格（工笔重彩/极简主义/赛博朋克/水墨渲染/复古/现代等）、情绪氛围
3. **色彩氛围** — 主色调、辅助色、色调关系（对比/渐变/和谐）、明暗倾向、饱和度
4. **关键视觉元素** — 画面中的主要物体、场景、纹理、光影特征
5. **文字需求清单** — 用户提到了哪些文字？各自的位置、层级（主标题/副标题/装饰文字等）、字体风格偏好`

const ANALYSIS_DIMENSIONS_I2I = `分析维度：
1. **整体构图变化** — 相对于参考图保留 / 改动哪些部分（保留主体？替换背景？改变视角？）
2. **风格调性变化** — 美学风格是否要变（工笔→水墨？赛博朋克→复古？）
3. **色彩氛围变化** — 主色调是否调整
4. **关键视觉元素变化** — 新增/移除/修改哪些元素
5. **文字需求清单** — 用户提到了哪些文字（含《》或引号包裹内容）？各自的位置、层级、字体风格偏好`

export const INTENT_ANALYSIS_PROMPT = `你是一个图片设计意图分析器。分析用户对图片的描述，提取结构化的设计意图。

${ANALYSIS_DIMENSIONS_T2I}

${OUTPUT_SCHEMA}`

export const I2I_INTENT_ANALYSIS_PROMPT = `你是一个图片设计意图分析器（**图生图模式**）。用户给了一张参考图，并对"参考图基础上做哪些变化"进行了描述。

⚠️ 关键前提：用户描述的是**变更指令**，不是新图描述。例如：
- "把背景换成夜晚" → 在参考图基础上把背景改为夜晚，主体保持
- "加上一行标题《xxx》" → 在参考图上叠加文字

${ANALYSIS_DIMENSIONS_I2I}

${OUTPUT_SCHEMA}`
