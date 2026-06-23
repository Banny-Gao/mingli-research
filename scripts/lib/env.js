/**
 * scripts/lib/env.js — 解析 ANTHROPIC_* 配置
 *
 * 优先级：CLI 参数 > env var > 默认值
 */

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
