import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resolveConfig, ConfigError, loadDotenvInto } from '../env.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import os from 'node:os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

describe('loadDotenvInto', () => {
  let tmpFile
  let savedEnv

  beforeEach(() => {
    savedEnv = { ...process.env }
    tmpFile = path.join(os.tmpdir(), `mingli-dotenv-test-${Date.now()}-${Math.random().toString(36).slice(2)}.env`)
  })

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile)
    process.env = savedEnv
  })

  it('parses KEY=VALUE into a fresh target object', () => {
    fs.writeFileSync(tmpFile, 'ANTHROPIC_API_KEY=sk-x\nANTHROPIC_MODEL=claude-y\n')
    const target = {}
    loadDotenvInto(tmpFile, target)
    expect(target.ANTHROPIC_API_KEY).toBe('sk-x')
    expect(target.ANTHROPIC_MODEL).toBe('claude-y')
  })

  it('does not overwrite pre-existing keys in target (precedence: target > .env)', () => {
    fs.writeFileSync(tmpFile, 'ANTHROPIC_API_KEY=sk-from-dotenv\n')
    const target = { ANTHROPIC_API_KEY: 'sk-from-shell' }
    loadDotenvInto(tmpFile, target)
    expect(target.ANTHROPIC_API_KEY).toBe('sk-from-shell')
  })

  it('strips surrounding single or double quotes from values', () => {
    fs.writeFileSync(tmpFile, "ANTHROPIC_API_KEY=\"sk-dq\"\nANTHROPIC_BASE_URL='https://sq'\n")
    const target = {}
    loadDotenvInto(tmpFile, target)
    expect(target.ANTHROPIC_API_KEY).toBe('sk-dq')
    expect(target.ANTHROPIC_BASE_URL).toBe('https://sq')
  })

  it('skips comment lines and blank lines', () => {
    fs.writeFileSync(tmpFile, '# header comment\n\nANTHROPIC_API_KEY=sk-z\n# trailing\n')
    const target = {}
    loadDotenvInto(tmpFile, target)
    expect(target.ANTHROPIC_API_KEY).toBe('sk-z')
    expect(Object.keys(target)).toEqual(['ANTHROPIC_API_KEY'])
  })

  it('handles CR/LF line endings (Windows)', () => {
    fs.writeFileSync(tmpFile, 'ANTHROPIC_API_KEY=sk-crlf\r\nANTHROPIC_MODEL=m\r\n')
    const target = {}
    loadDotenvInto(tmpFile, target)
    expect(target.ANTHROPIC_API_KEY).toBe('sk-crlf')
    expect(target.ANTHROPIC_MODEL).toBe('m')
  })

  it('is a no-op when file does not exist', () => {
    const target = { ANTHROPIC_API_KEY: 'sk-untouched' }
    loadDotenvInto(path.join(os.tmpdir(), 'nope-nonexistent.env'), target)
    expect(target).toEqual({ ANTHROPIC_API_KEY: 'sk-untouched' })
  })
})
