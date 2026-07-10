#!/usr/bin/env node
/**
 * image-gen.js — MiniMax 图片生成统一入口
 *
 * 用法：
 *   node scripts/image-gen.js --mode t2i                                   交互模式
 *   node scripts/image-gen.js --mode t2i --prompt "..."                     命令行模式
 *   node scripts/image-gen.js --mode t2i --prompts "猫,狗,鸟" --style 水彩   批量模式
 *   node scripts/image-gen.js --mode i2i                                   交互模式
 *   node scripts/image-gen.js --mode i2i --input-image ./ref.png --prompt "..."  命令行模式
 *
 * 兼容入口：scripts/t2i.js 和 scripts/i2i.js 内部委托到本文件。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'

import { parseArgs, printHelpT2I, printHelpI2I } from './lib/image-gen/cli-shared.js'
import { parseInputImages } from './lib/shared/parse-prompts.js'
import { validate, buildRequestBody } from './lib/image-gen/api.js'
import { generateFilename } from './lib/image-gen/downloader.js'
import { loadPresets } from './lib/image-gen/preset.js'
import {
  t2iConfig, i2iConfig,
  VALID_MODELS, VALID_ASPECT_RATIOS, VALID_STYLES, VALID_SUBJECT_TYPES,
} from './lib/image-gen/config.js'
import { T2I_PROFILE, I2I_PROFILE } from './lib/image-gen/profile.js'
import { ensureFontsInstalled, logInstallSummary } from './lib/shared/font-installer.js'
import { runWithConcurrency } from './lib/shared/concurrency.js'
import { spinner, ProgressPanel } from './lib/shared/progress.js'
import { resolveRequestName, resolveBatchNames } from './lib/shared/output-name.js'
import {
  callApiAndCheck, downloadResults, applyTextOverlay, finalizeOutput,
  runRerender, ensureApiKey,
} from './lib/image-gen/execute.js'

const PROJECT_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const _fontResult = await ensureFontsInstalled()
logInstallSummary(_fontResult)

// 空 textSpec 形状：textOverlay 禁用或失败时的 fallback
const EMPTY_TEXT_SPEC = Object.freeze({
  bgInfo: null, mainRect: null, dominantColor: null,
  cleanPrompt: null, reservedAreas: [], texts: [], intent: null, llmCalls: [],
})

// ===== i2i 特有 flag handler =====
const I2I_EXTRA_HANDLERS = {
  '--input-image': (opts, argv, i) => { opts.inputImage = argv[i + 1]; return 1 },
  '--input-images': (opts, argv, i, pending) => { pending.inputImages = parseInputImages(argv[i + 1]); return 1 },
  '--subject-type': (opts, argv, i) => { opts.subjectType = argv[i + 1]; return 1 },
  '--use-input-image-url': opts => { opts.useInputImageUrl = true; return 0 },
  '--no-use-input-image-url': opts => { opts.useInputImageUrl = false; return 0 },
}

// ===== 共享 logApiCall =====

function logApiCall(mode, requestBody) {
  console.log(`\n📡 调用 MiniMax ${mode.toUpperCase()} API...`)
  console.log(`   Model: ${requestBody.model}`)
  console.log(`   Prompt: ${requestBody.prompt.slice(0, 80)}${requestBody.prompt.length > 80 ? '...' : ''}`)
  if (mode === 'i2i' && requestBody.subject_reference?.[0]) {
    const sr = requestBody.subject_reference[0]
    console.log(`   Subject Reference: type=${sr.type}, image_file=${String(sr.image_file).slice(0, 60)}...`)
  }
  if (requestBody.aspect_ratio) console.log(`   Aspect Ratio: ${requestBody.aspect_ratio}`)
  if (requestBody.width && requestBody.height) console.log(`   Resolution: ${requestBody.width}x${requestBody.height}`)
  if (requestBody.style) console.log(`   Style: ${requestBody.style.style_type} (weight: ${requestBody.style.style_weight ?? 0.8})`)
  if (requestBody.prompt_optimizer != null) console.log(`   Prompt Optimizer: ${requestBody.prompt_optimizer}`)
  if (requestBody.aigc_watermark) console.log(`   Watermark: on`)
  console.log(`   Count: ${requestBody.n || 1}`)
}

// ===== getContext =====

async function getContext(mode) {
  const { extractTextSpec: unifiedExtract, extractReuseTextSpec, renderTextOverlay: sharedRender } =
    await import('./lib/image-gen/text-overlay.js')

  const isI2I = mode === 'i2i'
  const profile = isI2I ? I2I_PROFILE : T2I_PROFILE
  const config = isI2I ? i2iConfig : t2iConfig

  const printHelp = isI2I
    ? () => printHelpI2I({
        model: i2iConfig.model, validModels: VALID_MODELS,
        aspectRatio: i2iConfig.aspectRatio, validAspectRatios: VALID_ASPECT_RATIOS,
        validStyles: VALID_STYLES, validSubjectTypes: VALID_SUBJECT_TYPES,
        styleWeight: i2iConfig.styleWeight, responseFormat: i2iConfig.responseFormat,
        outputDir: i2iConfig.outputDir, n: i2iConfig.n,
      })
    : () => printHelpT2I({
        model: t2iConfig.model, validModels: VALID_MODELS,
        aspectRatio: t2iConfig.aspectRatio, validAspectRatios: VALID_ASPECT_RATIOS,
        validStyles: VALID_STYLES, styleWeight: t2iConfig.styleWeight,
        responseFormat: t2iConfig.responseFormat, outputDir: t2iConfig.outputDir, n: t2iConfig.n,
      })

  const base = {
    mode, profile, config, printHelp,
    renderTextOverlay: sharedRender,
    extraHandlers: isI2I ? I2I_EXTRA_HANDLERS : {},
    extractTextSpec: (prompt, apiKey, inputImagePath) =>
      unifiedExtract(mode, prompt, apiKey, isI2I ? { inputImagePath } : {}),
    extractTextSpecForReuse: (prompt, bgPath, apiKey) =>
      extractReuseTextSpec(mode, prompt, bgPath, apiKey),
    extractBatchText: (p, _i, apiKey, img) =>
      isI2I
        ? (img?.isUrl ? Promise.resolve(EMPTY_TEXT_SPEC)
                      : unifiedExtract(mode, p, apiKey, { inputImagePath: img?.absPath }))
        : unifiedExtract(mode, p, apiKey),
    reuseBackgroundHandler: executeReuseBackground,
    interactiveImport: () => import('./lib/image-gen/interactive.js'),
    presetsFile: config.presetsFile,
    presetKeys: isI2I
      ? ['inputImage', 'prompt', 'seed', 'reuseBackground', 'saveBackground', 'name']
      : ['prompt', 'seed', 'reuseBackground', 'saveBackground', 'name'],
    batchModeLabel: isI2I ? 'i2i' : '',
    batchConcurrencyLabel: isI2I
      ? '阶段 1/2：并发分析每张输入图 bg-detect + 文字提取'
      : '阶段 1/2：并发提取文字需求',
  }

  // i2i-only
  if (isI2I) {
    const { makeSubjectReference, resolveInputImage } = await import('./lib/image-gen/input.js')
    base.resolveInput = (opts) => {
      const { ref, meta } = makeSubjectReference(opts.inputImage, {
        subjectType: opts.subjectType, useInputImageUrl: opts.useInputImageUrl,
      })
      opts.subjectReference = ref
      return meta
    }
    base.resolveBatchImages = (opts) =>
      opts.inputImages.map(img => {
        try { return resolveInputImage(img) }
        catch (err) { console.error(`   ❌ 输入图无效: ${img} → ${err.message}`); process.exit(1) }
      })
    base.getExtra = (inputMeta, textSpec) => ({
      inputMeta, bgInfo: textSpec?.bgInfo || null,
    })
    base.getBatchItemExtras = (i, validatedImages) => ({ img: validatedImages[i] })
    base.getBatchPromptOptsExtras = (_p, img) => ({ inputImage: img.absPath })
    base.getBatchTextWorker = (apiKey) => async ({ p, i, img }) => {
      try {
        console.log(`   🔍 [${i + 1}] 提取文字: "${p.slice(0, 40)}..." (图: ${path.basename(img.absPath)})`)
        if (img.isUrl) {
          console.warn(`   ⚠️ [${i + 1}] 输入图为 URL，跳过 bg-detect / 文字叠加`)
          return EMPTY_TEXT_SPEC
        }
        return await unifiedExtract(mode, p, apiKey, { inputImagePath: img.absPath })
      } catch (err) {
        console.error(`   ⚠️  [${i + 1}] 文字提取失败: ${err.message}`)
        return {
          bgInfo: null, mainRect: null, dominantColor: null,
          cleanPrompt: null, reservedAreas: [],
          texts: [], intent: null, llmCalls: [],
        }
      }
    }
  } else {
    // t2i defaults
    base.resolveInput = null
    base.resolveBatchImages = (_opts) => []
    base.getExtra = () => ({})
    base.getBatchItemExtras = (_i) => ({})
    base.getBatchPromptOptsExtras = (_p) => ({})
    base.getBatchTextWorker = (apiKey) => async ({ p, i }) => {
      try {
        console.log(`   🔍 [${i + 1}] 提取文字: "${p.slice(0, 40)}..."`)
        return await unifiedExtract(mode, p, apiKey)
      } catch (err) {
        console.error(`   ⚠️  [${i + 1}] 文字提取失败: ${err.message}，使用原 prompt`)
        const { sanitizeCleanPrompt } = await import('./lib/image-gen/sanitize.js')
        return {
          cleanPrompt: sanitizeCleanPrompt(p),
          reservedAreas: [],
          texts: [],
          bgInfo: null,
          mainRect: null,
          dominantColor: null,
          intent: null,
          llmCalls: [],
        }
      }
    }
  }

  return base
}

// ===== reuse-background 处理 =====

async function executeReuseBackground(ctx, opts, outputDir, precomputedTextSpec, apiKey, name) {
  const reuseAbs = path.resolve(opts.reuseBackground)
  if (!fs.existsSync(reuseAbs)) {
    console.error(`❌ 复用背景文件不存在: ${reuseAbs}`)
    process.exit(1)
  }
  const isI2I = ctx.mode === 'i2i'
  console.log(`\n${isI2I ? '♻️  复用底图模式：跳过 I2I API' : '📂 复用背景'}: ${isI2I ? reuseAbs : opts.reuseBackground}`)

  let textSpec = precomputedTextSpec
  const useTextOverlay = opts.textOverlay !== false
  if (useTextOverlay && !textSpec) {
    console.log(`\n🔍 分析 prompt 中的文字需求${isI2I ? '（基于复用底图）' : ''}...`)
    textSpec = await ctx.extractTextSpecForReuse(opts.prompt, reuseAbs, apiKey)
    console.log(`   检测到 ${textSpec.texts.length} 处文字:`)
    for (const t of textSpec.texts) {
      console.log(`   - "${t.content}" ${t.fontHint ? `(${t.fontHint})` : ''} @ ${JSON.stringify(t.position)}`)
    }
    if (isI2I && textSpec.bgInfo) {
      console.log(`   底图实测: ${textSpec.bgInfo.width}x${textSpec.bgInfo.height}, 主色 ${textSpec.bgInfo.dominantColor?.hex || '(none)'}`)
    }
  }
  if (textSpec && textSpec.texts.length === 0) textSpec = null

  const timestamp = Date.now()
  const filename = generateFilename(ctx.profile, timestamp, 0, name, Math.max(1, Number(opts.n) || 1))
  const filepath = path.join(outputDir, filename)
  fs.mkdirSync(outputDir, { recursive: true })
  fs.copyFileSync(reuseAbs, filepath)
  const size = fs.statSync(filepath).size
  const results = [{ filename, size, reusedFrom: reuseAbs }]
  if (isI2I) console.log(`\n📂 已复用底图为 ${filename} (${(size / 1024).toFixed(1)} KB)`)

  // 在文字叠加前捕获原始背景内容
  let _bgContent = null
  if (opts.saveBackground) {
    _bgContent = fs.readFileSync(reuseAbs)
  }

  await applyTextOverlay(textSpec, results, outputDir, ctx.renderTextOverlay)

  const extra = isI2I
    ? { inputMeta: { absPath: reuseAbs, mime: null, size, sha256: '', isUrl: false, reusedFrom: true }, bgInfo: textSpec?.bgInfo || null, reusedFrom: reuseAbs }
    : { reusedFrom: reuseAbs }
  if (_bgContent) extra._bgContent = _bgContent
  const { metaPath } = finalizeOutput(ctx.profile, outputDir, timestamp, { ...opts, textSpec }, results, extra, name)
  console.log(`\n📄 元数据: ${path.relative(PROJECT_ROOT, metaPath)}`)
  console.log(`✅ 完成：成功 1，失败 0`)
}

// ===== executeRequest =====

async function executeRequest(ctx, opts, precomputedTextSpec = null) {
  // dry-run 模式
  if (opts.dryRun) {
    const dryOutputDir = path.resolve(opts.outputDir || ctx.config.outputDir)
    const name = resolveRequestName(opts, dryOutputDir)

    if (ctx.mode === 'i2i' && opts.inputImage) {
      const { resolveInputImage } = await import('./lib/image-gen/input.js')
      const dryMeta = resolveInputImage(opts.inputImage)
      const { SUBJECT_REFERENCE_DEFAULT_TYPE } = await import('./lib/image-gen/config.js')
      const subjectType = opts.subjectType || SUBJECT_REFERENCE_DEFAULT_TYPE
      const placeholder = dryMeta.isUrl || opts.useInputImageUrl
        ? dryMeta.absPath
        : `<local:${path.basename(dryMeta.absPath)}, ${(dryMeta.size / 1024).toFixed(1)} KB, sha256=${dryMeta.sha256.slice(0, 12)}...>`
      opts.subjectReference = { type: subjectType, image_file: placeholder }
    }

    const requestBody = buildRequestBody(ctx.profile, opts)
    console.log(`\n📋 dry-run 请求参数预览 (${ctx.mode}):`)
    logApiCall(ctx.mode, requestBody)
    console.log(`   Output basename: ${name || opts.name || '<auto timestamp>'}`)

    if (opts.textOverlay !== false) {
      console.log('\n🔍 分析 prompt 中的文字需求 (dry-run 正则提取)...')
      const matched = requestBody.prompt.match(/《([^》]+)》/g)
      if (matched) {
        const texts = matched.map(m => ({ content: m.replace(/^《|》$/g, ''), position: { x: 'center', y: 'center' } }))
        const cleanPrompt = requestBody.prompt.replace(/《[^》]+》/g, '').replace(/\s+/g, ' ').trim()
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
  ensureApiKey(apiKey)

  // i2i: 解析输入图，设置 subjectReference
  if (ctx.mode === 'i2i' && opts.inputImage) {
    ctx.resolveInput(opts)
  }

  const outputDir = path.resolve(opts.outputDir || ctx.config.outputDir)
  fs.mkdirSync(outputDir, { recursive: true })
  const name = resolveRequestName(opts, outputDir)

  // 文字提取
  let textSpec = precomputedTextSpec
  const useTextOverlay = opts.textOverlay !== false
  if (useTextOverlay && !textSpec) {
    console.log('\n🔍 分析 prompt 中的文字需求...')
    const extractSpinner = spinner('文字提取（意图分析 + 背景创作 + 排版设计）')
    // 顺序约束：t0 必须在 await 之前捕获，succeed 必须在 await 之后调用，
    // 否则耗时会被 spinner 自身的渲染时间污染。
    const t0 = Date.now()
    let extractionRan = false
    try {
      if (opts.reuseBackground) {
        textSpec = await ctx.extractTextSpecForReuse(opts.prompt, opts.reuseBackground, apiKey)
        extractionRan = true
      } else if (ctx.mode === 'i2i') {
        const refPath = opts.inputImage && !/^https?:\/\//i.test(opts.inputImage)
          ? path.resolve(opts.inputImage) : null
        if (!refPath) {
          console.warn('⚠️ 输入图为 URL，跳过 bg-detect / 文字叠加')
          textSpec = EMPTY_TEXT_SPEC
        } else {
          textSpec = await ctx.extractTextSpec(opts.prompt, refPath, apiKey)
          extractionRan = true
        }
      } else {
        textSpec = await ctx.extractTextSpec(opts.prompt, apiKey)
        extractionRan = true
      }
      if (extractSpinner) {
        if (extractionRan) extractSpinner.succeed(`文字提取完成 (${((Date.now() - t0) / 1000).toFixed(1)}s)`)
        else extractSpinner.info('已跳过文字提取')
      }
    } catch (err) {
      if (extractSpinner) extractSpinner.fail('文字提取失败')
      throw err
    }
    console.log(`   检测到 ${textSpec.texts.length} 处文字:`)
    for (const t of textSpec.texts) {
      console.log(`   - "${t.content}" ${t.fontHint ? `(${t.fontHint})` : ''} @ ${JSON.stringify(t.position)}`)
    }
    if (ctx.mode === 'i2i' && textSpec.bgInfo) {
      const dr = textSpec.bgInfo.dominantColor
      console.log(`   参考图实测: ${textSpec.bgInfo.width}x${textSpec.bgInfo.height}, 主色 ${dr?.hex || '(none)'}`)
    }
  }
  if (textSpec && textSpec.texts.length === 0) textSpec = null

  const requestBody = buildRequestBody(ctx.profile, opts)
  const apiPrompt = requestBody.prompt

  // t2i 非复用背景：替换 cleanPrompt
  if (textSpec && ctx.mode === 't2i' && !opts.reuseBackground) {
    requestBody.prompt = textSpec.cleanPrompt
  }

  // reuse-background 短路
  if (opts.reuseBackground) {
    return await ctx.reuseBackgroundHandler(ctx, opts, outputDir, textSpec, apiKey, name)
  }

  const timestamp = Date.now()
  const results = []

  logApiCall(ctx.mode, requestBody)
  const apiSpinner = spinner(`调用 MiniMax ${ctx.mode.toUpperCase()} API`)
  // 顺序约束：t0 必须在 await 之前捕获，succeed 必须在 await 之后调用。
  const apiT0 = Date.now()
  let data
  try {
    data = await callApiAndCheck(apiKey, requestBody, { verbose: opts.verbose })
  } catch (err) {
    if (apiSpinner) apiSpinner.fail('API 调用失败')
    throw err
  }
  if (apiSpinner) apiSpinner.succeed(`API 完成 (${((Date.now() - apiT0) / 1000).toFixed(1)}s)`)

  const format = requestBody.response_format || 'url'
  results.push(...(await downloadResults(format, data, outputDir, timestamp, name, ctx.profile, opts)))

  // 在文字叠加前捕获原始背景内容，确保 --save-background 保存的是纯背景而非叠加后的图
  let _bgContent = null
  if (opts.saveBackground && results.length > 0 && !results[0].error) {
    _bgContent = fs.readFileSync(path.join(outputDir, results[0].filename))
  }

  await applyTextOverlay(textSpec, results, outputDir, ctx.renderTextOverlay)

  const extra = ctx.getExtra(null, textSpec)
  if (_bgContent) extra._bgContent = _bgContent
  const metaOpts = {
    ...opts, textSpec,
    apiPrompt,
    promptOptimizerEffective: requestBody.prompt_optimizer,
  }
  const { metaPath } = finalizeOutput(ctx.profile, outputDir, timestamp, metaOpts, results, extra, name)

  console.log(`\n📄 元数据: ${path.relative(PROJECT_ROOT, metaPath)}`)
  const successCount = results.filter(r => !r.error).length
  const failedCount = results.filter(r => r.error).length
  console.log(`✅ 完成：成功 ${successCount}，失败 ${failedCount}`)
}

// ===== 批量模式 =====

async function runBatchItem(ctx, opts, p, i, img, textSpec, resolvedNames) {
  const promptOpts = {
    ...opts, prompt: p,
    _resolvedNames: resolvedNames, _resolvedIndex: i,
    ...(img ? ctx.getBatchPromptOptsExtras(p, img) : {}),
  }
  delete promptOpts.prompts
  if (ctx.mode === 'i2i') delete promptOpts.inputImages
  delete promptOpts.names
  const { valid, errors } = validate(ctx.profile, promptOpts)
  if (!valid) {
    console.error(`\n❌ Prompt ${i + 1}/${opts.prompts.length} 校验失败:`)
    for (const e of errors) console.error(`  ${e}`)
    return { success: false, error: new Error('validation failed') }
  }
  const imgSuffix = img ? ` (图: ${path.basename(img.absPath)})` : ''
  console.log(`\n🖼️  [${i + 1}/${opts.prompts.length}] Prompt: "${promptOpts.prompt.slice(0, 60)}..."${imgSuffix}`)
  try {
    await executeRequest(ctx, promptOpts, textSpec)
    return { success: true }
  } catch (err) {
    console.error(`❌ Prompt ${i + 1} 失败: ${err.message}`)
    return { success: false, error: err }
  }
}

/**
 * 创建批量进度面板并填充所有任务的初始 label。
 */
