# T2I / I2I 图片生成脚本使用文档

## 概述

两个脚本共用同一套代码库（`scripts/lib/image-gen/`），仅入口不同：

| 脚本 | 功能 | 入口 |
|------|------|------|
| `t2i.js` | **文生图** (Text-to-Image) | `node scripts/t2i.js` |
| `i2i.js` | **图生图** (Image-to-Image) | `node scripts/i2i.js` |
| `image-gen.js` | 统一入口 | `node scripts/image-gen.js --mode t2i\|i2i` |

API 后端：MiniMax `image_generation` 端点，模型 `image-01` / `image-01-live`。

---

## 环境配置

在项目根目录创建 `.env` 文件：

```bash
LLM_API_KEY=sk-ant-...    # Anthropic API Key（文字提取阶段调用 Claude）
LLM_MODEL=claude-sonnet-4-6  # 可选，默认 claude-sonnet-4-6
```

> MiniMax 图片生成 API 复用 `LLM_API_KEY`。如需单独配置图片 API Key，用 `--api-key` 参数。

---

## T2I 文生图

### 基本用法

```bash
# 交互模式（推荐新手）
node scripts/t2i.js

# 单 prompt
node scripts/t2i.js --prompt "一只橘猫在窗台上晒太阳"

# 批量模式
node scripts/t2i.js --prompts "一只猫,一只狗,一只鸟" --style 水彩
```

### 完整参数

#### 必填

| 参数 | 说明 |
|------|------|
| `--prompt <text>` | 图片描述，最多 1500 字符 |
| `--prompts <texts>` | 批量模式，逗号分隔。含逗号的 prompt 用 `\,` 转义 |

> `--prompt` 和 `--prompts` 互斥。

#### 模型

| 参数 | 默认值 | 可选值 |
|------|--------|--------|
| `--model <model>` | `image-01` | `image-01`（通用）, `image-01-live`（支持风格化） |

#### 图片规格

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--aspect-ratio <ratio>` | `1:1` | `1:1`, `16:9`, `4:3`, `3:2`, `2:3`, `3:4`, `9:16`, `21:9` |
| `--width <px>` | — | 仅 `image-01`，512-2048，8 的倍数 |
| `--height <px>` | — | 仅 `image-01`，512-2048，8 的倍数 |

> 同时传 `--aspect-ratio` 和 `--width/--height` 时，前者覆盖后者。

#### 生成控制

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--n <number>` | `1` | 生成数量，1-9 |
| `--seed <number>` | — | 随机种子，用于复现结果 |
| `--prompt-optimizer` / `--no-prompt-optimizer` | 关闭 | 启用/禁用 MiniMax 自动 prompt 优化 |
| `--aigc-watermark` / `--no-aigc-watermark` | 关闭 | 添加/不添加水印 |
| `--concurrency <n>` | `3` | 批量模式并发度 |

#### 风格（仅 image-01-live）

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--style <type>` | — | `漫画`, `元气`, `中世纪`, `水彩` |
| `--style-weight <float>` | `0.8` | 风格权重，(0, 1] |

#### 输出

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--response-format <fmt>` | `url` | `url`（自动下载）或 `base64` |
| `--output-dir <dir>` | `./public/images` | 输出目录 |

#### 命名

| 参数 | 说明 |
|------|------|
| `--name <text>` | 自定义基础名称，替代默认时间戳 |

命名规则：
- 单 prompt：`<name>-01.png`, `<name>-02.png`, ..., `<name>-metadata.json`
- 批量模式：逗号分隔多个名称与 `--prompts` 一一对应，单个 `--name` 应用于全部
- 冲突时自动追加 `-1` / `-2` / `-3` 后缀
- 禁止字符：`/ \ : * ? " < > |`，最大 100 字符

#### 文字叠加

T2I 的文字叠加流程（4 阶段 LLM 流水线）：

```
用户 prompt（"水墨山水，上方写《登高》"）
  → Stage 1: 意图分析（提取构图/风格/文字需求）
  → Stage 2: 背景创作（生成无字背景描述 cleanPrompt）
  → Stage 3: 排版设计（确定文字位置/大小/颜色）
  → Stage 4: Canvas 渲染（叠加文字到背景图）
```

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--text-overlay` | 开启 | 启用文字自动提取与叠加 |
| `--no-text-overlay` | — | 禁用，用原始 prompt 直接生成 |
| `--text-overlay-mode <m>` | `safe` | `safe`：强制关闭 prompt_optimizer（避免服务端改写破坏"无字"上下文）；`unsafe`：允许共存 |

#### 背景复用

| 参数 | 说明 |
|------|------|
| `--save-background` | 保存文字叠加前的纯背景图（`t2i-{timestamp}-bg.png`） |
| `--reuse-background <path>` | 跳过 T2I API，直接用已有背景图叠加新文字 |
| `--rerender <metadata>` | 读取 metadata.json 重新渲染文字（适合手动调整文字参数后出图） |

#### 预设

```bash
# 保存预设（交互模式中完成配置后）
node scripts/t2i.js
# 选择"新建生成" → 配置参数 → 确认后选择"保存为预设"

