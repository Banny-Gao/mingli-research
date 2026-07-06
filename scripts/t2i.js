#!/usr/bin/env node
/**
 * t2i.js — MiniMax 文生图脚本
 *
 * 用法：
 *   node scripts/t2i.js                                   交互模式
 *   node scripts/t2i.js --prompt "制作一个古籍封面：1：书籍名称：滴天髓阐微，作者信息：任铁樵著，2：字体样式：黑色 古风 3：背景样式：鎏金边，水墨蓝背景，要简约典雅而有设计感，不要做的跟门框一一样，文字区域适当预留白色底，风格古朴仿旧 ，4：图片比例：正常 32 开书籍比例，5：其他细节：书籍名文字竖排，作者名横排在封面合适位置合适大小"      命令行模式
 *   node scripts/t2i.js --prompt "..." --model image-01-live --style 水彩 --aspect-ratio 16:9 --n 3
 *   node scripts/t2i.js --prompts "猫,狗,鸟" --style 水彩   批量模式
 *
 * API 文档：https://platform.minimaxi.com/docs/api-reference/image-generation-t2i
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import { parseArgs, printHelp } from './lib/t2i/cli.js'
import { validate, buildRequestBody, callApi } from './lib/t2i/api.js'
import {
  downloadImage,
  saveBase64Image,
  saveMetadata,
  generateFilename,
} from './lib/t2i/downloader.js'
import { interactiveMode } from './lib/t2i/interactive.js'
import { loadPresets } from './lib/t2i/presets.js'
import { extractTextSpec, renderTextOverlay, layoutFromBackground } from './lib/t2i/text-overlay.js'
import { t2iConfig } from './lib/t2i/constants.js'
import { ensureFontsInstalled, logInstallSummary } from './lib/t2i/install-system-fonts.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '..')

// .env 由 lib/env.js 模块级自动加载，此处无需重复

// 启动时自动补全 ./public/assets/fonts/（本地复制 + 网络下载 + 进度条）
// 进程内只跑一次，结果日志立即打印。
ensureFontsInstalled().then(logInstallSummary)

// ===== 并发限流工具 =====

/**
 * 复用背景场景：从背景图对应的 metadata 提取 reservedAreas + cleanPrompt，
 * 重跑步骤 1 (intent) + 步骤 3 (layout)，跳过步骤 2 (cleanPrompt 创作 —— 背景已生成)。
 *
 * metadata 路径推导：背景文件名 `t2i-{ts}-bg.png` → 元数据 `t2i-{ts}-metadata.json`。
 * 如果找不到对应 metadata，退化为完整 extractTextSpec（仍跑全 3 步）。
 */
