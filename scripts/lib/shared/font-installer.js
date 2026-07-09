/**
 * scripts/lib/shared/font-installer.js — 启动时自动补全 ./public/assets/fonts/ 与 fonts.json
 *
 * 补全策略（双向 + 持久化）：
 *   A. bundled[] 中声明的：
 *      - public/assets/fonts/<file> 存在 → skip
 *      - 不存在 → 在 system_fallbacks[platform] 中按 family/name 找源 → 复制+重命名
 *      - system_fallbacks 也没匹配 → 查顶层 download[file] → 网络下载
 *      - 都没有 → 记入 fonts.json 的 missing 字段
 *
 *   B. system_fallbacks[platform] 中有但 bundled[] 未声明的（按 family/name 匹配）：
 *      - 优先从本地系统复制到 public/assets/fonts/<basename> + 追加到 bundled[]
 *      - 本地系统未装 → 查 download[basename] → 网络下载 + 追加到 bundled[]
 *      - 都没有 → 记入 missing
 *
 * 持久化：
 *   - 补全成功的字体写回 fonts.json 的 bundled[]（格式化 JSON，保留 _comment）
 *   - 仍缺失的字体写回 fonts.json 的 missing[] 字段
 *   - globalThis.__t2i_bundled_runtime 同步更新
 *
 * 触发：t2i.js 启动时调用一次。
 * 关键设计：
 *   - 实际补全动作进程内只跑一次（_ran 闸门）
 *   - 网络下载失败一次即跳过（按用户偏好）
 *   - 网络下载进度条节流（5% 一次）
 *   - JSON 写失败静默兜底（不阻断主流程）
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '..', '..', '..')
const BUNDLED_FONTS_DIR = path.join(PROJECT_ROOT, 'public', 'assets', 'fonts')
const PRESETS_FONTS = path.join(PROJECT_ROOT, 'public', 'assets', 'fonts', 'fonts.json')

let _ran = false
let _summary = null
let _bundledRuntime = null

/**
 * 判断文件是否为 Git LFS 指针（133 字节，首行 "version https://git-lfs.github.com/spec/v1"）。
 * 用于区分"磁盘上的真实字体"和"未执行 git lfs pull 时残留的指针文件"。
 *
 * 注意：必须严格判断 magic 头 + 真实文件不存在（指针文件是 133 字节，远小于任何真实字体）。
 * 仅看文件大小不够——小字体（如 1.3MB 的玲珑体）和某些 .ttf 也可能接近该范围。
 */
export function isLfsPointer(filepath) {
  try {
    const stat = fs.statSync(filepath)
    // 指针文件固定 130-134 字节
    if (stat.size < 120 || stat.size > 200) return false
    const fd = fs.openSync(filepath, 'r')
    try {
      const buf = Buffer.alloc(120)
      const bytesRead = fs.readSync(fd, buf, 0, 120, 0)
      const head = buf.subarray(0, bytesRead).toString('utf-8')
      return head.startsWith('version https://git-lfs.github.com/spec/v1')
    } finally {
      fs.closeSync(fd)
    }
  } catch {
    return false
  }
}

/**
 * 判断磁盘上的字体文件是否"可用"——存在且不是 LFS 指针。
 * 不存在 → false；存在但是指针 → false（需要 git lfs pull）。
 */
function isFontAvailableOnDisk(filepath) {
  return fs.existsSync(filepath) && !isLfsPointer(filepath)
}

function getPlatformKey() {
  return process.platform === 'darwin'
    ? 'macos'
    : process.platform === 'win32'
      ? 'windows'
      : 'linux'
}

function resolveGlob(p) {
  if (!p.includes('*')) return fs.existsSync(p) ? p : null
  const [prefix, rest] = p.split('/*')
  const basename = rest.replace(/^\//, '')
  if (!fs.existsSync(prefix)) return null
  try {
    const sub = fs.readdirSync(prefix).find(d => fs.existsSync(path.join(prefix, d, basename)))
    return sub ? path.join(prefix, sub, basename) : null
  } catch {
    return null
  }
}

function findSystemFallback(systemFallbacks, platform, family) {
  const list = systemFallbacks[platform] || []
  const target = family.toLowerCase()
  return list.find(e => e.name.toLowerCase() === target || e.name.toLowerCase().includes(target))
}

function resolveSystemPath(fallback) {
  if (!fallback?.path) return null
  return resolveGlob(fallback.path)
}

async function downloadWithProgress(url, targetPath, onProgress) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const contentLength = Number(res.headers.get('content-length')) || 0
  const reader = res.body.getReader()
  const chunks = []
  let received = 0
  let lastReported = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    if (onProgress && contentLength > 0) {
      const percent = Math.round((received / contentLength) * 100)
      if (percent - lastReported >= 5 || percent === 100) {
        lastReported = percent
        onProgress({ received, total: contentLength, percent })
      }
    }
  }

  fs.writeFileSync(targetPath, Buffer.concat(chunks))
}

