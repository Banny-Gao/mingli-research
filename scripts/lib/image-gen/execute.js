/**
 * scripts/lib/image-gen/execute.js — 共享执行块
 *
 * t2i.js / i2i.js 的 executeRequest / rerender / batch 三段约 400 行逐行复制。
 * 本模块抽取：
 *   1. callApiAndCheck     — callApi + status code 校验
 *   2. downloadResults     — URL/base64 下载/保存循环
 *   3. applyTextOverlay    — 文字叠加循环
 *   4. finalizeOutput      — saveMetadata + saveBackground
 *   5. runRerender         — 共享 rerender 入口（profile 回调差异点）
 *   6. logShellEscapeHint  — shell 反斜杠被吞的提示
 *   7. ensureApiKey        — API key 检查
 *
 * mode-specific 编排（inputImage 解析、textSpec 提取、reuse-background 处理）仍在
 * 入口脚本内完成，不引入 profile hooks 膨胀。
 */

import fs from 'node:fs'
import path from 'node:path'
import { callApi } from './api.js'
import { downloadImage, saveBase64Image, generateFilename, saveMetadata } from './downloader.js'
import { writeUniqueFile } from '../shared/output-name.js'

/**
 * 调用 API 并校验 status_code。
 * @returns {Promise<object>} API 响应 JSON
 */
export async function callApiAndCheck(apiKey, requestBody, opts = {}) {
  const data = await callApi(apiKey, requestBody, { verbose: opts.verbose })
  const statusCode = data.base_resp?.status_code
  if (statusCode !== 0) {
    throw new Error(`API 错误 (${statusCode}): ${data.base_resp?.status_msg || 'unknown error'}`)
  }
  return data
}

/**
 * 下载/保存图片结果（url / base64 自动分流）。
 * @returns {Promise<Array<{filename: string, size: number, url?: string, error?: string}>>}
 */
