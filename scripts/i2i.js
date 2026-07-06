#!/usr/bin/env node
/**
 * i2i.js — MiniMax 图生图脚本
 *
 * 用法：
 *   node scripts/i2i.js --input-image ./ref.png --prompt "把背景换成夜晚"   命令行模式
 *   node scripts/i2i.js                                                                交互模式
 *   node scripts/i2i.js --prompts "p1,p2" --input-images "img1.png,img2.png"           批量模式
 *   node scripts/i2i.js --input-image ./ref.png --prompt "..." --aspect-ratio 16:9     进阶选项
 *
 * API 文档：https://platform.minimaxi.com/docs/api-reference/image-generation-i2i
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import { parseArgs, printHelp } from './lib/i2i/cli.js'
import { validate, buildRequestBody, callApi } from './lib/i2i/api.js'
import {
  downloadImage,
  saveBase64Image,
  saveMetadata,
  generateFilename,
} from './lib/i2i/downloader.js'
import { interactiveMode } from './lib/i2i/interactive.js'
import {
  makeSubjectReference,
  resolveInputImage,
} from './lib/i2i/input.js'
import { safeExtractTextSpec, renderTextOverlay } from './lib/i2i/text-overlay.js'
import { i2iConfig, SUBJECT_REFERENCE_DEFAULT_TYPE } from './lib/i2i/constants.js'
import { ensureFontsInstalled, logInstallSummary } from './lib/t2i/install-system-fonts.js'
import { loadPresets, savePreset } from './lib/t2i/presets.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '..')

// .env 由 lib/env.js 模块级自动加载

// 启动时自动补全 ./public/assets/fonts/
ensureFontsInstalled().then(logInstallSummary)

// ===== 并发限流（同 t2i） =====

/**
 * --reuse-background 模式：用现成底图（不调 API），跑 bg-detect + 文字叠加。
 * 行为对齐 t2i 的 reuseBackground 短路：跳过 T2I 生成、直接对底图出图。
 *
 * @param {object} opts - 已含 opts.reuseBackground (绝对或相对路径)
 * @param {string} outputDir
 * @param {object|null} precomputedTextSpec
 * @param {string} apiKey - 文字提取仍需 LLM
 */
