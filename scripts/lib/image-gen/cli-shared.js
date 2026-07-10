/**
 * scripts/lib/image-gen/cli-shared.js — 共享 CLI 参数解析
 *
 * t2i/cli.js 与 i2i/cli.js 的 flag 解析 90% 重复，差异仅在 i2i 多 5 个 flag
 *（--input-image / --input-images / --subject-type / --use-input-image-url /
 *   --no-use-input-image-url）。本模块持有通用 flag 的 handler map，
 * caller 通过 extraHandlers 注入 mode-specific flag。
 *
 * 设计：handler 签名 (opts, argv, i, pending) => number
 *   - opts: 输出对象
 *   - argv: 完整 argv
 *   - i: 当前 flag 索引
 *   - pending: 暂存对象（i2i 用 pending.inputImages 做批量配对校验）
 *   - 返回值: 额外消耗的 token 数（0=flag only，1=flag+value）
 *
 * 通用 post-processing（validateName / parseBatchName）在此完成；
 * i2i 批量配对校验（inputImages vs prompts）由 caller 在返回后自行处理。
 */

import { parsePrompts } from '../shared/parse-prompts.js'
import { validateName, parseBatchName } from '../shared/output-name.js'

/**
 * 通用 flag handler 表。
 * 每个 handler (opts, argv, i, pending) => number：返回额外消耗的 token 数。
 */
const COMMON_HANDLERS = {
  '--prompt': (opts, argv, i) => {
    opts.prompt = argv[i + 1]
    return 1
  },
  '--prompts': (opts, argv, i) => {
    opts.prompts = parsePrompts(argv[i + 1])
    return 1
  },
  '--name': (opts, argv, i) => {
    const v = argv[i + 1]
    if (v === undefined || v.startsWith('--')) {
      console.error(`❌ --name 缺少值或下一个参数是 flag (${v || 'EOF'})`)
      process.exit(1)
    }
    opts.name = v
    return 1
  },
  '--model': (opts, argv, i) => {
    opts.model = argv[i + 1]
    return 1
  },
  '--aspect-ratio': (opts, argv, i) => {
    opts.aspectRatio = argv[i + 1]
    return 1
  },
  '--n': (opts, argv, i) => {
    opts.n = Number(argv[i + 1])
    return 1
  },
  '--style': (opts, argv, i) => {
    opts.style = argv[i + 1]
    return 1
  },
  '--style-weight': (opts, argv, i) => {
    opts.styleWeight = Number(argv[i + 1])
    return 1
  },
  '--response-format': (opts, argv, i) => {
    opts.responseFormat = argv[i + 1]
    return 1
  },
  '--seed': (opts, argv, i) => {
    opts.seed = Number(argv[i + 1])
    return 1
  },
  '--prompt-optimizer': opts => {
    opts.promptOptimizer = true
    return 0
  },
  '--no-prompt-optimizer': opts => {
    opts.promptOptimizer = false
    return 0
  },
  '--aigc-watermark': opts => {
    opts.aigcWatermark = true
    return 0
  },
  '--no-aigc-watermark': opts => {
    opts.aigcWatermark = false
    return 0
  },
  '--text-overlay': opts => {
    opts.textOverlay = true
    return 0
  },
  '--no-text-overlay': opts => {
    opts.textOverlay = false
    return 0
  },
  '--save-background': opts => {
    opts.saveBackground = true
    return 0
  },
  '--reuse-background': (opts, argv, i) => {
    opts.reuseBackground = argv[i + 1]
    return 1
  },
  '--rerender': (opts, argv, i) => {
    opts.rerender = argv[i + 1]
    return 1
  },
  '--output-dir': (opts, argv, i) => {
    opts.outputDir = argv[i + 1]
    return 1
  },
  '--api-key': (opts, argv, i) => {
    opts.apiKey = argv[i + 1]
    return 1
  },
  '--width': (opts, argv, i) => {
    opts.width = Number(argv[i + 1])
    return 1
  },
  '--height': (opts, argv, i) => {
    opts.height = Number(argv[i + 1])
    return 1
  },
  '--preset': (opts, argv, i) => {
    opts.preset = argv[i + 1]
    return 1
  },
  '--concurrency': (opts, argv, i) => {
    opts.concurrency = Number(argv[i + 1])
    return 1
  },
  '--text-overlay-mode': (opts, argv, i) => {
    const mode = argv[i + 1]
    if (mode === 'safe') opts.allowPromptOptimizerWithTextOverlay = false
    else if (mode === 'unsafe') opts.allowPromptOptimizerWithTextOverlay = true
    else {
      console.error(`❌ --text-overlay-mode 必须是 safe|unsafe，当前: ${mode}`)
      process.exit(1)
    }
    return 1
  },
  '--dry-run': opts => {
    opts.dryRun = true
    return 0
  },
  '--verbose': opts => {
    opts.verbose = true
    return 0
  },
  '-v': opts => {
    opts.verbose = true
    return 0
  },
  '--help': opts => {
    opts.help = true
    return 0
  },
  '-h': opts => {
    opts.help = true
    return 0
  },
}

