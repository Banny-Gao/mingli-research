/**
 * scripts/lib/env.js — 通用 schema 驱动 resolveConfig
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

function validateConcurrency(v) {
  const n = Number(v)
  if (!Number.isInteger(n) || n < 1) {
    throw new ConfigError(`❌ INTERPRETATION_CONCURRENCY 无效：${v}（必须是 ≥1 的整数）`)
  }
}

export function validateN(v) {
  const n = Number(v)
  if (!Number.isInteger(n) || n < 1 || n > 9) {
    throw new ConfigError(`❌ T2I_DEFAULT_N 无效：${v}（必须是 1-9 的整数）`)
  }
}

/**
 * 通用配置解析：按优先级 cli > process.env > schema.default 合并。
 *
 * @param {Record<string, {
 *   env?: string,        // 环境变量名，不传则只从 cli / default 取值
 *   default?: any,       // 默认值
 *   required?: boolean,  // 缺失时抛 ConfigError
 *   message?: string,    // required 缺失时的错误消息
 *   validate?: (value: any) => void  // 校验函数，不合法则抛错
 * }>} schema
 * @param {Record<string, any>} cli
 * @returns {Record<string, any>}
 */
export function resolveConfig(schema, cli = {}) {
  const config = {}
  for (const [key, def] of Object.entries(schema)) {
    // 1. CLI 参数优先（null 视为未指定）
    let value = cli[key] ?? undefined
    // 2. 环境变量次之
    if (value === undefined && def.env) {
      const envVal = process.env[def.env]
      if (envVal !== undefined) value = envVal
    }
    // 3. 默认值兜底
    if (value === undefined && def.default !== undefined) {
      value = def.default
    }
    // required 检查
    if (value === undefined && def.required) {
      throw new ConfigError(
        def.message || `❌ 缺少必填配置项: ${key}（设置环境变量 ${def.env} 或通过 CLI 传入）`
      )
    }
    // 校验
    if (value !== undefined && def.validate) {
      def.validate(value)
    }
    config[key] = value
  }
  return config
}

export const ANTHROPIC_SCHEMA = {
  apiKey: {
    env: 'LLM_API_KEY',
    required: true,
    message:
      `❌ 缺少 LLM_API_KEY 环境变量\n\n` +
      `请按以下任一方式配置：\n` +
      `1. 在 .env 中设置（推荐，参考 .env.example）\n` +
      `2. 在 shell 中 export：export LLM_API_KEY=sk-ant-...\n` +
      `3. 用 CLI 参数：--api-key sk-ant-...\n\n` +
      `获取 API key：https://console.anthropic.com/settings/keys`,
  },
  baseUrl: {
    env: 'LLM_BASE_URL',
    default: 'https://api.anthropic.com',
  },
  model: {
    env: 'LLM_MODEL',
    default: 'claude-opus-4-8',
  },
  concurrency: {
    env: 'INTERPRETATION_CONCURRENCY',
    default: 4,
    validate: validateConcurrency,
  },
}

export const llmConfig = resolveConfig(ANTHROPIC_SCHEMA)