async function executeReuseBackground(opts, outputDir, precomputedTextSpec, apiKey) {
  if (!fs.existsSync(opts.reuseBackground)) {
    console.error(`❌ --reuse-background 路径不存在: ${path.resolve(opts.reuseBackground)}`)
    process.exit(1)
  }
  const reuseAbs = path.resolve(opts.reuseBackground)
  console.log(`\n♻️  复用底图模式：跳过 I2I API`)
  console.log(`   底图: ${reuseAbs}`)

  // ===== 文字提取：以 reuse 路径作为 bg-detect 输入 =====
  let textSpec = precomputedTextSpec
  const useTextOverlay = opts.textOverlay !== false
  if (useTextOverlay && !textSpec) {
    console.log('\n🔍 分析 prompt 中的文字需求（基于复用底图）...')
    textSpec = await safeExtractTextSpec(opts.prompt, reuseAbs, apiKey)
    console.log(`   检测到 ${textSpec.texts.length} 处文字:`)
    for (const t of textSpec.texts) {
      console.log(
        `   - "${t.content}" ${t.fontHint ? `(${t.fontHint})` : ''} @ ${JSON.stringify(t.position)}`
      )
    }
    if (textSpec.bgInfo) {
      console.log(
        `   底图实测: ${textSpec.bgInfo.width}x${textSpec.bgInfo.height}, 主色 ${textSpec.bgInfo.dominantColor?.hex || '(none)'}`
      )
    }
  }
  if (textSpec && textSpec.texts.length === 0) {
    textSpec = null
  }

  const timestamp = Date.now()
  const filename = generateFilename(timestamp, 0)
  const filepath = path.join(outputDir, filename)
  fs.mkdirSync(outputDir, { recursive: true })
  fs.copyFileSync(reuseAbs, filepath)

  const size = fs.statSync(filepath).size
  const results = [{ filename, size, reusedFrom: reuseAbs }]
  console.log(`\n📂 已复用底图为 ${filename} (${(size / 1024).toFixed(1)} KB)`)

  // ===== 文字叠加 =====
  if (textSpec && textSpec.texts.length > 0) {
    console.log(`\n🔤 叠加 ${textSpec.texts.length} 处文字...`)
    const tmpPath = filepath + '.tmp.png'
    try {
      await renderTextOverlay(filepath, textSpec.texts, tmpPath)
      fs.renameSync(tmpPath, filepath)
      console.log(`  ✅ ${filename}`)
    } catch (err) {
      console.error(`  ❌ ${filename}: ${err.message}`)
    }
  }

  // ===== 保存元数据 =====
  const extra = {
    inputMeta: { absPath: reuseAbs, mime: null, size, sha256: '', isUrl: false, reusedFrom: true },
    bgInfo: textSpec?.bgInfo || null,
  }
  const metaPath = saveMetadata(outputDir, timestamp, { ...opts, textSpec }, results, extra)
  console.log(`\n📄 元数据: ${path.relative(PROJECT_ROOT, metaPath)}`)
  console.log(`✅ 完成：成功 1，失败 0`)
}


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
  // dry-run 模式
  if (opts.dryRun) {
    // 仅校验输入图（不读 base64 进内存）—— 走 resolveInputImage 后用占位摘要代替 image_file。
    const dryMeta = resolveInputImage(opts.inputImage)
    const subjectType = opts.subjectType || SUBJECT_REFERENCE_DEFAULT_TYPE
    const placeholder =
      dryMeta.isUrl || opts.useInputImageUrl
        ? dryMeta.absPath
        : `<local:${path.basename(dryMeta.absPath)}, ${(dryMeta.size / 1024).toFixed(1)} KB, sha256=${dryMeta.sha256.slice(0, 12)}...>`
    opts.subjectReference = { type: subjectType, image_file: placeholder }

    const requestBody = buildRequestBody(opts)
    console.log('\n📋 dry-run 请求参数预览 (i2i):')
    console.log(`   Model: ${requestBody.model}`)
    console.log(
      `   Prompt: ${requestBody.prompt.slice(0, 80)}${requestBody.prompt.length > 80 ? '...' : ''}`
    )
    if (requestBody.subject_reference) {
      const sr = requestBody.subject_reference[0]
      const file = String(sr.image_file)
      const isPlaceholder = file.startsWith('<local:') || file.startsWith('https://') || file.startsWith('http://')
      console.log(
        `   Subject Reference: type=${sr.type}, image_file=${isPlaceholder ? file : `<base64:${file.length} chars>`}`
      )
    }
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

    if (opts.textOverlay !== false) {
      console.log('\n🔍 分析 prompt 中的文字需求 (dry-run 正则提取)...')
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
        console.log(`   检测到 ${texts.length} 处文字:`)
        for (const t of texts) console.log(`   - "${t.content}" @ ${JSON.stringify(t.position)}`)
        console.log(`   cleanPrompt: ${cleanPrompt.slice(0, 80)}${cleanPrompt.length > 80 ? '...' : ''}`)
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

  // ===== 解析输入图（normal 需要；reuse-background 模式可省略） =====
  let inputMeta = null
  if (!opts.inputImage && !opts.reuseBackground) {
    console.error(`❌ 缺少 --input-image（或 --reuse-background <path> 作"换 prompt 复用底图"）`)
    process.exit(1)
  }
  if (opts.inputImage) {
    const { ref: subjectReference, meta } = makeSubjectReference(opts.inputImage, {
      subjectType: opts.subjectType,
      useInputImageUrl: opts.useInputImageUrl,
    })
    opts.subjectReference = subjectReference
    inputMeta = meta
  }

  const outputDir = path.resolve(opts.outputDir || i2iConfig.outputDir)
  fs.mkdirSync(outputDir, { recursive: true })

  // ===== reuse-background 短路：跳过 I2I API，直接用现成底图叠加文字 =====
  if (opts.reuseBackground) {
    return await executeReuseBackground(opts, outputDir, precomputedTextSpec, apiKey)
  }

  // ===== 文字提取（normal 路径） =====
  let textSpec = precomputedTextSpec
  const useTextOverlay = opts.textOverlay !== false
  if (useTextOverlay && !textSpec) {
    console.log('\n🔍 分析 prompt 中的文字需求（基于参考图）...')
    const refPath = opts.inputImage && !/^https?:\/\//i.test(opts.inputImage)
      ? path.resolve(opts.inputImage)
      : null
    if (!refPath) {
      console.warn('⚠️ 输入图为 URL，跳过 bg-detect / 文字叠加')
      textSpec = { bgInfo: null, mainRect: null, dominantColor: null, texts: [] }
    } else {
      textSpec = await safeExtractTextSpec(opts.prompt, refPath, apiKey)
    }

    console.log(`   检测到 ${textSpec.texts.length} 处文字:`)
    for (const t of textSpec.texts) {
      console.log(
        `   - "${t.content}" ${t.fontHint ? `(${t.fontHint})` : ''} @ ${JSON.stringify(t.position)}`
      )
    }
    if (textSpec.bgInfo) {
      const dr = textSpec.bgInfo.dominantColor
      console.log(
        `   参考图实测: ${textSpec.bgInfo.width}x${textSpec.bgInfo.height}, 主色 ${dr?.hex || '(none)'}`
      )
    }
  }
  // 文字叠加只在 prompt 确实产生文字时启用
  if (textSpec && textSpec.texts.length === 0) {
    textSpec = null
  }

  const requestBody = buildRequestBody(opts)
  const timestamp = Date.now()
  const results = []

  console.log('\n📡 调用 MiniMax I2I API...')
  console.log(`   Model: ${requestBody.model}`)
  console.log(
    `   Prompt: ${requestBody.prompt.slice(0, 80)}${requestBody.prompt.length > 80 ? '...' : ''}`
  )
  console.log(
    `   Subject Reference: type=${requestBody.subject_reference[0].type}, image_file=${String(requestBody.subject_reference[0].image_file).slice(0, 60)}...`
  )
  if (requestBody.aspect_ratio) console.log(`   Aspect Ratio: ${requestBody.aspect_ratio}`)
  if (requestBody.width && requestBody.height)
    console.log(`   Resolution: ${requestBody.width}x${requestBody.height}`)
  if (requestBody.style)
    console.log(
      `   Style: ${requestBody.style.style_type} (weight: ${requestBody.style.style_weight ?? 0.8})`
    )
  if (requestBody.prompt_optimizer != null) console.log(`   Prompt Optimizer: ${requestBody.prompt_optimizer}`)
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
    } else {
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
    }
  } else {
    const images = data.data?.image_base64 || []
    if (images.length === 0) {
      console.log('⚠️ 没有生成任何图片（可能被内容安全过滤）')
    } else {
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

  // ===== 保存输入图副本作为 "背景"（--save-background 启用时） =====
  if (opts.saveBackground && results.length > 0 && !results[0].error) {
    const bgFilename = `i2i-${timestamp}-bg.png`
    const bgPath = path.join(outputDir, bgFilename)
    if (!inputMeta.isUrl) {
      try {
        fs.copyFileSync(inputMeta.absPath, bgPath)
        console.log(`\n💾 输入图副本已保存: ${bgFilename}`)
      } catch (err) {
        console.warn(`⚠️ 保存输入图副本失败: ${err.message}`)
      }
    } else {
      console.log(
        `\n⚠️ 输入图为 URL，已跳过本地副本保存（save-background 仅对本地输入图生效）`
      )
    }
  }

  // ===== 文字叠加到生成图上 =====
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

  // ===== 保存元数据 =====
  const extra = { inputMeta, bgInfo: textSpec?.bgInfo || null }
  const metaPath = saveMetadata(outputDir, timestamp, { ...opts, textSpec }, results, extra)
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

  // --rerender 模式：读 metadata 重新执行文字叠加。
  // 图生图的 rerender 等价于"用记录中的底图 + 当时提取的 texts 重新画"。
  // 与 t2i 不同：i2i 的底图始终是 metadata 里的 backgroundPath（输入图副本）。
  if (opts.rerender) {
    const metaPath = path.resolve(opts.rerender)
    if (!fs.existsSync(metaPath)) {
      const looksLikeShellEscape =
        !opts.rerender.includes('/') && !opts.rerender.includes('\\') && opts.rerender.length > 8
      if (looksLikeShellEscape) {
        console.error(`❌ metadata 文件不存在: ${metaPath}`)
        console.error(`\n提示: 路径看起来被 shell 转义吃掉了。`)
        console.error(`  - PowerShell/cmd 用反斜杠时必须加双引号:`)
        console.error(`    node scripts/i2i.js --rerender "public\\images\\i2i-foo-metadata.json"`)
        console.error(`  - Git Bash 建议直接用正斜杠:`)
        console.error(`    node scripts/i2i.js --rerender public/images/i2i-foo-metadata.json`)
      } else {
        console.error(`❌ metadata 文件不存在: ${metaPath}`)
      }
      process.exit(1)
    }
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
    if (meta.type !== 'i2i') {
      console.error(`❌ metadata.type="${meta.type}"，不是 i2i metadata，拒绝处理`)
      process.exit(1)
    }
    const texts = meta.textOverlay?.texts
    if (!texts || texts.length === 0) {
      console.error('❌ metadata 中没有 textOverlay.texts，无法重渲染')
      process.exit(1)
    }

    // 底图优先级：1) inputImage.absPath（复用背景场景，输入图即底图）
    //              2) backgroundPath（"保存背景"场景，单独写入的 i2i-{ts}-bg.png）
    //              3) results[0].filename（输出图本身；用于直接重绘输出图）
    const candidates = [
      meta.inputImage?.absPath,
      meta.backgroundPath && path.join(path.dirname(metaPath), meta.backgroundPath),
      meta.results[0]?.filename && path.join(path.dirname(metaPath), meta.results[0].filename),
    ].filter(Boolean)
    const bgPath = candidates.find((p) => fs.existsSync(p))
    if (!bgPath) {
      console.error(
        `❌ 底图不存在（尝试过 inputImage / backgroundPath / results[0] 都未找到）`
      )
      process.exit(1)
    }

    console.log(`\n🔤 重新渲染文字叠加 (i2i)...`)
    console.log(`   底图: ${bgPath}`)
    console.log(`   文字: ${texts.length} 处`)
    for (const t of texts) {
      console.log(
        `   - "${t.content}" ${t.fontHint ? `(${t.fontHint})` : ''} @ ${JSON.stringify(t.position)}`
      )
    }

    const outputPath = metaPath.replace(/-metadata\.json$/, '-rerender.png')
    await renderTextOverlay(bgPath, texts, outputPath)
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
      console.log(
        `\n🚀 批量模式（i2i）：${opts.prompts.length} 个 prompt × ${opts.inputImages.length} 张输入图，并发度 ${concurrency}`
      )
      if (useTextOverlay) console.log(`   阶段 1/2：并发分析每张输入图 bg-detect + 文字提取`)

      // 校验每个 --input-images
      const apiKey0 = opts.apiKey || process.env.LLM_API_KEY
      const validatedImages = opts.inputImages.map(img => {
        try {
          return resolveInputImage(img) // 提前校验；URL 也通过
        } catch (err) {
          console.error(`   ❌ 输入图无效: ${img} → ${err.message}`)
          process.exit(1)
        }
      })

      const textSpecs = useTextOverlay
        ? await runWithConcurrency(
            opts.prompts.map((p, i) => ({ p, i, img: validatedImages[i] })),
            async ({ p, i, img }) => {
              try {
                console.log(
                  `   🔍 [${i + 1}/${opts.prompts.length}] 提取文字: "${p.slice(0, 40)}..." (图: ${path.basename(img.absPath)})`
                )
                // URL 跳过 bg-detect（按 buffer 读不到）
                if (img.isUrl) {
                  console.warn(`   ⚠️ [${i + 1}] 输入图为 URL，跳过 bg-detect / 文字叠加`)
                  return { bgInfo: null, mainRect: null, dominantColor: null, texts: [] }
                }
                return await safeExtractTextSpec(p, img.absPath, apiKey0)
              } catch (err) {
                console.error(`   ⚠️  [${i + 1}] 文字提取失败: ${err.message}`)
                return { bgInfo: null, texts: [] }
              }
            },
            concurrency
          )
        : null

      console.log(`\n   阶段 2/2：并发调用 I2I API（限流 ${concurrency}）`)
      const results = await runWithConcurrency(
        opts.prompts.map((p, i) => ({
          p,
          i,
          img: validatedImages[i],
          textSpec: textSpecs?.[i] || null,
        })),
        async ({ p, i, img, textSpec }) => {
          const promptOpts = { ...opts, prompt: p, inputImage: img.absPath }
          delete promptOpts.prompts
          delete promptOpts.inputImages
          const { valid, errors } = validate(promptOpts)
          if (!valid) {
            console.error(`\n❌ Prompt ${i + 1}/${opts.prompts.length} 校验失败:`)
            for (const e of errors) console.error(`  ${e}`)
            return { success: false, error: new Error('validation failed') }
          }
          console.log(
            `\n🖼️  [${i + 1}/${opts.prompts.length}] Prompt: "${promptOpts.prompt.slice(0, 60)}..." (图: ${path.basename(img.absPath)})`
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
    // 加载预设（如果指定）：preset 提供默认值，CLI 参数覆盖。
    // 与 t2i 行为对齐：剥离 inputImage/prompt/seed/reuseBackground/saveBackground 等 runtime 字段不存
    if (opts.preset) {
      const presets = loadPresets(i2iConfig.presetsFile)
      if (!presets[opts.preset]) {
        console.error(`❌ 预设 "${opts.preset}" 不存在`)
        console.error(`   可用预设: ${Object.keys(presets).join(', ') || '(无)'}`)
        process.exit(1)
      }
      const { inputImage, prompt, seed, reuseBackground, saveBackground, ...presetConfig } =
        presets[opts.preset]
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
