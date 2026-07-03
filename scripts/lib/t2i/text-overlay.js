/**
 * scripts/lib/t2i/text-overlay.js — LLM 提取文字 + Canvas 渲染叠加
 *
 * 从用户 prompt 中自动提取文字需求：
 *   1. 调用 LLM 解析 { cleanPrompt, texts: [...] }
 *   2. cleanPrompt 用于 T2I 生成无文字背景
 *   3. 用 node-canvas 将 texts 中的文字渲染叠加到背景图上
 */

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { createLLMClient, callLLM } from '../llm-client.js'
import { matchFont } from './fonts.js'
import { llmConfig } from '../env.js'

const require = createRequire(import.meta.url)
const sharp = require('sharp')
const { createCanvas, registerFont } = require('canvas')

// ===== 字体注册 =====

const _registeredFonts = new Set()

function ensureFont(fontPath) {
  if (!fontPath || _registeredFonts.has(fontPath)) return
  try {
    const name = path.basename(fontPath, path.extname(fontPath))
    registerFont(fontPath, { family: name })
    _registeredFonts.add(fontPath)
  } catch {
    // 字体注册失败，后续使用 fallback
  }
}

function getFontFamily(fontPath) {
  if (!fontPath) return 'sans-serif'
  ensureFont(fontPath)
  return path.basename(fontPath, path.extname(fontPath))
}

// ===== LLM 文字提取（三步流水线） =====

// 步骤1：意图分析 — 理解用户 prompt 的构图、风格、色彩、文字需求
const INTENT_ANALYSIS_PROMPT = `你是一个图片设计意图分析器。分析用户对图片的描述，提取结构化的设计意图。

分析维度：
1. **整体构图** — 画面布局（对称/三分/对角线/中心）、视觉重心位置、留白分布、空间层次
2. **风格调性** — 美学风格（工笔重彩/极简主义/赛博朋克/水墨渲染/复古/现代等）、情绪氛围
3. **色彩氛围** — 主色调、辅助色、色调关系（对比/渐变/和谐）、明暗倾向、饱和度
4. **关键视觉元素** — 画面中的主要物体、场景、纹理、光影特征
5. **文字需求清单** — 用户提到了哪些文字？各自的位置、层级（主标题/副标题/装饰文字等）、字体风格偏好

输出纯 JSON（不要 markdown 代码块）：
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

// 步骤2：背景创作 — 基于意图理解，生成纯视觉背景描述
const CLEAN_PROMPT_GENERATION_PROMPT = `你是为 T2I 模型编写背景生成 prompt 的专家。根据设计意图分析结果和用户原始描述，重新创作一段更丰富的纯视觉背景描述。

⚠️ 核心铁律：T2I 模型会把 prompt 中描述的任何"文字区域""标题位""署名处"都渲染成乱码字符！
你的任务是生成一个"无字天书"——画面中不允许出现任何形式的文字、符号、字符、数字或类文字纹理。

创作原则：
1. **补全视觉细节** — 用户描述往往简略，你需要补充材质、光影、纹理、氛围等细节，让画面更生动
2. **明确构图层次** — 描述画面的空间结构、视觉重心、留白分布，与意图分析中的构图保持一致
3. **色彩氛围** — 不仅列出颜色，要描述色调关系（对比/渐变/和谐）、明暗、饱和度
4. **风格指引** — 加入风格关键词（如"工笔重彩""极简主义""赛博朋克""水墨渲染"），帮助 T2I 把握整体调性
5. **用纯视觉语言替代功能描述（这是最重要的规则！）**：
   - ❌ "用于放标题的方框" → ✅ "画面中央一块暖白色矩形区域，边缘有细微阴影"
   - ❌ "署名位置" → ✅ "右下角留出呼吸空间"
   - ❌ "书名区域" → ✅ "上半部分保留素净的浅色块面"
   - ❌ "竖排文字区域" → ✅ "纵向延伸的浅色条带，与周围深色形成对比"
   - ❌ 任何暗示"这里之后会加文字""此处预留""排版区域"的说法都不要

