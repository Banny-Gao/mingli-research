/**
 * scripts/lib/image-gen/preset.js — 共享 presets 读写
 *
 * t2i 和 i2i 共用同一个 presets.json（保存的配置字段一致）。
 * filepath 不传时走默认路径 `scripts/lib/image-gen/presets.json`。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_PRESETS_PATH = path.join(__dirname, 'presets.json')

function resolvePresetsPath(filepath) {
  if (filepath) return path.resolve(filepath)
  return DEFAULT_PRESETS_PATH
}

function ensureFile(filepath) {
  const dir = path.dirname(filepath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, '{}', 'utf-8')
  }
}

/**
 * 加载所有预设。
 * @param {string} [filepath] - 不传时走 t2i presets 默认路径
 * @returns {Record<string, object>}
 */
export function loadPresets(filepath) {
  const fp = resolvePresetsPath(filepath)
  ensureFile(fp)
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf-8'))
  } catch {
    return {}
  }
}

/**
 * 保存一个预设。
 * @param {string} [filepath]
 * @param {string} name
 * @param {object} config - { model, aspectRatio, width, height, style, styleWeight, responseFormat, outputDir, promptOptimizer, aigcWatermark }
 */
export function savePreset(filepath, name, config) {
  const fp = resolvePresetsPath(filepath)
  const presets = loadPresets(fp)
  presets[name] = { name, ...config, savedAt: new Date().toISOString() }
  fs.writeFileSync(fp, JSON.stringify(presets, null, 2), 'utf-8')
}

/**
 * 删除一个预设。
 */
export function deletePreset(filepath, name) {
  const fp = resolvePresetsPath(filepath)
  const presets = loadPresets(fp)
  delete presets[name]
  fs.writeFileSync(fp, JSON.stringify(presets, null, 2), 'utf-8')
}

/**
 * 列出所有预设名称。
 * @returns {string[]}
 */
export function listPresets(filepath) {
  return Object.keys(loadPresets(filepath))
}