/**
 * 把新增的字体条目持久化到 fonts.json 的 bundled[] 中。
 * - 保留 _comment 字段
 * - 跳过已存在（同 family/file 大小写不敏感）
 * - 写失败静默兜底
 */
function persistBundledAdditions(newEntries) {
  if (newEntries.length === 0) return
  try {
    const raw = fs.readFileSync(PRESETS_FONTS, 'utf-8')
    const json = JSON.parse(raw)
    const existing = json.bundled || []
    const existingKeys = new Set(
      existing.map(e => `${e.family.toLowerCase()}|${e.file.toLowerCase()}`)
    )
    let added = 0
    for (const entry of newEntries) {
      const key = `${entry.family.toLowerCase()}|${entry.file.toLowerCase()}`
      if (existingKeys.has(key)) continue
      existing.push(entry)
      existingKeys.add(key)
      added++
    }
    if (added === 0) return
    json.bundled = existing
    fs.writeFileSync(PRESETS_FONTS, JSON.stringify(json, null, 2) + '\n', 'utf-8')
  } catch (err) {
    console.warn(`⚠️ 持久化 bundled 新增条目失败: ${err.message}`)
  }
}

/**
 * 把缺失的字体条目持久化到 fonts.json 的 missing[] 中。
 * - 自动创建字段
 * - 重复 file 不重复写入
 */
function persistMissingAdditions(missingFiles) {
  if (missingFiles.length === 0) return
  try {
    const raw = fs.readFileSync(PRESETS_FONTS, 'utf-8')
    const json = JSON.parse(raw)
    const existing = json.missing || []
    const existingFiles = new Set(existing.map(m => m.file))
    let added = 0
    for (const file of missingFiles) {
      if (existingFiles.has(file)) continue
      existing.push({ file, recordedAt: new Date().toISOString() })
      existingFiles.add(file)
      added++
    }
    if (added === 0) return
    json.missing = existing
    fs.writeFileSync(PRESETS_FONTS, JSON.stringify(json, null, 2) + '\n', 'utf-8')
  } catch (err) {
    console.warn(`⚠️ 持久化 missing 条目失败: ${err.message}`)
  }
}

/**
 * 确保字体已就位。实际补全动作只跑一次；后续调用从磁盘读快照。
 * 返回 { copied, downloaded, auto_added, skipped, missing }。
 */