必须遵守：
- 绝对不要描述任何文字内容、字体、字号、排版方式
- 不要提及"字""文""书""题""签""印""章""款""跋"等与文字相关的概念
- 不要使用《》、「」、"" 等引号
- 如果原始描述提到书名、作者名、印章等，全部忽略，只保留纯视觉元素
- 输出纯文本，不要 markdown 代码块`

// 步骤3：排版设计 — 基于意图和背景，设计文字叠加规格
const TEXTS_EXTRACTION_PROMPT = `你是文字排版设计师。根据设计意图、已生成的背景描述和用户原始描述，为每段文字设计精确的排版参数。

设计原则：
1. **层级分明** — 主要文字大且醒目（占画面宽度 40-60%），次要文字约为其 1/3-1/2，装饰性文字更小
2. **色彩协调** — 文字色与所在背景区域形成足够对比度，同时保持整体色调和谐
3. **布局呼应** — 文字排列方向（横/竖）和位置与背景的构图结构呼应
4. **字体传意** — 字体风格要与画面主题匹配（庄重→衬线/楷体，现代→无衬线/黑体，手写→行楷/草书）

每段文字包含以下字段：
- content: 文字内容（《》或""中的内容）
- position: {"x": "center"|"left"|"right"|"N%", "y": "N%"}
- size: 数字(px)，根据画面比例和文字层级估算
- color: hex 色值，确保与背景区域有足够对比度
- fontHint: 字体描述原文（用户提到的字体风格）
- layout: "horizontal" | "vertical"
- stroke: 描边 {color, width} 或 null，文字与背景色相近时需要

输出纯 JSON（不要 markdown 代码块）：
[
  {
    "content": "string",
    "position": {"x": "string", "y": "string"},
    "size": number,
    "color": "string",
    "fontHint": "string",
    "layout": "horizontal" | "vertical",
    "stroke": null | {"color": "string", "width": number}
  }
]