function setupBatchPanel(opts, validatedImages, staticLabel, total, isI2I) {
  const panel = new ProgressPanel(total)
  for (let i = 0; i < total; i++) {
    const p = opts.prompts[i]
    const imgSuffix = isI2I && validatedImages[i]
      ? ` (图: ${path.basename(validatedImages[i].absPath)})` : ''
    panel.track(i, `${staticLabel}: "${p.slice(0, 40)}..."${imgSuffix}`)
  }
  panel.startAutoRefresh()
  return panel
}

/**
 * 阶段 1：并发文字提取，返回 textSpecs[]。
 */
async function runExtractPhase(ctx, opts, concurrency) {
  const useTextOverlay = opts.textOverlay !== false
  if (!useTextOverlay) return null

  const validatedImages = ctx.resolveBatchImages(opts)
  const apiKey = opts.apiKey || process.env.LLM_API_KEY
  const textWorker = ctx.getBatchTextWorker(apiKey)

  const panel = setupBatchPanel(opts, validatedImages, '提取文字', opts.prompts.length, ctx.mode === 'i2i')

  const textSpecs = await runWithConcurrency(
    opts.prompts.map((p, i) => ({ p, i, ...ctx.getBatchItemExtras(i, validatedImages) })),
    async ({ p, i, img }) => {
      panel.start(i)
      try {
        const result = await textWorker({ p, i, img })
        panel.done(i, true)
        return result
      } catch (err) {
        panel.done(i, false, err.message?.slice(0, 30))
        throw err
      }
    },
    concurrency
  )

  panel.stopAutoRefresh()
  return textSpecs
}

