/**
 * scripts/lib/shared/pick-image.js — 复用：扫描图片目录 + 模糊选择
 *
 * 提供两个 prompt：
 *   - pickExistingImage({ scanDir?, message?, extensions? }) — 列出扫描目录的图片，支持搜索过滤；
 *     提供"手动输入路径"作为兜底
 *   - 输入校验基于 t2i/i2i 的 input.js 校验逻辑（独立轻量版，不依赖输入图）
 *
 * 排序规则：按 mtime 降序，超过 20 张时截断（其余隐藏，符合用户偏好）。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import { search } from '@inquirer/prompts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '..', '..', '..')

const DEFAULT_SCAN_DIR = path.join(PROJECT_ROOT, 'public', 'images')
const MAX_RESULTS = 20
const DEFAULT_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp'])

const SENTINEL_MANUAL = '__manual_input_path__'

/**
 * 扫描目录，返回图片条目按 mtime 降序（超过上限截断）。
 */
function scanImages(scanDir, extensions = DEFAULT_EXTENSIONS) {
  if (!fs.existsSync(scanDir)) return []
  const now = Date.now()
  const entries = []
  for (const name of fs.readdirSync(scanDir)) {
    if (name.startsWith('.')) continue // skip dotfiles
    const ext = path.extname(name).toLowerCase()
    if (!extensions.has(ext)) continue
    const abs = path.join(scanDir, name)
    let stat
    try {
      stat = fs.statSync(abs)
    } catch {
      continue
    }
    if (!stat.isFile()) continue
    entries.push({
      name,
      absPath: abs,
      sizeKB: +(stat.size / 1024).toFixed(1),
      mtimeMs: stat.mtimeMs,
      ageHours: Math.max(0, Math.round((now - stat.mtimeMs) / (60 * 60 * 1000))),
    })
  }
  entries.sort((a, b) => b.mtimeMs - a.mtimeMs)
  if (entries.length > MAX_RESULTS) {
    entries.length = MAX_RESULTS
  }
  return entries
}

/**
 * 交互式选择已有图片（在 scanDir 中）。
 *
 * 行为：
 *   1. 用 inquirer search 列出扫描到的图片（按 mtime desc，最多 20 张）
 *      search 内置 fuzzy filter：键入字符按 substring 匹配 name
 *   2. 提供唯一一条 "✏️  手动输入路径..." 作为兜底
 *   3. 校验：返回前检查文件存在 + 可解析
 *
 * @param {object} opts
 * @param {string} [opts.scanDir] - 默认 public/images
 * @param {string} [opts.message] - 提问文案，默认"选择图片（可搜索 / 手动输入）："
 * @param {Set<string>} [opts.extensions] - 默认 png/jpg/jpeg/webp
 * @returns {Promise<string|null>} 选择的绝对路径；用户取消返回 null
 */
export async function pickExistingImage(opts = {}) {
  const scanDir = opts.scanDir || DEFAULT_SCAN_DIR
  const message = opts.message || '选择图片（可搜索 / 手动输入）：'
  const extensions = opts.extensions || DEFAULT_EXTENSIONS

  const images = scanImages(scanDir, extensions)

  if (images.length === 0) {
    console.log(`\n⚠️  扫描目录为空: ${path.relative(PROJECT_ROOT, scanDir)}`)
    const manual = await promptManualPath(message + ' [手动输入]')
    return manual
  }

  const choices = images.map(img => {
    const ageStr =
      img.ageHours < 1
        ? '刚刚'
        : img.ageHours < 24
          ? `${img.ageHours}h 前`
          : `${Math.round(img.ageHours / 24)}d 前`
    return {
      name: `${img.name}  (${img.sizeKB} KB, ${ageStr})`,
      value: img.absPath,
      description: path.relative(PROJECT_ROOT, img.absPath),
    }
  })

  // 末尾追加"手动输入"兜底项
  choices.push(
    { name: '─'.repeat(40), value: null, disabled: true },
    {
      name: '✏️  手动输入路径...',
      value: SENTINEL_MANUAL,
      description: '当前目录找不到？直接输入绝对路径或 URL',
    }
  )

  const picked = await search({
    message,
    source: term => {
      if (!term || !term.trim()) return choices
      const t = term.toLowerCase()
      const filtered = choices.filter(c => c.value === null || c.name.toLowerCase().includes(t))
      if (filtered.length === 0) {
        return [{ name: `(无匹配 "${term}")`, value: '__no_match__', disabled: true }]
      }
      return filtered
    },
  })

  if (picked === SENTINEL_MANUAL || picked === '__no_match__') {
    return await promptManualPath(message + ' [手动输入]')
  }

  // 兜底校验：文件还存在
  if (!fs.existsSync(picked)) {
    console.error(`❌ 文件已不存在: ${picked}`)
    return await promptManualPath(message + ' [手动输入]')
  }

  return picked
}

/**
 * 让用户输入图片路径（绝对路径或 URL），支持退出。
 */
async function promptManualPath(message) {
  const { input } = await import('@inquirer/prompts')
  const manual = await input({
    message,
    validate: v => {
      if (!v.trim()) return '不能为空（直接回车取消）'
      const trimmed = v.trim()
      if (/^https?:\/\//i.test(trimmed)) return true
      if (!fs.existsSync(trimmed)) return `文件不存在: ${trimmed}`
      return true
    },
  })
  return manual.trim() || null
}

export { SENTINEL_MANUAL, DEFAULT_SCAN_DIR, MAX_RESULTS }