如果没有需要精确显示的文字，输出空数组 []。`

// ===== 输出清理 =====

/**
 * 清理 LLM 返回的 JSON 字符串（去掉可能的 markdown 代码块标记）。
 */
function cleanJSON(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
}

/**
 * 清理 LLM 返回的纯文本（去掉可能的 markdown 代码块标记）。
 */
function cleanText(text) {
  return text.replace(/^```(?:text)?\s*/i, '').replace(/\s*```$/i, '').trim()
}

// ===== cleanPrompt 安全后处理 =====

/**
 * cleanPrompt 禁止词/模式列表 — 这些词会诱导 T2I 模型生成乱码文字。
 */
const FORBIDDEN_PATTERNS = [
  /《[^》]*》/g,                        // 中文书名号
  /「[^」]*」/g,                        // 中文引号
  /『[^』]*』/g,                        // 中文双引号
  /"[^"]{2,}"/g,                       // 英文引号包裹的多字符内容
  /'[^']{2,}'/g,                       // 英文单引号包裹的多字符内容
  /文字/g, /字符/g, /标题/g, /书名/g,    // 文字相关概念词
  /署名/g, /落款/g, /印章/g, /题字/g,    // 签名/印章相关
  /排版/g, /字体/g, /字号/g, /竖排/g,    // 排版相关
  /横排/g, /标签/g, /水印/g,            // 更多排版相关
]

/**
 * 对 LLM 生成的 cleanPrompt 做安全后处理：
 * 1. 去除禁止模式
 * 2. 追加多语言反文字后缀
 * 3. 长度截断保护
 */
function sanitizeCleanPrompt(raw) {
  let result = raw

  // 1. 应用所有禁止模式替换
  for (const pattern of FORBIDDEN_PATTERNS) {
    result = result.replace(pattern, '')
  }

  // 2. 清理多余空白（连续空格 → 单空格，连续换行 → 最多两个换行）
  result = result.replace(/[ \t]+/g, ' ')
  result = result.replace(/\n{3,}/g, '\n\n')

  // 3. 去掉首尾空白
  result = result.trim()

  // 4. 追加反文字后缀（中英双语，确保 T2I 模型理解）
  const ANTI_TEXT_SUFFIX =
    ' No text, no letters, no characters, no symbols, no watermarks, no signatures, no seals — pure visual image only. 画面中不得出现任何文字、字母、符号、数字、水印或印章。'

  // 如果 prompt 已很长，用精简版后缀
  const suffix = result.length > 1300
    ? ' NO TEXT, NO LETTERS, NO SYMBOLS.'
    : ANTI_TEXT_SUFFIX

  // 5. 长度保护：确保最终 prompt 不超过 1500 字符
  const MAX_LENGTH = 1500
  const suffixLen = suffix.length
  if (result.length + suffixLen > MAX_LENGTH) {
    // 截断主文本，为后缀留空间
    result = result.slice(0, MAX_LENGTH - suffixLen - 3) + '...'
  }
  result = result + suffix

  return result
}

// ===== 三步流水线 =====

/**
 * 三步流水线：从用户 prompt 中提取文字需求。
 *
 * 步骤1：意图分析 → intent
 * 步骤2：背景创作 → intent + prompt → cleanPrompt（经安全后处理）
 * 步骤3：排版设计 → intent + cleanPrompt + prompt → texts
 */
async function extractWithLLM(prompt, apiKey) {
  const client = createLLMClient({ apiKey })
  const baseOpts = {
    model: llmConfig.model,
    maxTokens: 4096,
    extendedThinking: true,
  }

  // 步骤1：意图分析
  const intentRaw = await callLLM(client, {
    ...baseOpts,
    system: '你是一个图片设计意图分析器。输出纯 JSON，不要 markdown 代码块。',
    messages: [{ role: 'user', content: `${INTENT_ANALYSIS_PROMPT}\n\n用户描述：${prompt}` }],
  })
  const intent = JSON.parse(cleanJSON(intentRaw))

  // 步骤2：背景创作（基于意图理解）
  const cleanPromptRaw = await callLLM(client, {
    ...baseOpts,
    system:
      '你是 T2I 背景 prompt 创作专家。输出纯文本（不是 JSON，不是 markdown），描述纯视觉画面，不提任何文字相关内容。',
    messages: [{
      role: 'user',
      content: [
        `${CLEAN_PROMPT_GENERATION_PROMPT}`,
        ``,
        `## 设计意图分析`,
        `\`\`\`json`,
        `${JSON.stringify(intent, null, 2)}`,
        `\`\`\``,
        ``,
        `## 用户原始描述`,
        `${prompt}`,
      ].join('\n'),
    }],
  })
  // 用 cleanText 而非 cleanJSON — 步骤2 输出的是纯文本
  let cleanPrompt = cleanText(cleanPromptRaw)

  // 安全后处理：移除禁止模式、追加反文字后缀
  cleanPrompt = sanitizeCleanPrompt(cleanPrompt)

  // 步骤3：排版设计（基于意图 + 背景）
  const textsRaw = await callLLM(client, {
    ...baseOpts,
    system: '你是文字排版设计师。输出纯 JSON 数组，不要 markdown 代码块。',
    messages: [{
      role: 'user',
      content: [
        `${TEXTS_EXTRACTION_PROMPT}`,
        ``,
        `## 设计意图分析`,
        `\`\`\`json`,
        `${JSON.stringify(intent, null, 2)}`,
        `\`\`\``,
        ``,
        `## 背景描述（cleanPrompt）`,
        `${cleanPrompt}`,
        ``,
        `## 用户原始描述`,
        `${prompt}`,
      ].join('\n'),
    }],
  })
  const texts = JSON.parse(cleanJSON(textsRaw))

  return { cleanPrompt, texts }
}

/**
 * 从用户 prompt 中提取文字规格。
 * 如果没有文字需求，返回 { cleanPrompt: prompt, texts: [] }。
 */
