/**
 * scripts/lib/t2i/prompts/layout.js — 步骤 3：排版设计
 *
 * 输入：设计意图 + 背景描述 + 用户原始描述 + 背景实测数据
 * 输出：文字排版规格数组（含 verticalDirection 字段）
 *
 * 关于实测数据：步骤 2 生成背景时会显式预留文字区（详见 clean.js）。
 * 步骤 3 拿到 sharp 自动检测的主矩形 bbox + 主色调，按此对齐文字位置与字号。
 *
 * TODO(Task #3 - dataflow 重构)：layout LLM 尚未收到 mainRect + dominantColor 实测数据。
 * 当前实现里 mainRect 字段是"预期输入"——LLM 没有这些数据时只能基于 reservedAreas
 * 文本描述猜测。完整方案见 docs 中的 bg-detect 集成计划：背景 API 生成 → bg-detect →
 * layout LLM（带实测 bbox）。
 */

export const TEXTS_EXTRACTION_PROMPT = `你是文字排版设计师。根据设计意图、已生成的背景描述、用户原始描述，以及**背景图实测数据**，为每段文字设计精确的排版参数。

设计原则：
1. **层级分明** — 主要文字大且醒目（占主矩形宽度 25-40%），次要文字约为其 1/3-1/2，装饰性文字更小
2. **色彩协调** — 文字色与所在背景区域形成足够对比度（WCAG AA ≥ 4.5:1），同时保持整体色调和谐。背景主色调（dominantColor）已给出，文字色应与其形成强对比
3. **布局对齐** — 文字位置**严格对齐**到背景实测的主矩形留白区（mainRect）：
   - 主标题 position.x = mainRect 的中心 cx，position.y = mainRect 的中心 cy（即相对画布 y ≈ mainRect.y + mainRect.h/2）
   - 副标题/装饰性文字放在主矩形内的不同位置（如主标题下方、底部留白处），不要溢出矩形
   - 不允许 position 落在主矩形之外（除非该字段明示要"装饰性背景外"）
4. **字号按主矩形宽度比例计算** — 主标题 size = round(mainRect.w * 0.20 ~ 0.30)（单位 px），这样 4 字竖排时总高度 ≈ 主矩形高度的 80%，5 字横排时总宽度 ≈ 主矩形宽度的 60%
5. **字体传意** — 字体风格要与画面主题匹配（庄重→衬线/楷体，现代→无衬线/黑体，手写→行楷/草书）。fontHint 直接写**字体关键词**（如 "楷书"、"MFLingLong"、"宋体"），不要列举"如 X/Y/Z"形式的备选——列表会让别名匹配错乱
6. **传统竖排方向** — 当 layout="vertical" 时，遵循中文古籍传统竖排从右到左（verticalDirection="rtl"）；若为现代排版或多列竖排可用 "ltr"（从左到右）。单列竖排默认 rtl。
7. **段间不重叠（硬约束）** — 当存在多段文字时，必须先估算每段文字的渲染 bbox（position 是中心/锚点，layout=vertical 时 height ≈ 字数 × size × 1.2，width ≈ 单字宽；layout=horizontal 时 width ≈ 字数 × size × 0.9，height ≈ size × 1.2），再布置：
   - 段间垂直间距 ≥ 0.6 × 较小字号（避免视觉粘连）
   - bbox 矩形**互不相交**（必须显式检查每对组合）
   - 整体高度（首段 top → 末段 bottom）≤ mainRect.h 的 95%
   - 若按主标题 size 算出 5 字竖排高度 ≥ mainRect.h 的 85%，主标题 size 必须下调到让 5 字竖排高度 ≤ mainRect.h × 0.75，给副标题留出空间
   - 若仍有冲突：副标题 size 按比例缩小（保留下限 0.6 × 原值），超长副标题可拆行（同一 content 拆为多段不同 position）

注意：mainRect / dominantColor 数据可能尚未注入。如果当前 prompt 中没有收到这些字段，请基于 reservedAreas 文本描述与画面整体构图合理推测。

每段文字包含以下字段：
- content: 文字内容（《》或""中的内容）— 必填
- position: {"x": "center"|"left"|"right"|"N%", "y": "N%"} — 必填
- size: 数字(px)，根据画面比例和文字层级估算 — 必填
- color: hex 色值（如 "#1A1A1A"），用于与背景形成对比 — **必填，请显式给出，不要省略**
- fontHint: 字体描述原文（用户提到的字体风格）
- layout: "horizontal" | "vertical"
- verticalDirection: "rtl" | "ltr"（仅 layout="vertical" 时有效；传统中文竖排从右到左用 "rtl"）
- stroke: 描边 {color, width} 或 null，文字与背景色相近时需要
- explicitColor: 布尔值 — true 表示你**有意指定**了 color（即使与背景对比度低也应保留，如艺术效果）；false 或省略表示 color 是你按"和谐"原则选的，可由脚本自动调整对比度

输出纯 JSON（不要 markdown 代码块）：
[
  {
    "content": "string",
    "position": {"x": "string", "y": "string"},
    "size": number,
    "color": "string",
    "fontHint": "string",
    "layout": "horizontal" | "vertical",
    "verticalDirection": "rtl" | "ltr",
    "stroke": null | {"color": "string", "width": number},
    "explicitColor": boolean
  }
]

如果没有需要精确显示的文字，输出空数组 []。`

export const LAYOUT_SYSTEM = '你是文字排版设计师。输出纯 JSON 数组，不要 markdown 代码块。'