export async function downloadResults(format, data, outputDir, timestamp, name, profile, opts = {}) {
  const results = []

  if (format === 'url') {
    const urls = data.data?.image_urls || []
    if (urls.length === 0) {
      console.log('⚠️ 没有生成任何图片（可能被内容安全过滤）')
      return results
    }
    console.log(`\n📥 并行下载 ${urls.length} 张图片到 ${outputDir} ...`)
    const tasks = urls.map((url, i) => async () => {
      const filename = generateFilename(profile, timestamp, i, name)
      const filepath = path.join(outputDir, filename)
      try {
        const size = await downloadImage(url, filepath, {
          onProgress: opts.verbose
            ? p => { process.stdout.write(`\r  [${i + 1}/${urls.length}] ${filename} ${p.percent}%`) }
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
    results.push(...(await Promise.all(tasks.map(t => t()))))
  } else {
    const images = data.data?.image_base64 || []
    if (images.length === 0) {
      console.log('⚠️ 没有生成任何图片（可能被内容安全过滤）')
      return results
    }
    console.log(`\n💾 并行保存 ${images.length} 张图片到 ${outputDir} ...`)
    const tasks = images.map((img, i) => () => {
      const filename = generateFilename(profile, timestamp, i, name)
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
    results.push(...(await Promise.all(tasks.map(t => t()))))
  }

  return results
}

/**
 * 文字叠加循环：对每个 result 调用 renderTextOverlay。
 * @param {Function} renderTextOverlay - (bgPath, texts, outputPath) => Promise<void>
 */
export async function applyTextOverlay(textSpec, results, outputDir, renderTextOverlay) {
  if (!textSpec || !textSpec.texts || textSpec.texts.length === 0) return
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

/**
 * 保存元数据 + 可选的背景副本。返回 { metaPath, finalBase }。
 */
export function finalizeOutput(profile, outputDir, timestamp, opts, results, extra = {}, name = null) {
  const { filepath: metaPath, finalBase } = saveMetadata(
    profile, outputDir, timestamp, opts, results, extra, name
  )

  // --save-background：用 writeUniqueFile 写入纯背景副本 + patch metadata.backgroundPath
  if (opts.saveBackground && results.length > 0 && !results[0].error) {
    const bgContent = fs.readFileSync(path.join(outputDir, results[0].filename))
    try {
      const { filepath: bgPath } = writeUniqueFile(outputDir, finalBase, '-bg.png', bgContent)
      console.log(`\n💾 背景已保存: ${path.basename(bgPath)}`)
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
      meta.backgroundPath = `${finalBase}-bg.png`
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8')
    } catch (err) {
      console.warn(`⚠️ 保存背景失败: ${err.message}`)
    }
  }

  return { metaPath, finalBase }
}

/**
 * shell 反斜杠被吞的提示（rerender 路径不存在时）。
 */
export function logShellEscapeHint(rerenderPath, cmdName = 't2i') {
  const looksLikeShellEscape =
    !rerenderPath.includes('/') && !rerenderPath.includes('\\') && rerenderPath.length > 8
  if (looksLikeShellEscape) {
    console.error(`\n提示: 路径看起来被 shell 转义吃掉了。`)
    console.error(`  - PowerShell/cmd 用反斜杠时必须加双引号:`)
    console.error(`    node scripts/${cmdName}.js --rerender "public\\images\\file-metadata.json"`)
    console.error(`  - Git Bash 建议直接用正斜杠:`)
    console.error(`    node scripts/${cmdName}.js --rerender public/images/file-metadata.json`)
  }
}

/**
 * 确保 API key 存在。
 */
export function ensureApiKey(apiKey) {
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
}

/**
 * 共享 rerender 入口。
 *
 * profile 需要提供：
 *   - validateRerenderMeta(meta): 校验 metadata type（返回 null 表示通过，返回错误消息表示拒绝）
 *   - resolveRerenderBgPath(meta, metaPath): 返回底图绝对路径（或 null）
 *   - filenamePrefix: rerender 输出的命令前缀（t2i / i2i）
 *
 * @param {object} profile
 * @param {object} opts - 已解析的 opts（含 opts.rerender）
 * @param {Function} renderTextOverlay - (bgPath, texts, outputPath) => Promise<void>
 */
export function runRerender(profile, opts, renderTextOverlay) {
  const metaPath = path.resolve(opts.rerender)
  if (!fs.existsSync(metaPath)) {
    console.error(`❌ metadata 文件不存在: ${metaPath}`)
    logShellEscapeHint(opts.rerender, profile.filenamePrefix)
    process.exit(1)
  }
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))

  // profile 校验 metadata type
  if (profile.validateRerenderMeta) {
    const err = profile.validateRerenderMeta(meta)
    if (err) {
      console.error(err)
      process.exit(1)
    }
  }

  // rerender 模式：从 metadata 提取原 name（兼容旧 metadata 无 name 字段）
  const originalFilename = meta.results[0]?.filename || ''
  const rerenderName = meta.name || originalFilename.replace(/-\d{2}\.png$/, '') || null
  const texts = meta.textOverlay?.texts
  if (!texts || texts.length === 0) {
    console.error('❌ metadata 中没有 textOverlay.texts，无法重渲染')
    process.exit(1)
  }

  // profile 解析底图路径
  const bgPath = profile.resolveRerenderBgPath
    ? profile.resolveRerenderBgPath(meta, metaPath)
    : (meta.backgroundPath
        ? path.join(path.dirname(metaPath), meta.backgroundPath)
        : path.join(path.dirname(metaPath), meta.results[0]?.filename))

  if (!bgPath || !fs.existsSync(bgPath)) {
    console.error(`❌ 底图不存在${bgPath ? ': ' + bgPath : '（未找到）'}`)
    process.exit(1)
  }

  console.log(`\n🔤 重新渲染文字叠加...`)
  console.log(`   底图: ${bgPath}`)
  console.log(`   文字: ${texts.length} 处`)
  for (const t of texts) {
    console.log(
      `   - "${t.content}" ${t.fontHint ? `(${t.fontHint})` : ''} @ ${JSON.stringify(t.position)}`
    )
  }

  const rerenderDir = path.dirname(metaPath)
  const rerenderBase = rerenderName || path.basename(metaPath, '-metadata.json')
  // 覆盖 metadata.results[0] 指向的图；如无 backgroundPath（无 --save-background），
  // 则源图已含文字，必须改名避免双重叠加
  const originalName = meta.results[0]?.filename || `${rerenderBase}.png`
  const sameSource = !meta.backgroundPath
  const outName = sameSource ? `${path.parse(originalName).name}-rerender${path.parse(originalName).ext}` : originalName
  const outputPath = path.join(rerenderDir, outName)
  renderTextOverlay(bgPath, texts, outputPath).then(() => {
    console.log(`\n✅ 输出: ${outputPath}`)
    process.exit(0)
  }).catch(err => {
    console.error(`❌ 重渲染失败: ${err.message}`)
    process.exit(1)
  })
}