export async function extractTextSpec(prompt, apiKey) {
  try {
    const result = await extractWithLLM(prompt, apiKey)
    if (!result.cleanPrompt) result.cleanPrompt = prompt
    if (!result.texts) result.texts = []
    return result
  } catch (err) {
    console.error(`⚠️ 文字提取失败: ${err.message}，使用原始 prompt`)
    return { cleanPrompt: prompt, texts: [] }
  }
}

// ===== Canvas 文字渲染 =====

/**
 * 解析位置描述为像素坐标。
 */
function resolvePosition(pos, canvasWidth, canvasHeight, fontSize, textWidth) {
  let x, y

  // X 坐标
  if (pos?.x === 'center') x = canvasWidth / 2
  else if (pos?.x === 'left') x = fontSize
  else if (pos?.x === 'right') x = canvasWidth - fontSize
  else if (typeof pos?.x === 'string' && pos.x.endsWith('%')) x = canvasWidth * parseFloat(pos.x) / 100
  else if (typeof pos?.x === 'number') x = pos.x
  else x = canvasWidth / 2

  // Y 坐标
  if (typeof pos?.y === 'string' && pos.y.endsWith('%')) y = canvasHeight * parseFloat(pos.y) / 100
  else if (typeof pos?.y === 'number') y = pos.y
  else if (pos?.y === 'center') y = canvasHeight / 2
  else y = canvasHeight / 2

  return { x, y }
}

/**
 * 在 canvas 上绘制一段文字。
 */
function drawText(ctx, textSpec, canvasWidth, canvasHeight) {
  const {
    content, size = 36, color = '#FFFFFF',
    layout = 'horizontal', stroke = null,
  } = textSpec

  const fontPath = matchFont(textSpec.fontHint)
  const fontFamily = getFontFamily(fontPath)
  const fontStr = `${size}px "${fontFamily}", sans-serif`
  ctx.font = fontStr

  const chars = [...content]

  if (layout === 'vertical') {
    // 竖排：逐字从上到下
    const charMetrics = chars.map(c => ctx.measureText(c))
    const maxCharWidth = Math.max(...charMetrics.map(m => m.width))
    const totalHeight = chars.length * size * 1.2
    const { x, y } = resolvePosition(textSpec.position, canvasWidth, canvasHeight, size, maxCharWidth)

    const startY = y - totalHeight / 2 + size / 2

    chars.forEach((char, i) => {
      const charY = startY + i * size * 1.2
      drawChar(ctx, char, x, charY, color, stroke, size)
    })
  } else {
    // 横排
    const totalWidth = ctx.measureText(content).width
    const { x, y } = resolvePosition(textSpec.position, canvasWidth, canvasHeight, size, totalWidth)

    drawChar(ctx, content, x, y, color, stroke, size)
  }
}

function drawChar(ctx, text, x, y, color, stroke, fontSize) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (stroke && stroke.color && stroke.width) {
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
    ctx.strokeText(text, x, y)
  } else {
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
  }
}

/**
 * 将文字叠加到背景图上。
 *
 * @param {string} bgPath - 背景图片路径
 * @param {Array} texts - 文字规格数组
 * @param {string} outputPath - 输出图片路径
 */
export async function renderTextOverlay(bgPath, texts, outputPath) {
  if (!texts || texts.length === 0) {
    fs.copyFileSync(bgPath, outputPath)
    return
  }

  // 用 sharp 读取背景图元数据和 buffer
  const metadata = await sharp(bgPath).metadata()
  const bgBuffer = await sharp(bgPath).png().toBuffer()

  const { width, height } = metadata

  // 创建 canvas 并绘制背景
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // 加载背景图
  const { Image } = require('canvas')
  const bgImage = new Image()
  bgImage.src = bgBuffer

  ctx.drawImage(bgImage, 0, 0, width, height)

  // 逐段绘制文字
  for (const textSpec of texts) {
    drawText(ctx, textSpec, width, height)
  }

  // 导出为 PNG buffer，再写入文件
  const outputBuffer = canvas.toBuffer('image/png')
  fs.writeFileSync(outputPath, outputBuffer)
}