export async function ensureFontsInstalled() {
  if (_ran) return snapshotFromDisk()
  _ran = true

  const result = { copied: [], downloaded: [], auto_added: [], skipped: [], missing: [] }

  let presets
  try {
    presets = JSON.parse(fs.readFileSync(PRESETS_FONTS, 'utf-8'))
  } catch {
    _summary = result
    return result
  }

  let bundled = presets.bundled || []
  const systemFallbacks = presets.system_fallbacks || {}
  const downloads = presets.download || {}
  const platform = getPlatformKey()

  if (!fs.existsSync(BUNDLED_FONTS_DIR)) {
    fs.mkdirSync(BUNDLED_FONTS_DIR, { recursive: true })
  }

  // 收集要持久化到 bundled 的新增条目
  const newBundledEntries = []

  // ===== A 方向：补全 bundled[] 中声明的 =====
  for (let i = 0; i < bundled.length; i++) {
    const entry = bundled[i]
    const target = path.join(BUNDLED_FONTS_DIR, entry.file)
    if (isFontAvailableOnDisk(target)) {
      result.skipped.push(entry.file)
      continue
    }
    // LFS 指针状态：不要复制/下载覆盖，否则会污染 Git LFS 工作区。
    if (fs.existsSync(target) && isLfsPointer(target)) {
      process.stdout.write(`⚠️  [A${i + 1}/${bundled.length}] ${entry.file} 是 LFS 指针，请先执行 \`git lfs pull\`\n`)
      result.missing.push(entry.file)
      continue
    }

    const label = `[A${i + 1}/${bundled.length}] ${entry.file}`
    // 策略 1: system_fallbacks 匹配
    const fallback = findSystemFallback(systemFallbacks, platform, entry.family)
    if (fallback) {
      const resolved = resolveSystemPath(fallback)
      if (resolved) {
        try {
          process.stdout.write(`📦 ${label} ← ${fallback.name} ... `)
          fs.copyFileSync(resolved, target)
          result.copied.push(entry.file)
          process.stdout.write(`✅\n`)
          continue
        } catch {
          /* fallback to download */
        }
      }
    }
    // 策略 2: 网络下载
    const url = entry.url || downloads[entry.file]
    if (url) {
      try {
        await downloadWithProgress(url, target, ({ percent }) => {
          process.stdout.write(`\r🌐 ${label} ${percent}%   `)
        })
        process.stdout.write(`\r🌐 ${label} 下载完成 ✅\n`)
        result.downloaded.push(entry.file)
        continue
      } catch (err) {
        process.stdout.write(`\r🌐 ${label} 下载失败 ❌ (${err.message})\n`)
        result.missing.push(entry.file)
        continue
      }
    }
    process.stdout.write(`⚠️  ${label} 无可用源\n`)
    result.missing.push(entry.file)
  }

  // ===== B 方向：从 system_fallbacks 自动追加未声明的 =====
  const platformFallbacks = systemFallbacks[platform] || []
  // 去重：family（bundled） + file 路径（磁盘已存在但 bundled 未声明的情况）
  const bundledFamilies = new Set(bundled.map(b => b.family.toLowerCase()))
  const bundledFiles = new Set(bundled.map(b => b.file.toLowerCase()))

  for (const fallback of platformFallbacks) {
    const nameKey = fallback.name.toLowerCase()
    // 已在 bundled → 跳过整个 fallback 条目
    if (bundledFamilies.has(nameKey)) continue

    const sourcePath = resolveSystemPath(fallback)
    if (!sourcePath) {
      // 系统未装，fallback 完成（尝试 download 由后面 B-download 流程处理）
    }
    let targetFile = sourcePath ? path.basename(sourcePath) : null

    if (sourcePath && targetFile) {
      // 检查 bundled 中是否已声明该 file（防止 family 不同但 file 相同的重复追加）
      if (bundledFiles.has(targetFile.toLowerCase())) {
        bundledFamilies.add(nameKey)
        continue
      }
      const target = path.join(BUNDLED_FONTS_DIR, targetFile)
      if (isFontAvailableOnDisk(target)) {
        // 文件已在磁盘（真实文件）但 bundled 未登记 → 静默登记
        result.skipped.push(targetFile)
        bundledFamilies.add(nameKey)
        bundledFiles.add(targetFile.toLowerCase())
        newBundledEntries.push({
          family: fallback.name,
          file: targetFile,
          purpose: fallback.purpose || '',
          source: 'auto',
          auto_added: true,
        })
        continue
      }
      // LFS 指针状态：跳过复制，否则会覆盖 LFS 真实文件
      if (fs.existsSync(target) && isLfsPointer(target)) {
        process.stdout.write(`⚠️  [B] ${targetFile} 是 LFS 指针，请先执行 \`git lfs pull\`\n`)
        result.missing.push(targetFile)
        continue
      }
      const label = `[B] ${targetFile} ← ${fallback.name}`
      try {
        process.stdout.write(`📦 ${label} ... `)
        fs.copyFileSync(sourcePath, target)
        result.auto_added.push(targetFile)
        bundledFamilies.add(nameKey)
        bundledFiles.add(targetFile.toLowerCase())
        newBundledEntries.push({
          family: fallback.name,
          file: targetFile,
          purpose: fallback.purpose || '',
          source: 'auto',
          auto_added: true,
        })
        process.stdout.write(`✅\n`)
        continue
      } catch (err) {
        process.stdout.write(`❌ ${err.message}\n`)
        // 系统复制失败 → 尝试 download
      }
    }

    // 本地未装：尝试 download（按 basename 匹配）
    if (!sourcePath || !targetFile) {
      // 用 family name 的常见 basename 试探
      const possibleNames = [
        `${fallback.name}.ttf`,
        `${fallback.name}.otf`,
        `${fallback.name}.ttc`,
        `${fallback.name.replace(/\s+/g, '')}.ttf`,
        `${fallback.name.replace(/\s+/g, '')}.ttc`,
      ]
      for (const candidate of possibleNames) {
        if (downloads[candidate]) {
          targetFile = candidate
          break
        }
      }
    }
    if (targetFile && downloads[targetFile]) {
      const target = path.join(BUNDLED_FONTS_DIR, targetFile)
      if (isFontAvailableOnDisk(target)) {
        result.skipped.push(targetFile)
        bundledFamilies.add(nameKey)
        continue
      }
      // LFS 指针状态：跳过下载，避免污染 LFS 工作区
      if (fs.existsSync(target) && isLfsPointer(target)) {
        process.stdout.write(`⚠️  [B] ${targetFile} 是 LFS 指针，请先执行 \`git lfs pull\`\n`)
        result.missing.push(targetFile)
        continue
      }
      const label = `[B] ${targetFile} ← ${fallback.name} (download)`
      try {
        await downloadWithProgress(downloads[targetFile], target, ({ percent }) => {
          process.stdout.write(`\r🌐 ${label} ${percent}%   `)
        })
        process.stdout.write(`\r🌐 ${label} 下载完成 ✅\n`)
        result.downloaded.push(targetFile)
        bundledFamilies.add(nameKey)
        newBundledEntries.push({
          family: fallback.name,
          file: targetFile,
          purpose: fallback.purpose || '',
          source: 'auto',
          auto_added: true,
        })
        continue
      } catch (err) {
        process.stdout.write(`\r🌐 ${label} 下载失败 ❌ (${err.message})\n`)
      }
    }

    // 系统没有、download 也没有 → 记入 missing
    if (targetFile) {
      result.missing.push(targetFile)
    } else {
      // 连 targetFile 都没法确定（系统未装 + 无 download）→ 用 name 作占位
      result.missing.push(`${fallback.name} (未找到源)`)
    }
  }

  // 持久化到 fonts.json
  persistBundledAdditions(newBundledEntries)
  persistMissingAdditions(result.missing)

  // 重新从磁盘读 bundled（含刚持久化的新条目）
  try {
    const updated = JSON.parse(fs.readFileSync(PRESETS_FONTS, 'utf-8'))
    bundled = updated.bundled || []
  } catch {
    /* */
  }

  _bundledRuntime = bundled
  globalThis.__t2i_bundled_runtime = bundled
  _summary = result
  return result
}

