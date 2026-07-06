/**
 * scripts/lib/t2i/cli.js — CLI 参数解析 + 帮助文本
 */

import {
  t2iConfig,
  VALID_MODELS,
  VALID_ASPECT_RATIOS,
  VALID_STYLES,
  VALID_RESPONSE_FORMATS,
} from './constants.js'
import { parsePrompts } from '../shared/parse-prompts.js'

export function parseArgs(argv) {
  const opts = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--prompt') opts.prompt = argv[++i]
    else if (arg === '--prompts') opts.prompts = parsePrompts(argv[++i])
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
    else if (arg === '--save-background') opts.saveBackground = true
    else if (arg === '--reuse-background') opts.reuseBackground = argv[++i]
    else if (arg === '--rerender') opts.rerender = argv[++i]
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
    else {
      console.error(`未知参数: ${arg}`)
      process.exit(1)
    }
  }
  return opts
}

export function printHelp() {
  console.log(`
t2i.js — MiniMax 文生图脚本

用法: node scripts/t2i.js                      交互模式（推荐）
      node scripts/t2i.js --prompt <描述> [选项]  命令行模式

必填:
  --prompt <text>          图片描述文本（最多 1500 字符）
  --prompts <texts>        多个 prompt，逗号分隔（含逗号用 \\, 转义）
                           注意：--prompt 和 --prompts 互斥

模型:
  --model <model>          模型选择，默认 ${t2iConfig.model}
                           ${VALID_MODELS.join(', ')}

图片规格:
  --aspect-ratio <ratio>   宽高比，默认 ${t2iConfig.aspectRatio}
                           可选: ${VALID_ASPECT_RATIOS.join(', ')}
  --width <px>             宽度（仅 image-01），范围 [512, 2048]，须为 8 的倍数
  --height <px>            高度（仅 image-01），范围 [512, 2048]，须为 8 的倍数
                           注意：同时传 aspect-ratio 时，width/height 被覆盖

生成控制:
  --n <number>             生成数量，默认 ${t2iConfig.n}，范围 [1, 9]
  --seed <number>          随机种子，用于复现结果
  --prompt-optimizer       启用自动 prompt 优化（默认关闭）
  --no-prompt-optimizer    禁用 prompt 优化
  --aigc-watermark         添加水印（默认关闭）
  --no-aigc-watermark      不添加水印
  --concurrency <n>        批量模式并发度（--prompts），默认 3

风格（仅 image-01-live）:
  --style <type>           风格类型: ${VALID_STYLES.join(', ')}
  --style-weight <float>   风格权重，范围 (0, 1]，默认 ${t2iConfig.styleWeight}

输出:
  --response-format <fmt>  返回格式，默认 ${t2iConfig.responseFormat}
                           url: 返回图片 URL，脚本自动下载到本地
                           base64: 返回 base64 编码，脚本解码后保存
  --output-dir <dir>       输出目录，默认 ${t2iConfig.outputDir}

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
