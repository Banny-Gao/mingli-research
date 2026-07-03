/**
 * scripts/lib/t2i/presets.js — 预设文件 JSON 读写
 *
 * 预设文件路径：process.env.T2I_PRESETS_FILE 或 scripts/lib/t2i/presets.json
 * 首次使用时自动创建目录和空 JSON。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_PRESETS_PATH = path.join(__dirname, 'presets.json')

function resolvePresetsPath() {
  const fromEnv = process.env.T2I_PRESETS_FILE || DEFAULT_PRESETS_PATH

  return path.resolve(fromEnv)
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
 * @returns {Record<string, object>}
 */
export function loadPresets(filepath) {
  const fp = filepath || resolvePresetsPath()
  ensureFile(fp)
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf-8'))
  } catch {
    return {}
  }
}

/**
 * 保存一个预设。
 * @param {string} filepath
 * @param {string} name
 * @param {object} config - { model, aspectRatio, width, height, style, styleWeight, responseFormat, outputDir, promptOptimizer, aigcWatermark }
 */
export function savePreset(filepath, name, config) {
  const fp = filepath || resolvePresetsPath()
  const presets = loadPresets(fp)
  presets[name] = { name, ...config, savedAt: new Date().toISOString() }
  fs.writeFileSync(fp, JSON.stringify(presets, null, 2), 'utf-8')
}

/**
 * 删除一个预设。
 */
export function deletePreset(filepath, name) {
  const fp = filepath || resolvePresetsPath()
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
