#!/usr/bin/env node
/**
 * t2i.js — MiniMax 文生图脚本
 *
 * 用法：
 *   node scripts/t2i.js                                   交互模式
 *   node scripts/t2i.js --prompt "制作一个古籍封面：1：书籍名称《滴天髓阐微》，2：字体样式：黑字毛笔行书 3：背景样式：鎏金边，墨蓝背景，文字区域预留白色底，风格古朴仿旧 ，4：图片比例：正常 32 开书籍比例，5：其他细节：文字竖排"      命令行模式
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
import { extractTextSpec, renderTextOverlay } from './lib/t2i/text-overlay.js'
import { t2iConfig } from './lib/t2i/constants.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '..')

// .env 由 lib/env.js 模块级自动加载，此处无需重复

// ===== 命令行模式执行 =====
async function executeRequest(opts) {
  // dry-run 模式：无需 API key，仅展示参数摘要
  if (opts.dryRun) {
    const requestBody = buildRequestBody(opts)
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
  let textSpec = null
  const useTextOverlay = opts.textOverlay !== false
  if (useTextOverlay) {
    console.log('\n🔍 分析 prompt 中的文字需求...')
    textSpec = await extractTextSpec(requestBody.prompt, apiKey)

    console.log(`   检测到 ${textSpec.texts.length} 处文字:`)
    for (const t of textSpec.texts) {
      console.log(
        `   - "${t.content}" ${t.fontHint ? `(${t.fontHint})` : ''} @ ${JSON.stringify(t.position)}`
      )
    }
    // 用 cleanPrompt 替换原始 prompt 生成背景
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

      console.log(`\n📥 下载 ${urls.length} 张图片到 ${outputDir} ...`)
      for (let i = 0; i < urls.length; i++) {
        const filename = generateFilename(timestamp, i)
        const filepath = path.join(outputDir, filename)
        try {
          const size = await downloadImage(urls[i], filepath, {
            onProgress: opts.verbose
              ? p => {
                  process.stdout.write(`\r  [${i + 1}/${urls.length}] ${filename} ${p.percent}%`)
                }
              : undefined,
          })
          if (opts.verbose) process.stdout.write('\n')
          console.log(`  [${i + 1}/${urls.length}] ${filename} (${(size / 1024).toFixed(1)} KB)`)
          results.push({ filename, size, url: urls[i] })
        } catch (err) {
          console.error(`  [${i + 1}/${urls.length}] ❌ ${err.message}`)
          results.push({ filename, size: 0, error: err.message })
        }
      }
    } else {
      const images = data.data?.image_base64 || []
      if (images.length === 0) {
        console.log('⚠️ 没有生成任何图片（可能被内容安全过滤）')
        return
      }

      console.log(`\n💾 保存 ${images.length} 张图片到 ${outputDir} ...`)
      for (let i = 0; i < images.length; i++) {
        const filename = generateFilename(timestamp, i)
        const filepath = path.join(outputDir, filename)
        try {
          const size = saveBase64Image(images[i], filepath)
          console.log(`  [${i + 1}/${images.length}] ${filename} (${(size / 1024).toFixed(1)} KB)`)
          results.push({ filename, size })
        } catch (err) {
          console.error(`  [${i + 1}/${images.length}] ❌ ${err.message}`)
          results.push({ filename, size: 0, error: err.message })
        }
      }
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
      console.error(`❌ metadata 文件不存在: ${metaPath}`)
      process.exit(1)
    }
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
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
      console.log(`   - "${t.content}" ${t.fontHint ? `(${t.fontHint})` : ''} @ ${JSON.stringify(t.position)}`)
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
      let totalSuccess = 0
      let totalFailed = 0
      for (let i = 0; i < opts.prompts.length; i++) {
        const promptOpts = { ...opts, prompt: opts.prompts[i] }
        delete promptOpts.prompts
        const { valid, errors } = validate(promptOpts)
        if (!valid) {
          console.error(`\n❌ Prompt ${i + 1}/${opts.prompts.length} 校验失败:`)
          for (const e of errors) console.error(`  ${e}`)
          totalFailed++
          continue
        }
        console.log(
          `\n🖼️  [${i + 1}/${opts.prompts.length}] Prompt: "${promptOpts.prompt.slice(0, 60)}..."`
        )
        try {
          await executeRequest(promptOpts)
          totalSuccess++
        } catch (err) {
          console.error(`❌ 失败: ${err.message}`)
          totalFailed++
        }
      }
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