/**
 * 阶段 2：并发调用图片 API，返回 results[]。
 */
async function runApiPhase(ctx, opts, concurrency, textSpecs) {
  const validatedImages = ctx.resolveBatchImages(opts)
  const batchOutputDir = path.resolve(opts.outputDir || ctx.config.outputDir)
  const resolvedNames = resolveBatchNames(opts, batchOutputDir)

  const panel = setupBatchPanel(opts, validatedImages, '生成', opts.prompts.length, ctx.mode === 'i2i')

  console.log(`\n   阶段 2/2：并发调用 API（限流 ${concurrency}）`)

  const results = await runWithConcurrency(
    opts.prompts.map((p, i) => ({
      p, i, img: validatedImages[i] || null, textSpec: textSpecs?.[i] || null,
    })),
    async ({ p, i, img, textSpec }) => {
      panel.start(i)
      try {
        const result = await runBatchItem(ctx, opts, p, i, img, textSpec, resolvedNames)
        panel.done(i, result.success, result.success ? '' : (result.error?.message?.slice(0, 30) || '失败'))
        return result
      } catch (err) {
        panel.done(i, false, err.message?.slice(0, 30) || '失败')
        throw err
      }
    },
    concurrency
  )

  panel.stopAutoRefresh()
  return results
}

