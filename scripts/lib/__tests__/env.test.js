import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resolveConfig, ConfigError } from '../env.js'

describe('resolveConfig', () => {
  let savedEnv

  beforeEach(() => {
    savedEnv = { ...process.env }
    // 清空相关 env
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.ANTHROPIC_BASE_URL
    delete process.env.ANTHROPIC_MODEL
  })

  afterEach(() => {
    process.env = savedEnv
  })

  it('throws ConfigError when ANTHROPIC_API_KEY is missing', () => {
    expect(() => resolveConfig({})).toThrow(ConfigError)
  })

  it('reads API key from env when CLI not provided', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-env-test'
    const config = resolveConfig({})
    expect(config.apiKey).toBe('sk-env-test')
  })

  it('CLI --api-key overrides env', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-env-test'
    const config = resolveConfig({ apiKey: 'sk-cli-test' })
    expect(config.apiKey).toBe('sk-cli-test')
  })

  it('uses default baseUrl when env and CLI both missing', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test'
    const config = resolveConfig({})
    expect(config.baseUrl).toBe('https://api.anthropic.com')
  })

  it('CLI --base-url overrides env', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test'
    process.env.ANTHROPIC_BASE_URL = 'https://env-gateway.example.com'
    const config = resolveConfig({ baseUrl: 'https://cli-gateway.example.com' })
    expect(config.baseUrl).toBe('https://cli-gateway.example.com')
  })

  it('uses default model claude-opus-4-8 when env and CLI both missing', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test'
    const config = resolveConfig({})
    expect(config.model).toBe('claude-opus-4-8')
  })

  it('CLI --model overrides env', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test'
    process.env.ANTHROPIC_MODEL = 'claude-sonnet-4-6'
    const config = resolveConfig({ model: 'claude-haiku-4-5-20251001' })
    expect(config.model).toBe('claude-haiku-4-5-20251001')
  })

  it('ConfigError message includes configuration guidance', () => {
    try {
      resolveConfig({})
    } catch (e) {
      expect(e.message).toContain('ANTHROPIC_API_KEY')
      expect(e.message).toContain('--api-key')
    }
  })
})
