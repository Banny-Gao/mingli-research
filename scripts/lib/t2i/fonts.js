/**
 * scripts/lib/t2i/fonts.js — 字体发现与匹配
 *
 * 数据源（启动时加载一次，模块级缓存）：
 *   1. 项目内预置字体：./public/assets/fonts/（随仓库提交，跨团队协同）
 *   2. 系统字体 fallback：按 platform 查 presets/fonts.json 的 system_fallbacks
 *
 * 匹配逻辑：精确匹配文件名 → 别名映射 → 模糊匹配 → fallback (PingFang / Noto Sans)
 *
 * 关键变更（[feedback-t2i-fonts-preload]）：不再 fc-list / execSync 运行时扫描，
 * 而是预置清单 + 跨平台系统路径表，CI/容器/跨团队都能用。
 */

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
const require = createRequire(import.meta.url)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '..', '..', '..')
const BUNDLED_FONTS_DIR = path.join(PROJECT_ROOT, 'public', 'assets', 'fonts')
const PRESETS_FONTS = path.join(__dirname, 'presets', 'fonts.json')

function getPlatformKey() {
  return process.platform === 'darwin'
    ? 'macos'
    : process.platform === 'win32'
      ? 'windows'
      : 'linux'
}

function resolveSystemPath(fallback) {
  if (!fallback?.path) return null
  if (!fallback.path.includes('*')) return fs.existsSync(fallback.path) ? fallback.path : null
  const [prefix, rest] = fallback.path.split('/*')
  const basename = rest.replace(/^\//, '')
  if (!fs.existsSync(prefix)) return null
  try {
    const sub = fs.readdirSync(prefix).find(d => fs.existsSync(path.join(prefix, d, basename)))
    return sub ? path.join(prefix, sub, basename) : null
  } catch {
    return null
  }
}

// ===== 模块级缓存 =====

let _catalog = null
let _bundledScanned = false
let _bundledMissingWarned = false

/**
 * 加载预设清单（bundled + system_fallbacks + download）。失败时返回空结构。
 */
function loadPresets() {
  if (_catalog) return _catalog
  try {
    _catalog = JSON.parse(fs.readFileSync(PRESETS_FONTS, 'utf-8'))
  } catch {
    _catalog = {
      bundled: [],
      system_fallbacks: { macos: [], windows: [], linux: [] },
      download: {},
    }
  }
  return _catalog
}

/**
 * 获取当前 bundled 列表。优先用 install-system-fonts.js 运行时扩充的结果（内存），
 * 否则从 JSON 读。fonts.js 不能依赖 import 顺序，所以两层都支持。
 */
function readBundled() {
  // 1. 优先：运行时扩充（install-system-fonts.js 完成后）
  //    通过 globalThis 桥接避免循环 import
  if (globalThis.__t2i_bundled_runtime) return globalThis.__t2i_bundled_runtime
  // 2. fallback：读 JSON
  const presets = loadPresets()
  return presets.bundled || []
}

/**
 * 扫描项目内预置字体目录（含 install-system-fonts.js 运行时复制到这里的字体）。
 * 关键：family 名不能仅从 bundled 拿，要兼容"系统字体被复制过来但未登记"的情况。
 * 解决：用 bundled[].family 优先；找不到时从 system_fallbacks 按 basename 反查 family。
 */
function scanBundledFonts() {
  if (_bundledScanned) return
  _bundledScanned = true

  const bundled = readBundled()
  const presets = loadPresets()
  const platform = getPlatformKey()

  if (!fs.existsSync(BUNDLED_FONTS_DIR)) {
    fs.mkdirSync(BUNDLED_FONTS_DIR, { recursive: true })
  }

  // 构建 basename → family 反查表
  const systemList = presets.system_fallbacks?.[platform] || []
  const basenameToFamily = new Map()
  for (const e of systemList) {
    const resolved = resolveSystemPath(e)
    if (resolved) {
      basenameToFamily.set(path.basename(resolved).toLowerCase(), e.name)
    }
  }

  // 扫描目录里所有字体文件，对照 bundled + basenameToFamily
  const onDisk = fs.readdirSync(BUNDLED_FONTS_DIR).filter(f => /\.(ttf|otf|ttc)$/i.test(f))

  const onDiskFamilies = []
  const missing = []
  for (const f of onDisk) {
    // bundled 中声明？
    const entry = bundled.find(b => b.file === f)
    if (entry) {
      onDiskFamilies.push({ family: entry.family, file: f, purpose: entry.purpose })
    } else {
      // system_fallbacks 反查
      const family = basenameToFamily.get(f.toLowerCase())
      if (family) onDiskFamilies.push({ family, file: f, purpose: '系统复制' })
    }
  }

  for (const entry of bundled) {
    if (!onDisk.find(d => d.file === entry.file)) missing.push(entry)
  }

  if (missing.length && !_bundledMissingWarned) {
    _bundledMissingWarned = true
    console.warn(`\n⚠️  项目内字体缺失 (${missing.length}/${bundled.length}):`)
    for (const m of missing.slice(0, 5)) {
      console.warn(`   - ${m.file} (${m.purpose || m.family})`)
      const dl = m.url || presets.download?.[m.file]
      if (dl) console.warn(`     下载: ${dl}`)
    }
    if (missing.length > 5) console.warn(`   ... 还有 ${missing.length - 5} 个`)
    console.warn(`   放入: ${BUNDLED_FONTS_DIR}\n`)
  }
}

/**
 * 列出项目内已存在的预置字体。
 */
function listBundled() {
  scanBundledFonts()
  const bundled = readBundled()
  const presets = loadPresets()
  const platform = getPlatformKey()
  const systemList = presets.system_fallbacks?.[platform] || []
  const basenameToFamily = new Map()
  for (const e of systemList) {
    const resolved = resolveSystemPath(e)
    if (resolved) basenameToFamily.set(path.basename(resolved).toLowerCase(), e.name)
  }

  const result = []
  for (const entry of bundled) {
    const p = path.join(BUNDLED_FONTS_DIR, entry.file)
    if (fs.existsSync(p)) {
      result.push({ name: entry.family, path: p, source: 'bundled', style: entry.style })
    }
  }
  // 扫盘补充（运行时 auto_added 的字体）
  if (fs.existsSync(BUNDLED_FONTS_DIR)) {
    for (const f of fs.readdirSync(BUNDLED_FONTS_DIR)) {
      if (!/\.(ttf|otf|ttc)$/i.test(f)) continue
      if (result.find(r => path.basename(r.path) === f)) continue
      const family = basenameToFamily.get(f.toLowerCase()) || path.basename(f, path.extname(f))
      const p = path.join(BUNDLED_FONTS_DIR, f)
      result.push({ name: family, path: p, source: 'auto', style: null })
    }
  }
  return result
}

/**
 * 列出当前平台可用的系统字体（按预设路径表查，不做运行时扫描）。
 */
function listSystem() {
  const presets = loadPresets()
  const platform =
    process.platform === 'darwin' ? 'macos' : process.platform === 'win32' ? 'windows' : 'linux'

  const entries = presets.system_fallbacks?.[platform] || []
  const result = []
  for (const e of entries) {
    // Windows 路径是字面量；macOS/Linux 路径可能含 *（glob 简写）
    if (e.path.includes('*')) {
      // 简单 glob 展开：取路径中 * 之前的目录，列出匹配
      const [prefix, rest] = e.path.split('/*')
      const basename = rest.replace(/^\//, '')
      if (fs.existsSync(prefix)) {
        try {
          const sub = fs
            .readdirSync(prefix)
            .find(d => fs.existsSync(path.join(prefix, d, basename)))
          if (sub) {
            result.push({ name: e.name, path: path.join(prefix, sub, basename), source: 'system' })
            continue
          }
        } catch {
          /* skip */
        }
      }
    } else if (fs.existsSync(e.path)) {
      result.push({ name: e.name, path: e.path, source: 'system' })
    }
  }
  return result
}

/**
 * 列出所有可用字体（bundled + system）。
 */
function listAll() {
  return [...listBundled(), ...listSystem()]
}

// ===== 别名映射 =====
// 从 fonts.json 的 aliases 块加载（数据驱动，团队可定制）。
// JSON 缺 aliases 字段时返回空对象，matchFont 退化为"精确 + 模糊"。

function loadAliasMap() {
  const presets = loadPresets()
  const fromJson = presets.aliases
  if (!fromJson || typeof fromJson !== 'object') return {}
  const cleaned = {}
  for (const [k, v] of Object.entries(fromJson)) {
    if (k.startsWith('_')) continue
    cleaned[k] = Array.isArray(v) ? v : [v]
  }
  return cleaned
}

/**
 * 预处理 LLM 输出的 fontHint。
 * 括号内容（如"如楷书/隶书/颜体风格"、"例如宋体"）视为补充说明/举例，应当剥离。
 * 避免 hint 同时含多个 alias key 时被括号里的例子误导（如"黑字古风字体（如楷书/隶书/...）"
 * 不应让"楷书"胜出"古风"）。
 *
 * 关键守卫：`如`/`例如`/`比如` 必须前导分隔符（空白/逗号/句号/分号/括号开头）
 * 才视为举例前缀，避免误吃合法单字 key（`如意`、`如果`）。
 */
function normalizeHint(hint) {
  if (!hint) return hint
  return hint
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/[\s，。（(【]例如[^,，。；;]+/g, '')
    .replace(/[\s，。（(【]比如[^,，。；;]+/g, '')
    .replace(/[\s，。（(【]如[^,，。；;/]+/g, '')
    .trim()
}

/**
 * 根据描述 hint 匹配字体。
 * 返回 { path, family } 或 null。
 * family 是 OTF/TTF 文件内部 name 表里的家族名（canvas 需要用这个名字注册）；
 * 不是 path.basename — 后者对带下划线的文件名（如 MFLingLong_Noncommercial-Regular）
 * 会与 OTF 实际 family 名（MFLingLongNoncommercial）不一致，导致 canvas 找不到字体。
 */
export function matchFont(hint) {
  if (!hint) return null

  const allFonts = listAll()
  if (allFonts.length === 0) return null

  const normalizedHint = normalizeHint(hint)
  const hit = entry => ({ path: entry.path, family: entry.name })

  // 1. 精确匹配（项目内字体优先，因 listAll 中 bundled 在前）
  const exact = allFonts.find(
    f =>
      f.name.toLowerCase() === normalizedHint.toLowerCase() ||
      path.basename(f.path).toLowerCase() === `${normalizedHint.toLowerCase()}.ttf` ||
      path.basename(f.path).toLowerCase() === `${normalizedHint.toLowerCase()}.otf` ||
      path.basename(f.path).toLowerCase() === `${normalizedHint.toLowerCase()}.ttc`
  )
  if (exact) return hit(exact)

  // 2. 别名映射（按 target 数组顺序尝试）
  const aliasMap = loadAliasMap()
  const aliasKey = Object.keys(aliasMap).find(k => normalizedHint.includes(k))
  if (aliasKey) {
    const targets = aliasMap[aliasKey]
    for (const t of targets) {
      const t_lower = t.toLowerCase()
      const mapped = allFonts.find(f => f.name.toLowerCase().includes(t_lower))
      if (mapped) return hit(mapped)
    }
  }

  // 3. 模糊匹配
  const fuzzy = allFonts.find(
    f =>
      f.name.toLowerCase().includes(normalizedHint.toLowerCase()) ||
      normalizedHint.toLowerCase().includes(f.name.toLowerCase())
  )
  if (fuzzy) return hit(fuzzy)

  // 4. fallback: NotoSansSC（语义最接近"中文默认"）；若连这个都没有才返 null
  const fallback = allFonts.find(f => /NotoSans|PingFang/.test(f.name))
  return fallback ? hit(fallback) : null
}

/**
 * 列出所有可用字体（供调试和交互模式使用）。
 */
export function listFonts() {
  return listAll()
}