async function runBatch(ctx, opts) {
  const concurrency = Math.max(1, opts.concurrency || 3)
  const useTextOverlay = opts.textOverlay !== false
  const batchLabel = ctx.batchModeLabel ? `（${ctx.batchModeLabel}）` : ''
  console.log(`\n🚀 批量模式${batchLabel}：${opts.prompts.length} 个 prompt，并发度 ${concurrency}`)
  if (useTextOverlay) {
    console.log(`   ${ctx.batchConcurrencyLabel} (限流 ${concurrency})`)
  } else {
    console.log(`   跳过文字提取（已禁用 text-overlay）`)
  }

  // 阶段 1：并发提取文字
  const textSpecs = useTextOverlay ? await runExtractPhase(ctx, opts, concurrency) : null

  // 阶段 2：并发调用 API
  const results = await runApiPhase(ctx, opts, concurrency, textSpecs)

  const totalSuccess = results.filter(r => r?.success).length
  const totalFailed = results.length - totalSuccess
  console.log(`\n🏁 批量完成：成功 ${totalSuccess}，失败 ${totalFailed}`)
  process.exit(totalFailed > 0 ? 1 : 0)
}

// ===== 单 prompt 模式 =====

function runSingle(ctx, opts) {
  if (opts.preset) {
    const presets = loadPresets(ctx.presetsFile)
    if (!presets[opts.preset]) {
      console.error(`❌ 预设 "${opts.preset}" 不存在`)
      console.error(`   可用预设: ${Object.keys(presets).join(', ') || '(无)'}`)
      process.exit(1)
    }
    const preset = presets[opts.preset]
    const stripped = { ...preset }
    for (const key of ctx.presetKeys) delete stripped[key]
    opts = { ...stripped, ...opts }
  }

  const { valid, errors } = validate(ctx.profile, opts)
  if (!valid) {
    for (const e of errors) console.error(e)
    process.exit(1)
  }

  executeRequest(ctx, opts).catch(err => {
    console.error('❌ 未预期的错误:', err.message)
    process.exit(1)
  })
}

