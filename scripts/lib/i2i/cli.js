/**
 * scripts/lib/i2i/cli.js — 图生图 CLI 参数解析 + 帮助
 *
 * 与 t2i 共用大多数 flags；新增 --input-image / --subject-type。
 */

import {
  i2iConfig,
  VALID_MODELS,
  VALID_ASPECT_RATIOS,
  VALID_STYLES,
  VALID_RESPONSE_FORMATS,
  VALID_SUBJECT_TYPES,
} from './constants.js'
import { parsePrompts, parseInputImages } from '../shared/parse-prompts.js'
import { validateName, parseBatchName } from '../shared/output-name.js'

export function parseArgs(argv) {
  const opts = {}
  // 批量模式下存储 --input-images 暂存，后续与 --prompts 配对
  const pending = {}

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--prompt') opts.prompt = argv[++i]
    else if (arg === '--prompts') opts.prompts = parsePrompts(argv[++i])
    else if (arg === '--input-image') opts.inputImage = argv[++i]
    else if (arg === '--input-images') pending.inputImages = parseInputImages(argv[++i])
    else if (arg === '--name') {
      const v = argv[++i]
      if (v === undefined || v.startsWith('--')) {
        console.error(`❌ --name 缺少值或下一个参数是 flag (${v || 'EOF'})`)
        process.exit(1)
      }
      opts.name = v
    }
    else if (arg === '--subject-type') opts.subjectType = argv[++i]
    else if (arg === '--use-input-image-url') opts.useInputImageUrl = true
    else if (arg === '--no-use-input-image-url') opts.useInputImageUrl = false
    else if (arg === '--model') opts.model = argv[++i]
    else if (arg === '--aspect-ratio') opts.aspectRatio = argv[++i]
    else if (arg === '--n') opts.n = Number(argv[++i])
    else if (arg === '--style') opts.style = argv[++i]
    else if (arg === '--style-weight') opts.styleWeight = Number(argv[++i])
    else if (arg === '--response-format') opts.responseFormat = argv[++i]
    else if (arg === '--seed') opts.seed = Number(argv[++i])
    else if (arg === '--prompt-optimizer') opts.promptOptimizer = true
    else if (arg === '--no-prompt-optimizer') opts.promptOptimizer = false
    else if (arg === '--aigc-watermark') opts.aigcWatermark = true
    else if (arg === '--no-aigc-watermark') opts.aigcWatermark = false
    else if (arg === '--text-overlay') opts.textOverlay = true
    else if (arg === '--no-text-overlay') opts.textOverlay = false
    else if (arg === '--reuse-background') opts.reuseBackground = argv[++i]
    else if (arg === '--save-background') opts.saveBackground = true
    else if (arg === '--output-dir') opts.outputDir = argv[++i]
    else if (arg === '--api-key') opts.apiKey = argv[++i]
    else if (arg === '--width') opts.width = Number(argv[++i])
    else if (arg === '--height') opts.height = Number(argv[++i])
    else if (arg === '--preset') opts.preset = argv[++i]
    else if (arg === '--concurrency') opts.concurrency = Number(argv[++i])
    else if (arg === '--text-overlay-mode') {
      const mode = argv[++i]
      if (mode === 'safe') opts.allowPromptOptimizerWithTextOverlay = false
      else if (mode === 'unsafe') opts.allowPromptOptimizerWithTextOverlay = true
      else {
        console.error(`❌ --text-overlay-mode 必须是 safe|unsafe，当前: ${mode}`)
        process.exit(1)
      }
    } else if (arg === '--dry-run') opts.dryRun = true
    else if (arg === '--verbose' || arg === '-v') opts.verbose = true
    else if (arg === '--help' || arg === '-h') opts.help = true
    else if (arg === '--rerender') opts.rerender = argv[++i]
    else {
      console.error(`未知参数: ${arg}`)
      process.exit(1)
    }
  }

  // 处理批量模式下的 input-images 配对
  if (opts.prompts) {
    const images = pending.inputImages || []
    if (images.length !== opts.prompts.length) {
      console.error(
        `❌ --prompts 数量 (${opts.prompts.length}) 与 --input-images 数量 (${images.length}) 不一致`
      )
      process.exit(1)
    }
    opts.inputImages = images
  }

  // 单 prompt 模式下不允许 --input-images
  if (!opts.prompts && pending.inputImages) {
    console.error(`❌ --input-images 只能与 --prompts 一起使用`)
    process.exit(1)
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

  return opts
}

export function printHelp() {
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
  --model <model>            模型选择，默认 ${i2iConfig.model}
                             ${VALID_MODELS.join(', ')}
  --subject-type <type>      subject_reference.type，默认 character
                             可选: ${VALID_SUBJECT_TYPES.join(', ')}
                             其他类型需设置 I2I_ALLOW_UNKNOWN_SUBJECT_TYPE=1 跳过校验
  --use-input-image-url      强制 URL 模式（本地路径也会按 URL 处理）
                             一般无需设置；URL 默认就是 URL

图片规格:
  --aspect-ratio <ratio>     宽高比，默认 ${i2iConfig.aspectRatio}
                             可选: ${VALID_ASPECT_RATIOS.join(', ')}
  --width <px>               宽度（仅 image-01），范围 [512, 2048]，8 的倍数
  --height <px>              高度（仅 image-01），范围 [512, 2048]，8 的倍数
                             注意：同时传 aspect-ratio 时，width/height 被覆盖

生成控制:
  --n <number>               生成数量，默认 ${i2iConfig.n}，范围 [1, 9]
  --seed <number>            随机种子，用于复现
  --prompt-optimizer         启用自动 prompt 优化（默认关闭）
  --no-prompt-optimizer      禁用 prompt 优化
  --aigc-watermark           添加水印
  --no-aigc-watermark        不添加水印
  --concurrency <n>          批量模式并发度，默认 3

风格（仅 image-01-live）:
  --style <type>             风格类型: ${VALID_STYLES.join(', ')}
  --style-weight <float>     风格权重 (0, 1]，默认 ${i2iConfig.styleWeight}

输出:
  --response-format <fmt>    url (默认) | base64
  --output-dir <dir>         输出目录，默认 ${i2iConfig.outputDir}

命名:
  --name <text>            自定义基础名称（替代默认 timestamp）
                           文件命名: <name>-01.png, <name>-02.png, ...
                           元数据: <name>-metadata.json
                           批量模式: 逗号分隔多个，与 --prompts 一一对应；
                                    单个 --name 应用于全部
                           冲突时自动追加 -1 / -2 / -3 后缀
                           禁止字符: / \ : * ? " < > |
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
                            （不影响背景原图，输出 {metadata}.png）

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