/**
 * 解析 argv。通用 flag 走 COMMON_HANDLERS，mode-specific flag 走 extraHandlers。
 *
 * @param {string[]} argv
 * @param {Record<string, (opts: object, argv: string[], i: number, pending: object) => number>} [extraHandlers]
 * @returns {{ opts: object, pending: object }}
 */
export function parseArgs(argv, extraHandlers = {}) {
  const opts = {}
  const pending = {}

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const handler = COMMON_HANDLERS[arg] || extraHandlers[arg]
    if (!handler) {
      console.error(`未知参数: ${arg}`)
      process.exit(1)
    }
    i += handler(opts, argv, i, pending)
  }

  // --name 校验
  if (opts.name !== undefined) {
    const v = validateName(opts.name)
    if (!v.valid) {
      console.error(`❌ ${v.error}`)
      process.exit(1)
    }
  }

  // 批量模式：--name 数量校验
  if (opts.prompts && opts.name) {
    opts.names = parseBatchName(opts)
  }

  return { opts, pending }
}

// ===== printHelp =====

export function printHelpT2I(config) {
  console.log(`
t2i.js — MiniMax 文生图脚本

用法: node scripts/t2i.js                      交互模式（推荐）
      node scripts/t2i.js --prompt <描述> [选项]  命令行模式

必填:
  --prompt <text>          图片描述文本（最多 1500 字符）
  --prompts <texts>        多个 prompt，逗号分隔（含逗号用 \\, 转义）
                           注意：--prompt 和 --prompts 互斥

模型:
  --model <model>          模型选择，默认 ${config.model}
                           ${config.validModels.join(', ')}

图片规格:
  --aspect-ratio <ratio>   宽高比，默认 ${config.aspectRatio}
                           可选: ${config.validAspectRatios.join(', ')}
  --width <px>             宽度（仅 image-01），范围 [512, 2048]，须为 8 的倍数
  --height <px>            高度（仅 image-01），范围 [512, 2048]，须为 8 的倍数
                           注意：同时传 aspect-ratio 时，width/height 被覆盖

生成控制:
  --n <number>             生成数量，默认 ${config.n}，范围 [1, 9]
  --seed <number>          随机种子，用于复现结果
  --prompt-optimizer       启用自动 prompt 优化（默认关闭）
  --no-prompt-optimizer    禁用 prompt 优化
  --aigc-watermark         添加水印（默认关闭）
  --no-aigc-watermark      不添加水印
  --concurrency <n>        批量模式并发度（--prompts），默认 3

风格（仅 image-01-live）:
  --style <type>           风格类型: ${config.validStyles.join(', ')}
  --style-weight <float>   风格权重，范围 (0, 1]，默认 ${config.styleWeight}

输出:
  --response-format <fmt>  返回格式，默认 ${config.responseFormat}
                           url: 返回图片 URL，脚本自动下载到本地
                           base64: 返回 base64 编码，脚本解码后保存
  --output-dir <dir>       输出目录，默认 ${config.outputDir}

命名:
  --name <text>            自定义基础名称（替代默认 timestamp）
                           文件命名: <name>-01.png, <name>-02.png, ...
                           元数据: <name>-metadata.json
                           批量模式: 逗号分隔多个，与 --prompts 一一对应；
                                    单个 --name 应用于全部
                           冲突时自动追加 -1 / -2 / -3 后缀
                           禁止字符: / \\ : * ? " < > |
                           最大长度 100 字符

预设:
  --preset <name>          加载指定预设配置

文字叠加:
  --text-overlay           启用文字自动提取与叠加（默认开启）
                           从 prompt 中提取《书名》等文字，T2I 生成背景后再叠加正确文字
  --no-text-overlay        禁用文字叠加，使用原始 prompt 直接生成
  --text-overlay-mode <m>  safe（默认）：text-overlay 启用时强制关闭 prompt_optimizer
                           unsafe：允许 text-overlay 与 --prompt-optimizer 共存
                           （unsafe 模式下服务端改写可能破坏"无字"上下文）

背景复用:
  --save-background        保存文字叠加前的纯背景图（t2i-{timestamp}-bg.png）
                           后续可用 --reuse-background 或 --rerender 复用
  --reuse-background <path> 跳过 T2I 生成，直接使用已有背景图叠加文字
  --rerender <metadata>     读取 metadata.json，用其中的 textOverlay 重新渲染文字
                           覆盖 results[0] 指向的最终输出图
                           适合手动调整 metadata 中的文字参数后重新出图

调试:
  --dry-run                仅校验参数，不发起 API 调用
  --verbose, -v            打印详细请求/响应日志

认证:
  --api-key <key>          MiniMax API Key（也可通过环境变量 LLM_API_KEY 设置）

示例:
  node scripts/t2i.js
  node scripts/t2i.js --prompt "一只橘猫在窗台上晒太阳"
  node scripts/t2i.js --prompts "一只猫,一只狗,一只鸟" --style 水彩
  node scripts/t2i.js --prompt "赛博朋克城市夜景" --model image-01-live --style 水彩 --n 3
  node scripts/t2i.js --prompt "..." --aspect-ratio 16:9 --prompt-optimizer
  node scripts/t2i.js --prompt "..." --dry-run
  node scripts/t2i.js --prompt "..." --verbose
`)
}