// ===== 入口 =====

export async function main(modeOverride = null) {
  const args = process.argv.slice(2)

  let mode = modeOverride
  const modeIdx = args.indexOf('--mode')
  if (modeIdx !== -1 && args[modeIdx + 1]) {
    mode = args[modeIdx + 1]
    args.splice(modeIdx, 2)
  }
  if (!mode) mode = 't2i'

  const ctx = await getContext(mode)

  if (args.length === 0) {
    const { interactiveMode } = await ctx.interactiveImport()
    interactiveMode((opts, spec) => executeRequest(ctx, opts, spec), mode).catch(err => {
      console.error('❌ 未预期的错误:', err.message)
      process.exit(1)
    })
    return
  }

  let { opts, pending } = parseArgs(args, ctx.extraHandlers)

  // i2i 批量配对校验
  if (mode === 'i2i' && opts.prompts) {
    const images = pending.inputImages || []
    if (images.length !== opts.prompts.length) {
      console.error(`❌ --prompts 数量 (${opts.prompts.length}) 与 --input-images 数量 (${images.length}) 不一致`)
      process.exit(1)
    }
    opts.inputImages = images
  }
  if (mode === 'i2i' && !opts.prompts && pending.inputImages) {
    console.error(`❌ --input-images 只能与 --prompts 一起使用`)
    process.exit(1)
  }

  if (opts.help) { ctx.printHelp(); process.exit(0) }

  if (opts.rerender) {
    runRerender(ctx.profile, opts, ctx.renderTextOverlay)
    return
  }

  if (opts.prompt && opts.prompts) {
    console.error('❌ --prompt 和 --prompts 互斥，请只指定其中一个')
    process.exit(1)
  }

  // 批量模式
  if (opts.prompts && opts.prompts.length > 0) {
    runBatch(ctx, opts).catch(err => {
      console.error('❌ 未预期的错误:', err.message)
      process.exit(1)
    })
  } else {
    runSingle(ctx, opts)
  }
}

const isMain = process.argv[1] && (
  process.argv[1].endsWith('/image-gen.js') || process.argv[1].endsWith('\\image-gen.js')
)
if (isMain) {
  main().catch(err => {
    console.error('❌ 未预期的错误:', err.message)
    process.exit(1)
  })
}
