/**
 * scripts/lib/t2i/fonts.js — 字体发现与匹配
 *
 * 扫描系统中文字体 + ~/.mingli/fonts/ 用户字体，
 * 根据描述（"毛笔行书""劲黑体"等）模糊匹配到具体字体文件路径。
 *
 * 优先级：~/.mingli/fonts/ > 系统字体
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execSync } from 'node:child_process'

// ===== 字体扫描 =====

const USER_FONTS_DIR = path.join(os.homedir(), '.mingli', 'fonts')

/**
 * 扫描 ~/.mingli/fonts/ 目录下的所有字体文件。
 */
function scanUserFonts() {
  if (!fs.existsSync(USER_FONTS_DIR)) return []
  return fs.readdirSync(USER_FONTS_DIR)
    .filter(f => /\.(ttf|otf|ttc)$/i.test(f))
    .map(f => ({
      name: path.basename(f, path.extname(f)),
      path: path.join(USER_FONTS_DIR, f),
      source: 'user',
    }))
}

/**
 * 用系统命令发现系统字体（macOS）。
 * 使用 fc-list 或 system_profiler 获取中文字体列表。
 */
function scanSystemFonts() {
  const fonts = []
  try {
    const output = execSync('fc-list :lang=zh -f "%{file}\t%{fullname}\n" 2>/dev/null', {
      encoding: 'utf-8',
      timeout: 3000,
    })
    for (const line of output.trim().split('\n')) {
      const [filePath, fullName] = line.split('\t')
      if (filePath && fullName) {
        fonts.push({ name: fullName, path: filePath, source: 'system' })
      }
    }
  } catch {
    // fc-list not available, fall back to known macOS paths
    fonts.push(...fallbackMacOSFonts())
  }
  return fonts
}

/**
 * macOS 已知中文字体路径 fallback。
 */
function fallbackMacOSFonts() {
  const assetDir = '/System/Library/AssetsV2/com_apple_MobileAsset_Font8'
  const known = [
    // 行书 / 手写类
    { name: 'Xingkai SC Bold', path: `${assetDir}/*/AssetData/Xingkai.ttc` },
    { name: 'Baoli SC', path: `${assetDir}/*/AssetData/Baoli.ttc` },
    { name: 'Yuppy SC', path: `${assetDir}/*/AssetData/YuppySC-Regular.otf` },
    { name: 'Wawati SC', path: `${assetDir}/*/AssetData/WawaSC-Regular.otf` },
    // 楷体
    { name: 'STKaiti', path: `${assetDir}/*/AssetData/Kaiti.ttc` },
    // 宋体 / 隶书
    { name: 'Libian SC', path: `${assetDir}/*/AssetData/Libian.ttc` },
    // 圆体
    { name: 'Yuanti SC Light', path: `${assetDir}/*/AssetData/Yuanti.ttc` },
    // 黑体
    { name: 'Heiti SC Medium', path: '/System/Library/Fonts/STHeiti Medium.ttc' },
    { name: 'Heiti SC Light', path: '/System/Library/Fonts/STHeiti Light.ttc' },
    // 苹方（多字重）
    { name: 'PingFang SC', path: `${assetDir}/*/AssetData/PingFang.ttc` },
  ]

  const result = []
  for (const font of known) {
    try {
      const dir = path.dirname(font.path.replace(/\/\*/, ''))
      if (fs.existsSync(dir)) {
        const entries = fs.readdirSync(dir)
        const match = entries.find(e => e.endsWith(path.basename(font.path).replace(/^\*/, '')))
        if (match) {
          result.push({ name: font.name, path: path.join(dir, match), source: 'system' })
        }
      }
    } catch {
      // skip if not found
    }
  }
  // 直接存在的路径
  for (const font of known) {
    if (!font.path.includes('*') && fs.existsSync(font.path)) {
      result.push({ name: font.name, path: font.path, source: 'system' })
    }
  }
  return result
}

// ===== 别名映射 =====

const ALIAS_MAP = {
  '行楷': 'Xingkai',
  '行书': 'Xingkai',
  '毛笔行书': 'Xingkai',
  '毛笔': 'Xingkai',
  '楷体': 'Kaiti',
  '楷书': 'Kaiti',
  '宋体': 'PingFang',  // macOS 无宋体，苹方最接近
  '仿宋': 'PingFang',
  '黑体': 'Heiti',
  '圆体': 'Yuanti',
  '娃娃体': 'Wawati',
  '可爱': 'Wawati',
  '隶书': 'Libian',
  '隶变': 'Libian',
  '报隶': 'Baoli',
  '雅痞': 'Yuppy',
  '苹方': 'PingFang',
}

/**
 * 根据描述 hint 匹配字体文件路径。
 * 匹配逻辑：精确匹配文件名 → 别名映射 → 模糊匹配 → fallback
 */
export function matchFont(hint) {
  if (!hint) return null

  const userFonts = scanUserFonts()
  const systemFonts = scanSystemFonts()
  const allFonts = [...userFonts, ...systemFonts]

  // 1. 精确匹配（用户字体优先，因为 userFonts 在前面）
  const exact = allFonts.find(f =>
    f.name.toLowerCase() === hint.toLowerCase() ||
    path.basename(f.path).toLowerCase() === `${hint.toLowerCase()}.ttf` ||
    path.basename(f.path).toLowerCase() === `${hint.toLowerCase()}.otf`
  )
  if (exact) return exact.path

  // 2. 别名映射
  const aliasKey = Object.keys(ALIAS_MAP).find(k => hint.includes(k))
  if (aliasKey) {
    const mapped = allFonts.find(f =>
      f.name.toLowerCase().includes(ALIAS_MAP[aliasKey].toLowerCase())
    )
    if (mapped) return mapped.path
  }

  // 3. 模糊匹配
  const fuzzy = allFonts.find(f =>
    f.name.toLowerCase().includes(hint.toLowerCase()) ||
    hint.toLowerCase().includes(f.name.toLowerCase())
  )
  if (fuzzy) return fuzzy.path

  // 4. fallback: PingFang SC
  const fallback = allFonts.find(f => f.name.includes('PingFang'))
  return fallback ? fallback.path : null
}

/**
 * 列出所有可用字体（供调试和交互模式使用）。
 */
export function listFonts() {
  return [...scanUserFonts(), ...scanSystemFonts()]
}