async function extractTextSpecForReuse(prompt, bgPath, apiKey) {
  const { INTENT_ANALYSIS_PROMPT, INTENT_SYSTEM } = await import('./lib/t2i/prompts/intent.js')
  const { callLLM, createLLMClient } = await import('./lib/llm-client.js')
  const { llmConfig } = await import('./lib/env.js')
  const { cleanJSON } = await import('./lib/t2i/sanitize.js')

  // 找 metadata
  const dir = path.dirname(bgPath)
  const base = path.basename(bgPath)
  // 把 "-bg.png" 结尾的转换为 "-metadata.json"
  const metaCandidate = base.replace(/-bg\.(png|jpg|jpeg)$/i, '-metadata.json')
  const metaPath = path.join(dir, metaCandidate)

  let reservedAreas = []
  let cleanPrompt = ''
  let previousFontHints = []
  let previousTexts = []
  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
      reservedAreas = Array.isArray(meta.textOverlay?.reservedAreas)
        ? meta.textOverlay.reservedAreas
        : []
      cleanPrompt = meta.textOverlay?.cleanPrompt || ''
      previousTexts = Array.isArray(meta.textOverlay?.texts) ? meta.textOverlay.texts : []
      previousFontHints = previousTexts.map(t => t.fontHint).filter(Boolean)
      // 为没有 purpose 字段的旧 metadata 自动推断段位（按位置+字号启发式）
      for (const t of previousTexts) {
        if (!t.purpose) {
          const fontSize = t.size || 0
          const yPct = parseFloat(String(t.position?.y || '0')) || 0
          if (fontSize >= 48) t.purpose = 'main-title'
          else if (yPct > 70) t.purpose = 'signature'
          else if (fontSize >= 24) t.purpose = 'subtitle'
          else if (fontSize >= 16) t.purpose = 'author'
          else t.purpose = 'decoration'
        }
      }
      console.log(
        `   📄 复用 metadata: ${path.relative(PROJECT_ROOT, metaPath)} (${reservedAreas.length} 个预留区, ${previousFontHints.length} 个字体风格延续)`
      )
    } catch (err) {
      console.warn(`   ⚠️ 读 metadata 失败 (${metaPath}): ${err.message}`)
    }
  } else {
    console.log(`   ⚠️ 找不到对应 metadata (${metaPath})，将完整跑 3 步 LLM`)
    return await extractTextSpec(prompt, apiKey)
  }

  // 重跑步骤 1 (intent)
  const client = createLLMClient({ apiKey })
  const baseOpts = {
    model: llmConfig.model,
    maxTokens: 4096,
    extendedThinking: true,
  }
  const intentRaw = await callLLM(client, {
    ...baseOpts,
    system: INTENT_SYSTEM,
    messages: [{ role: 'user', content: `${INTENT_ANALYSIS_PROMPT}\n\n用户描述：${prompt}` }],
  })
  const intent = JSON.parse(cleanJSON(intentRaw))

  // 步骤 3 (layout)
  const texts = await layoutFromBackground({
    intent,
    reservedAreas,
    cleanPrompt,
    prompt,
    apiKey,
    previousFontHints,
    previousTexts,
  })

  return { cleanPrompt, reservedAreas, texts }
}

/**
 * 用固定大小 worker 池执行异步任务（简单的 Promise 并发限流）。
 * 任务完成后立刻拉下一个，无需等待整批。
 */