# 使用预设
node scripts/t2i.js --preset "古籍封面设计" --prompt "水墨画风《滴天髓》"
```

预设文件：`scripts/lib/image-gen/presets.json`

#### 调试

| 参数 | 说明 |
|------|------|
| `--dry-run` | 仅校验参数、显示文字提取结果，不发起 API 调用 |
| `--verbose` / `-v` | 打印详细请求/响应日志 |

#### 认证

| 参数 | 说明 |
|------|------|
| `--api-key <key>` | MiniMax API Key（也可通过 `LLM_API_KEY` 环境变量） |

### 输出文件

每次生成产出以下文件（以默认时间戳命名为例）：

```
public/images/
├── t2i-1710432000000-01.png      # 生成图片（n=3 时有 02/03）
├── t2i-1710432000000-02.png
├── t2i-1710432000000-metadata.json  # 元数据
└── t2i-1710432000000-bg.png      # --save-background 时产出
```

---

## I2I 图生图

### 基本用法

```bash
# 交互模式（推荐新手）
node scripts/i2i.js

# 单 prompt：在参考图基础上做变更
node scripts/i2i.js --input-image ./ref.png --prompt "把背景换成夜晚"

# 改文字
node scripts/i2i.js --input-image ./ref.png --prompt "《古籍》署名改为《无名氏》"

# 批量模式：多个 prompt × 多张输入图
node scripts/i2i.js --prompts "把猫改成狗,把颜色反转" \
    --input-images "cat.png,dog.png" --n 2
```

### 与 T2I 的差异

| 差异点 | T2I | I2I |
|--------|-----|-----|
| 输入 | 纯文本 prompt | 参考图 + 变更指令 prompt |
| 背景来源 | T2I API 生成 | 参考图（或 API 基于参考图生成） |
| 文字叠加 Stage 2 | LLM 背景创作 | bg-detect 像素分析 |
| 意图分析 | 图片设计意图 | 参考图变更意图（含 vision，LLM 真正看到图） |
| 自动追加 | 无 | prompt 末尾追加"不要出现文字" |

### 独有参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--input-image <path>` | — | 参考图本地路径（png/jpg/jpeg/webp，≤10MB）或 http(s) URL |
| `--input-images <paths>` | — | 批量模式，逗号分隔，数量必须与 `--prompts` 一致 |
| `--subject-type <type>` | `character` | subject_reference 类型，默认仅支持 `character` |
| `--use-input-image-url` | — | 强制 URL 模式（本地路径也按 URL 发送） |

> 使用非 `character` 的 subject_type 需设置 `I2I_ALLOW_UNKNOWN_SUBJECT_TYPE=1`。

### 文字叠加流程

```
用户 prompt（"把背景换成夜晚，署名改为《无名氏》"）+ 参考图
  → Stage 1: 意图分析（LLM 真正看到参考图，理解变更意图）
  → Stage 2: bg-detect（像素实测：宽高/主体矩形/主色调）
  → Stage 3: 排版设计（基于实测数据确定文字位置/颜色）
  → Stage 4: Canvas 渲染
```

### 背景复用

```bash
# 保存生成图副本
node scripts/i2i.js --input-image ./ref.png --prompt "..." --save-background

# 对已有图换文字重渲染
node scripts/i2i.js --reuse-background ./public/images/i2i-xxx-01.png \
    --prompt "署名改为《新作者》"

# 从 metadata 重渲染
node scripts/i2i.js --rerender ./public/images/i2i-xxx-metadata.json
```

---

## 环境变量参考

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `LLM_API_KEY` | — | **必填**，Anthropic API Key |
| `LLM_MODEL` | `claude-sonnet-4-6` | Claude 模型 |
| `API_URL` | `https://api.minimaxi.com/v1` | MiniMax API 地址 |
| `T2I_DEFAULT_MODEL` | `image-01` | T2I 默认模型 |
| `T2I_DEFAULT_ASPECT_RATIO` | `1:1` | T2I 默认宽高比 |
| `T2I_DEFAULT_N` | `1` | T2I 默认生成数量 |
| `T2I_DEFAULT_OUTPUT_DIR` | `./public/images` | T2I 默认输出目录 |
| `T2I_TIMEOUT_MS` | `120000` | T2I API 超时（毫秒） |
| `T2I_RETRY_MAX` | `3` | T2I API 最大重试次数 |
| `I2I_DEFAULT_MODEL` | `image-01` | I2I 默认模型 |
| `I2I_DEFAULT_ASPECT_RATIO` | `1:1` | I2I 默认宽高比 |
| `I2I_DEFAULT_OUTPUT_DIR` | `./public/images` | I2I 默认输出目录 |
| `I2I_TIMEOUT_MS` | `120000` | I2I API 超时（毫秒） |
| `I2I_ALLOW_UNKNOWN_SUBJECT_TYPE` | — | 设为 `1` 允许非 `character` 的 subject_type |