export function printHelpI2I(config) {
  console.log(`
i2i.js — MiniMax 图生图脚本

用法: node scripts/i2i.js                              交互模式（推荐）
      node scripts/i2i.js --input-image <path> --prompt <描述> [选项]
                                                      命令行模式
      node scripts/i2i.js --prompts "p1,p2" --input-images "img1,img2"
                                                      批量模式

必填:
  --input-image <path>       参考图本地路径（png/jpg/jpeg/webp，≤10MB）
                             或 http(s) URL
  --prompt <text>            变更指令描述（最多 1500 字符）
  --prompts <texts>          多个 prompt，逗号分隔（含逗号用 \\, 转义）
                             注意：--prompt 和 --prompts 互斥
  --input-images <paths>     批量模式：每个 prompt 对应一张输入图，逗号分隔
                             数量必须与 --prompts 一致

模型与参考图类型:
  --model <model>            模型选择，默认 ${config.model}
                             ${config.validModels.join(', ')}
  --subject-type <type>      subject_reference.type，默认 character
                             可选: ${config.validSubjectTypes.join(', ')}
                             其他类型需设置 I2I_ALLOW_UNKNOWN_SUBJECT_TYPE=1 跳过校验
  --use-input-image-url      强制 URL 模式（本地路径也会按 URL 处理）
                             一般无需设置；URL 默认就是 URL

图片规格:
  --aspect-ratio <ratio>     宽高比，默认 ${config.aspectRatio}
                             可选: ${config.validAspectRatios.join(', ')}
  --width <px>               宽度（仅 image-01），范围 [512, 2048]，8 的倍数
  --height <px>              高度（仅 image-01），范围 [512, 2048]，8 的倍数
                             注意：同时传 aspect-ratio 时，width/height 被覆盖

生成控制:
  --n <number>               生成数量，默认 ${config.n}，范围 [1, 9]
  --seed <number>            随机种子，用于复现
  --prompt-optimizer         启用自动 prompt 优化（默认关闭）
  --no-prompt-optimizer      禁用 prompt 优化
  --aigc-watermark           添加水印
  --no-aigc-watermark        不添加水印
  --concurrency <n>          批量模式并发度，默认 3

风格（仅 image-01-live）:
  --style <type>             风格类型: ${config.validStyles.join(', ')}
  --style-weight <float>     风格权重 (0, 1]，默认 ${config.styleWeight}

输出:
  --response-format <fmt>    url (默认) | base64
  --output-dir <dir>         输出目录，默认 ${config.outputDir}

命名:
  --name <text>            自定义基础名称（替代默认 timestamp）
                           文件命名: <name>-01.png, <name>-02.png, ...
                           元数据: <name>-metadata.json
                           批量模式: 逗号分隔多个，与 --prompts 一一对应；
                                    单个 --name 应用于全部
                           冲突时自动追加 -1 / -2 / -3 后缀
                           禁止字符: / \\ : * ? " < > |
                           最大长度 100 字符

预设:
  --preset <name>            加载指定预设配置（i2i 独立 presets.json）

文字叠加:
  --text-overlay             启用文字自动提取与叠加（默认开启）
                             输入图作为 bg-detect 对象，mainRect + dominantColor 自动
                             注入 layout LLM
                             启用时会自动给 I2I prompt 追加「不要出现文字」以避免烧字
  --no-text-overlay          禁用文字叠加
  --text-overlay-mode <m>    safe（默认）| unsafe
                             safe 模式 text-overlay 启用时强制关闭 prompt_optimizer

背景复用:
  --save-background          保存生成图（文字叠加前）为 i2i-{timestamp}-bg.png
  --reuse-background <path>  跳过 I2I API，直接用 <path> 作为底图叠加文字
                             适用于：对已有生成图重利用 / 换 prompt 重渲染
  --rerender <metadata>     读 i2i metadata.json 重新执行文字叠加
                           覆盖 results[0] 指向的最终输出图

调试:
  --dry-run                  仅校验参数，不发起 API 调用
  --verbose, -v              打印详细请求/响应日志

认证:
  --api-key <key>            MiniMax API Key（也可通过环境变量 LLM_API_KEY）

示例:
  node scripts/i2i.js                                          （交互模式）
  node scripts/i2i.js --input-image ./ref.png --prompt "《古籍》署名改为《无名氏》"
  node scripts/i2i.js --input-image ./ref.png --prompt "把背景换成夜晚" --aspect-ratio 16:9
  node scripts/i2i.js --input-image ./ref.png --prompt "..." --no-text-overlay
  node scripts/i2i.js --prompts "把猫改成狗,把颜色反转" \\
                      --input-images "cat.png,dog.png" --n 2
  node scripts/i2i.js --input-image ./ref.png --prompt "..." --dry-run
  node scripts/i2i.js --input-image ./ref.png --prompt "..." --verbose
`)
}