/**
 * 获取当前 bundled 列表（含运行时追加项）。
 */
export function getBundled() {
  if (_bundledRuntime) return _bundledRuntime
  try {
    const presets = JSON.parse(fs.readFileSync(PRESETS_FONTS, 'utf-8'))
    return presets.bundled || []
  } catch {
    return []
  }
}

/** 从磁盘读快照（用于重复调用） */
function snapshotFromDisk() {
  try {
    const presets = JSON.parse(fs.readFileSync(PRESETS_FONTS, 'utf-8'))
    const bundled = presets.bundled || []
    const missing = presets.missing || []
    const result = {
      copied: [],
      downloaded: [],
      auto_added: [],
      skipped: [],
      missing: missing.map(m => m.file),
    }
    for (const entry of bundled) {
      const target = path.join(BUNDLED_FONTS_DIR, entry.file)
      if (isFontAvailableOnDisk(target)) result.skipped.push(entry.file)
    }
    return result
  } catch {
    return { copied: [], downloaded: [], auto_added: [], skipped: [], missing: [] }
  }
}

/**
 * 打印一次性补全摘要。
 */
export function logInstallSummary(result = _summary) {
  if (!result) return
  const { copied, downloaded, auto_added, skipped, missing } = result
  if (
    copied.length === 0 &&
    downloaded.length === 0 &&
    auto_added.length === 0 &&
    skipped.length === 0 &&
    missing.length === 0
  )
    return
  const parts = []
  if (copied.length) parts.push(`bundled 补全 ${copied.length}`)
  if (downloaded.length) parts.push(`下载 ${downloaded.length}`)
  if (auto_added.length) parts.push(`自动追加 ${auto_added.length}`)
  if (skipped.length) parts.push(`已存在 ${skipped.length}`)
  if (missing.length) parts.push(`⚠️ 缺失 ${missing.length}`)
  console.log(`📦 字体补全: ${parts.join(' | ')}`)
  if (missing.length) {
    console.log(`   缺失: ${missing.join(', ')}`)
    console.log(`   放入路径: ${BUNDLED_FONTS_DIR}`)
  }
}

// ===== CLI 入口 =====
// 用法：node scripts/lib/shared/font-installer.js [--force]
// 被 import 时不会触发。用 realpath 比较以兼容 Windows 路径分隔符与引号。
import { realpathSync } from 'node:fs'
const isMain = (() => {
  try {
    const invoked = process.argv[1] && realpathSync(process.argv[1])
    const self = realpathSync(fileURLToPath(import.meta.url))
    return invoked && self && invoked.toLowerCase() === self.toLowerCase()
  } catch {
    return false
  }
})()
if (isMain) {
  const force = process.argv.includes('--force')
  if (force) {
    _ran = false
    globalThis.__t2i_bundled_runtime = null
  }
  console.log(`📦 font-installer${force ? ' (--force 重新执行)' : ''}`)
  ensureFontsInstalled()
    .then(r => {
      logInstallSummary(r)
      // 仅当磁盘操作异常时退出 1；missing（系统无源）属正常情况，退出 0
      process.exit(0)
    })
    .catch(err => {
      console.error('❌ 安装失败:', err.message)
      process.exit(1)
    })
}