async function runWithConcurrency(items, worker, concurrency) {
  const results = new Array(items.length)
  let next = 0

  async function run() {
    while (true) {
      const idx = next++
      if (idx >= items.length) return
      try {
        results[idx] = await worker(items[idx], idx)
      } catch (err) {
        results[idx] = { success: false, error: err }
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, run)
  await Promise.all(workers)
  return results
}

// ===== 命令行模式执行 =====
async function executeRequest(opts, precomputedTextSpec = null) {
  // dry-run 模式：无需 API key，仅展示参数摘要
  if (opts.dryRun) {
    const requestBody = buildRequestBody(opts)
    console.log('\n📋 dry-run 请求参数预览:')
    console.log(`   Model: ${requestBody.model}`)
    console.log(
      `   Prompt: ${requestBody.prompt.slice(0, 80)}${requestBody.prompt.length > 80 ? '...' : ''}`
    )
    if (requestBody.aspect_ratio) console.log(`   Aspect Ratio: ${requestBody.aspect_ratio}`)
    if (requestBody.width && requestBody.height)
      console.log(`   Resolution: ${requestBody.width}x${requestBody.height}`)
    if (requestBody.style)
      console.log(
        `   Style: ${requestBody.style.style_type} (weight: ${requestBody.style.style_weight ?? 0.8})`
      )
    if (requestBody.prompt_optimizer) console.log(`   Prompt Optimizer: on`)
    if (requestBody.aigc_watermark) console.log(`   Watermark: on`)
    console.log(`   Count: ${requestBody.n || 1}`)

    // dry-run 也用正则快速分析文字需求（不调 LLM）
    if (opts.textOverlay !== false) {
      console.log('\n🔍 分析 prompt 中的文字需求...')
      const matched = requestBody.prompt.match(/《([^》]+)》/g)
      if (matched) {
        const texts = matched.map(m => ({
          content: m.replace(/^《|》$/g, ''),
          position: { x: 'center', y: 'center' },
        }))
        const cleanPrompt = requestBody.prompt
          .replace(/《[^》]+》/g, '')
          .replace(/\s+/g, ' ')
          .trim()
        console.log(`   检测到 ${texts.length} 处文字 (dry-run 正则提取):`)
        for (const t of texts) {
          console.log(`   - "${t.content}" @ ${JSON.stringify(t.position)}`)
        }
        console.log(
          `   cleanPrompt: ${cleanPrompt.slice(0, 80)}${cleanPrompt.length > 80 ? '...' : ''}`
        )
      } else {
        console.log('   未检测到需要精确显示的文字')
      }
    }

    console.log('\n🔍 dry-run 模式，未发起实际调用')
    return
  }

  const apiKey = opts.apiKey || process.env.LLM_API_KEY
  if (!apiKey) {
    console.error(
      `❌ 缺少 MiniMax API Key\n\n` +
        `请按以下任一方式配置：\n` +
        `1. 在 .env 中设置 LLM_API_KEY=...\n` +
        `2. 在 shell 中 export：export LLM_API_KEY=...\n` +
        `3. 用 CLI 参数：--api-key ...\n\n` +
        `获取 API Key：https://platform.minimaxi.com`
    )
    process.exit(1)
  }

  const requestBody = buildRequestBody(opts)
  const outputDir = path.resolve(opts.outputDir || t2iConfig.outputDir)
  fs.mkdirSync(outputDir, { recursive: true })

  // 文字提取与叠加
  // 注意：批量模式下 textSpec 由外层并发提取后传入（precomputedTextSpec），
  // 避免 N 个 prompt × 3 步 LLM 在 worker 内同时打 API。
  let textSpec = precomputedTextSpec
  const useTextOverlay = opts.textOverlay !== false
  if (useTextOverlay && !textSpec) {
    console.log('\n🔍 分析 prompt 中的文字需求...')
    // 复用背景场景：从最近 metadata 读 reservedAreas + cleanPrompt，
    // 只重跑 layout 步骤（不重跑 clean —— 背景已生成）。
    if (opts.reuseBackground) {
      textSpec = await extractTextSpecForReuse(requestBody.prompt, opts.reuseBackground, apiKey)
    } else {
      textSpec = await extractTextSpec(requestBody.prompt, apiKey)
    }

    console.log(`   检测到 ${textSpec.texts.length} 处文字:`)
    for (const t of textSpec.texts) {
      console.log(
        `   - "${t.content}" ${t.fontHint ? `(${t.fontHint})` : ''} @ ${JSON.stringify(t.position)}`
      )
    }
  }
  if (textSpec && !opts.reuseBackground) {
    // 用 cleanPrompt 替换原始 prompt 生成背景（复用背景时背景已生成，跳过）
    requestBody.prompt = textSpec.cleanPrompt
  }

  const timestamp = Date.now()
  const results = []

  // 复用背景模式：跳过 T2I 生成
  if (opts.reuseBackground) {
    if (!fs.existsSync(opts.reuseBackground)) {
      console.error(`❌ 背景文件不存在: ${opts.reuseBackground}`)
      process.exit(1)
    }
    console.log(`\n📂 复用背景: ${opts.reuseBackground}`)
    const filename = generateFilename(timestamp, 0)
    const filepath = path.join(outputDir, filename)
    fs.copyFileSync(opts.reuseBackground, filepath)
    results.push({ filename, size: fs.statSync(filepath).size })
  } else {
    // 正常 T2I 生成流程
    console.log('\n📡 调用 MiniMax T2I API...')
    console.log(`   Model: ${requestBody.model}`)
    console.log(
      `   Prompt: ${requestBody.prompt.slice(0, 80)}${requestBody.prompt.length > 80 ? '...' : ''}`
    )
    if (requestBody.aspect_ratio) console.log(`   Aspect Ratio: ${requestBody.aspect_ratio}`)
    if (requestBody.width && requestBody.height)
      console.log(`   Resolution: ${requestBody.width}x${requestBody.height}`)
    if (requestBody.style)
      console.log(
        `   Style: ${requestBody.style.style_type} (weight: ${requestBody.style.style_weight ?? 0.8})`
      )
    if (requestBody.prompt_optimizer) console.log(`   Prompt Optimizer: on`)
    if (requestBody.aigc_watermark) console.log(`   Watermark: on`)
    console.log(`   Count: ${requestBody.n || 1}`)

    const data = await callApi(apiKey, requestBody, { verbose: opts.verbose })

    const statusCode = data.base_resp?.status_code
    if (statusCode !== 0) {
      throw new Error(`API 错误 (${statusCode}): ${data.base_resp?.status_msg || 'unknown error'}`)
    }

    const format = requestBody.response_format || 'url'

    if (format === 'url') {
      const urls = data.data?.image_urls || []
      if (urls.length === 0) {
        console.log('⚠️ 没有生成任何图片（可能被内容安全过滤）')
        return
      }

      console.log(`\n📥 并行下载 ${urls.length} 张图片到 ${outputDir} ...`)
      const downloadTasks = urls.map((url, i) => async () => {
        const filename = generateFilename(timestamp, i)
        const filepath = path.join(outputDir, filename)
        try {
          const size = await downloadImage(url, filepath, {
            onProgress: opts.verbose
              ? p => {
                  process.stdout.write(`\r  [${i + 1}/${urls.length}] ${filename} ${p.percent}%`)
                }
              : undefined,
          })
          if (opts.verbose) process.stdout.write('\n')
          console.log(`  [${i + 1}/${urls.length}] ${filename} (${(size / 1024).toFixed(1)} KB)`)
          return { filename, size, url }
        } catch (err) {
          console.error(`  [${i + 1}/${urls.length}] ❌ ${err.message}`)
          return { filename, size: 0, error: err.message }
        }
      })
      results.push(...(await Promise.all(downloadTasks.map(t => t()))))
    } else {
      const images = data.data?.image_base64 || []
      if (images.length === 0) {
        console.log('⚠️ 没有生成任何图片（可能被内容安全过滤）')
        return
      }

      console.log(`\n💾 并行保存 ${images.length} 张图片到 ${outputDir} ...`)
      const saveTasks = images.map((img, i) => () => {
        const filename = generateFilename(timestamp, i)
        const filepath = path.join(outputDir, filename)
        try {
          const size = saveBase64Image(img, filepath)
          console.log(`  [${i + 1}/${images.length}] ${filename} (${(size / 1024).toFixed(1)} KB)`)
          return { filename, size }
        } catch (err) {
          console.error(`  [${i + 1}/${images.length}] ❌ ${err.message}`)
          return { filename, size: 0, error: err.message }
        }
      })
      results.push(...(await Promise.all(saveTasks.map(t => t()))))
    }
  }

  // 保存纯背景（文字叠加前）
  if (opts.saveBackground && results.length > 0 && !results[0].error) {
    const bgFilename = `t2i-${timestamp}-bg.png`
    const bgPath = path.join(outputDir, bgFilename)
    const srcPath = path.join(outputDir, results[0].filename)
    fs.copyFileSync(srcPath, bgPath)
    console.log(`\n💾 背景已保存: ${bgFilename}`)
  }

  // 文字叠加
  if (textSpec && textSpec.texts.length > 0) {
    console.log(`\n🔤 叠加 ${textSpec.texts.length} 处文字...`)
    for (const r of results) {
      if (r.error) continue
      const bgPath = path.join(outputDir, r.filename)
      const tmpPath = bgPath + '.tmp.png'
      try {
        await renderTextOverlay(bgPath, textSpec.texts, tmpPath)
        fs.renameSync(tmpPath, bgPath)
        console.log(`  ✅ ${r.filename}`)
      } catch (err) {
        console.error(`  ❌ ${r.filename}: ${err.message}`)
      }
    }
  }

  // 保存元数据
  const metaPath = saveMetadata(outputDir, timestamp, { ...opts, textSpec }, results)
  console.log(`\n📄 元数据: ${path.relative(PROJECT_ROOT, metaPath)}`)

  const successCount = results.filter(r => !r.error).length
  const failedCount = results.filter(r => r.error).length
  console.log(`✅ 完成：成功 ${successCount}，失败 ${failedCount}`)
}

// ===== 入口路由 =====
const args = process.argv.slice(2)

if (args.length === 0) {
  interactiveMode(executeRequest).catch(err => {
    console.error('❌ 未预期的错误:', err.message)
    process.exit(1)
  })
} else {
  let opts = parseArgs(args)

  if (opts.help) {
    printHelp()
    process.exit(0)
  }

  // rerender 模式：读取 metadata 重新渲染文字
  if (opts.rerender) {
    const metaPath = path.resolve(opts.rerender)
    if (!fs.existsSync(metaPath)) {
      // 启发式检测 shell 反斜杠被吞：路径里完全没有 / 或 \（连一处都没有），
      // 但用户又写出了 `publicimagesxxx` 这种拼接形式 —— 几乎肯定是 PowerShell/cmd
      // 把 `\i` 等转义吃掉了。
      const looksLikeShellEscape =
        !opts.rerender.includes('/') && !opts.rerender.includes('\\') && opts.rerender.length > 8
      if (looksLikeShellEscape) {
        console.error(`❌ metadata 文件不存在: ${metaPath}`)
        console.error(`\n提示: 路径看起来被 shell 转义吃掉了。`)
        console.error(`  - PowerShell/cmd 用反斜杠时必须加双引号:`)
        console.error(`    node scripts/t2i.js --rerender "public\\images\\file-metadata.json"`)
        console.error(`  - Git Bash 建议直接用正斜杠:`)
        console.error(`    node scripts/t2i.js --rerender public/images/file-metadata.json`)
      } else {
        console.error(`❌ metadata 文件不存在: ${metaPath}`)
      }
      process.exit(1)
    }
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
    if (meta.type && meta.type !== 't2i') {
      console.error(
        `❌ metadata.type="${meta.type}"，不是 t2i metadata；请用 scripts/${meta.type}.js --rerender 处理`
      )
      process.exit(1)
    }
    if (!meta.textOverlay || !meta.textOverlay.texts || meta.textOverlay.texts.length === 0) {
      console.error('❌ metadata 中没有 textOverlay 数据')
      process.exit(1)
    }
    const bgPath = meta.backgroundPath
      ? path.join(path.dirname(metaPath), meta.backgroundPath)
      : path.join(path.dirname(metaPath), meta.results[0]?.filename)
    if (!bgPath || !fs.existsSync(bgPath)) {
      console.error(`❌ 背景图不存在: ${bgPath || '(未找到)'}`)
      process.exit(1)
    }

    console.log(`\n🔤 重新渲染文字叠加...`)
    console.log(`   背景: ${bgPath}`)
    console.log(`   文字: ${meta.textOverlay.texts.length} 处`)
    for (const t of meta.textOverlay.texts) {
      console.log(
        `   - "${t.content}" ${t.fontHint ? `(${t.fontHint})` : ''} @ ${JSON.stringify(t.position)}`
      )
    }

    const outputPath = metaPath.replace(/-metadata\.json$/, '-rerender.png')
    await renderTextOverlay(bgPath, meta.textOverlay.texts, outputPath)
    console.log(`\n✅ 输出: ${outputPath}`)
    process.exit(0)
  }

  // --prompt 和 --prompts 互斥检查
  if (opts.prompt && opts.prompts) {
    console.error('❌ --prompt 和 --prompts 互斥，请只指定其中一个')
    process.exit(1)
  }

  // 批量模式
  if (opts.prompts && opts.prompts.length > 0) {
    const main = async () => {
      const concurrency = Math.max(1, opts.concurrency || 3)
      const useTextOverlay = opts.textOverlay !== false
      console.log(`\n🚀 批量模式：${opts.prompts.length} 个 prompt，并发度 ${concurrency}`)
      if (useTextOverlay) {
        console.log(`   阶段 1/2：并发提取文字需求（限流 ${concurrency}）`)
      } else {
        console.log(`   跳过文字提取（已禁用 text-overlay）`)
      }

      // ===== 阶段 1：先并发做 LLM 文字提取（限流） =====
      // 避免 worker 内部 N 个 prompt × 3 步 LLM 同时打 API。
      // 提取失败的 prompt 回退为 { cleanPrompt: 原文, texts: [] }，不阻断流程。
      const apiKey = opts.apiKey || process.env.LLM_API_KEY
      const textSpecs = useTextOverlay
        ? await runWithConcurrency(
            opts.prompts.map((p, i) => ({ p, i })),
            async ({ p, i }) => {
              try {
                console.log(
                  `   🔍 [${i + 1}/${opts.prompts.length}] 提取文字: "${p.slice(0, 40)}..."`
                )
                return await extractTextSpec(p, apiKey)
              } catch (err) {
                console.error(`   ⚠️  [${i + 1}] 文字提取失败: ${err.message}，使用原 prompt`)
                return { cleanPrompt: p, texts: [] }
              }
            },
            concurrency
          )
        : null

      // ===== 阶段 2：并发执行 T2I（传入预提取的 textSpec） =====
      console.log(`\n   阶段 2/2：并发生成图片（限流 ${concurrency}）`)
      const results = await runWithConcurrency(
        opts.prompts.map((p, i) => ({ p, i, textSpec: textSpecs?.[i] || null })),
        async ({ p, i, textSpec }) => {
          const promptOpts = { ...opts, prompt: p }
          delete promptOpts.prompts
          const { valid, errors } = validate(promptOpts)
          if (!valid) {
            console.error(`\n❌ Prompt ${i + 1}/${opts.prompts.length} 校验失败:`)
            for (const e of errors) console.error(`  ${e}`)
            return { success: false, error: new Error('validation failed') }
          }
          console.log(
            `\n🖼️  [${i + 1}/${opts.prompts.length}] Prompt: "${promptOpts.prompt.slice(0, 60)}..."`
          )
          try {
            await executeRequest(promptOpts, textSpec)
            return { success: true }
          } catch (err) {
            console.error(`❌ Prompt ${i + 1} 失败: ${err.message}`)
            return { success: false, error: err }
          }
        },
        concurrency
      )

      const totalSuccess = results.filter(r => r?.success).length
      const totalFailed = results.length - totalSuccess
      console.log(`\n🏁 批量完成：成功 ${totalSuccess}，失败 ${totalFailed}`)
      process.exit(totalFailed > 0 ? 1 : 0)
    }
    main().catch(err => {
      console.error('❌ 未预期的错误:', err.message)
      process.exit(1)
    })
  } else {
    // 单 prompt 模式
    // 加载预设（如果指定）
    if (opts.preset) {
      const presets = loadPresets()
      if (!presets[opts.preset]) {
        console.error(`❌ 预设 "${opts.preset}" 不存在`)
        console.error(`   可用预设: ${Object.keys(presets).join(', ') || '(无)'}`)
        process.exit(1)
      }
      const { prompt: presetPrompt, seed: presetSeed, ...presetConfig } = presets[opts.preset]
      // 预设值作为默认值，CLI 参数可覆盖
      opts = { ...presetConfig, ...opts }
    }

    const { valid, errors } = validate(opts)
    if (!valid) {
      for (const e of errors) console.error(e)
      process.exit(1)
    }

    executeRequest(opts).catch(err => {
      console.error('❌ 未预期的错误:', err.message)
      process.exit(1)
    })
  }
}
