/**
 * scripts/lib/env.js — 解析 ANTHROPIC_* 配置
 *
 * 加载顺序（先到先得）：
 *   1. CLI 参数（--api-key 等）
 *   2. .env 文件（项目根目录，自动加载）
 *   3. 已存在的 process.env（shell export / --env-file / 测试注入优先）
 *   4. 内置默认值
 *
 * 优先级：CLI 参数 > env var > 默认值
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '..', '..')
const ENV_FILE = path.join(PROJECT_ROOT, '.env')

// 自动加载项目根 .env —— 不覆盖 process.env 中已存在的值（保护 --env-file、shell export、测试）
if (fs.existsSync(ENV_FILE)) {
  loadDotenvInto(ENV_FILE, process.env)
}

/**
 * 把 .env 文件内容解析进 target（通常是 process.env）。
 * 导出供测试；只设置 target 中未定义的键。
 */
export function loadDotenvInto(filePath, target) {
  if (!fs.existsSync(filePath)) return
  for (const line of fs.readFileSync(filePath, 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (!m) continue
    let v = m[2]
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (target[m[1]] === undefined) target[m[1]] = v
  }
}

export class ConfigError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ConfigError'
  }
}

const DEFAULTS = {
  baseUrl: 'https://api.anthropic.com',
  model: 'claude-opus-4-8',
  concurrency: 4,
}

/**
 * @param {{apiKey?: string, baseUrl?: string, model?: string, concurrency?: number}} cli
 * @returns {{apiKey: string, baseUrl: string, model: string, concurrency: number}}
 */
export function resolveConfig(cli = {}) {
  const apiKey = cli.apiKey || process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new ConfigError(
      `❌ 缺少 ANTHROPIC_API_KEY 环境变量\n\n` +
      `请按以下任一方式配置：\n` +
      `1. 在 .env 中设置（推荐，参考 .env.example）\n` +
      `2. 在 shell 中 export：export ANTHROPIC_API_KEY=sk-ant-...\n` +
      `3. 用 CLI 参数：--api-key sk-ant-...\n\n` +
      `获取 API key：https://console.anthropic.com/settings/keys`
    )
  }
  const rawConcurrency = cli.concurrency ?? process.env.INTERPRETATION_CONCURRENCY
  let concurrency = DEFAULTS.concurrency
  if (rawConcurrency !== undefined) {
    const n = Number(rawConcurrency)
    if (!Number.isInteger(n) || n < 1) {
      throw new ConfigError(`❌ INTERPRETATION_CONCURRENCY 无效：${rawConcurrency}（必须是 ≥1 的整数）`)
    }
    concurrency = n
  }
  return {
    apiKey,
    baseUrl: cli.baseUrl || process.env.ANTHROPIC_BASE_URL || DEFAULTS.baseUrl,
    model: cli.model || process.env.ANTHROPIC_MODEL || DEFAULTS.model,
    concurrency,
  }
}