---

## 预设管理

### 保存预设

交互模式完成配置后，系统会询问"将当前配置保存为预设？"。

保存的字段（运行时字段自动剥离）：
- `model`, `aspectRatio`, `width`, `height`
- `style`, `styleWeight`
- `n`, `promptOptimizer`, `aigcWatermark`
- `responseFormat`, `outputDir`, `textOverlay`

### 预设文件

T2I 和 I2I 共用 `scripts/lib/image-gen/presets.json`：

```json
{
  "古籍封面设计": {
    "name": "古籍封面设计",
    "model": "image-01",
    "aspectRatio": "3:4",
    "n": 1,
    "promptOptimizer": false,
    "aigcWatermark": false,
    "responseFormat": "url",
    "textOverlay": true,
    "outputDir": "./public/images",
    "savedAt": "2026-07-04T16:32:17.536Z"
  }
}
```

---

## Metadata 结构

每次生成产出 `*-metadata.json`，包含全过程证据：

```json
{
  "timestamp": "2026-07-08T...",
  "type": "t2i" | "i2i",
  "prompt": "用户原始描述",
  "apiPrompt": "实际发给图片API的prompt（cleanPrompt替换或反字后缀）",
  "model": "image-01",
  "aspectRatio": "3:4",
  "style": { "style_type": "水彩", "style_weight": 0.8 },
  "n": 1,
  "seed": null,
  "promptOptimizer": false,
  "promptOptimizerEffective": false,
  "results": [{ "filename": "t2i-xxx-01.png", "size": 123456 }],
  "textOverlay": {
    "intent": {
      "composition": "...",
      "style": "...",
      "colors": "...",
      "visualElements": "...",
      "textRequirements": [...]
    },
    "cleanPrompt": "纯视觉背景描述（t2i）或 null（i2i）",
    "reservedAreas": [{ "purpose": "main-title", "bbox": {...}, "description": "..." }],
    "texts": [{
      "purpose": "main-title",
      "content": "书名",
      "position": { "x": "center", "y": "30%" },
      "size": 72,
      "color": "#1A1A1A",
      "fontHint": "MFLingLongNoncommercial"
    }],
    "bgInfo": { "width": 864, "height": 1152, "mainRect": {...}, "dominantColor": {...} },
    "llmCalls": [
      { "stage": "intent", "model": "claude-sonnet-4-6", "maxTokens": 4096, "userMessageLength": 1234 },
      { "stage": "context", "model": "claude-sonnet-4-6", "maxTokens": 4096, "userMessageLength": 2345 },
      { "stage": "layout", "model": "claude-sonnet-4-6", "maxTokens": 4096, "userMessageLength": 3456 }
    ]
  },
  "inputImage": { "absPath": "...", "mime": "image/png", "size": 123456, "sha256": "..." }
}
```

---

## 常见工作流

### 古籍封面设计（T2I）

```bash
# 1. 首次生成
node scripts/t2i.js --prompt "工笔重彩水墨画风《滴天髓阐微》，作者京图" \
    --aspect-ratio 3:4 --save-background

# 2. 如果文字不满意，直接 rerender
# 编辑 public/images/t2i-xxx-metadata.json 中的 textOverlay.texts
node scripts/t2i.js --rerender ./public/images/t2i-xxx-metadata.json

# 3. 同一背景换书名
node scripts/t2i.js --reuse-background ./public/images/t2i-xxx-bg.png \
    --prompt "书名《子平真诠》，作者沈孝瞻"
```

### 古籍封面换字（I2I）

```bash
# 1. 已有封面图，只改文字
node scripts/i2i.js --input-image ./封面.png \
    --prompt "书名改为《三命通会》，作者改为万民英"

# 2. 背景复用：同一底图试不同文字
node scripts/i2i.js --reuse-background ./封面.png \
    --prompt "署名改为《无名氏》著"
```

### 批量生成

```bash
# T2I 批量：3 个不同 prompt，并发度 2
node scripts/t2i.js --prompts "水墨猫,水彩狗,赛博朋克鸟" \
    --style 水彩 --concurrency 2 --n 2

# I2I 批量：3 张输入图各对应一个 prompt
node scripts/i2i.js \
    --prompts "改背景为夜晚,改风格为水墨,加标题《xxx》" \
    --input-images "img1.png,img2.png,img3.png" --n 2
```

### 调试

```bash
# 预览参数和文字提取结果，不调用 API
node scripts/t2i.js --prompt "水墨画《测试》" --dry-run
node scripts/i2i.js --input-image ./ref.png --prompt "改背景" --dry-run

# 详细日志
node scripts/t2i.js --prompt "..." --verbose
```
