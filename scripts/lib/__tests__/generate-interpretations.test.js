import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCliArgs } from '../generate-interpretations-cli.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CLI_PATH = path.join(__dirname, '..', '..', 'generate-interpretations.js')

describe('parseCliArgs', () => {
  it('parses slug and chapters', () => {
    const args = parseCliArgs(['子平真诠', '论用神,论格局'])
    expect(args.slug).toBe('子平真诠')
    expect(args.chapters).toEqual(['论用神', '论格局'])
    expect(args.force).toBe(false)
    expect(args.dryRun).toBe(false)
  })

  it('parses --force', () => {
    const args = parseCliArgs(['子平真诠', '--force'])
    expect(args.force).toBe(true)
  })

  it('parses --dry-run', () => {
    const args = parseCliArgs(['子平真诠', '--dry-run'])
    expect(args.dryRun).toBe(true)
  })

  it('parses --api-key', () => {
    const args = parseCliArgs(['子平真诠', '--api-key', 'sk-test'])
    expect(args.apiKey).toBe('sk-test')
  })

  it('parses --base-url', () => {
    const args = parseCliArgs(['子平真诠', '--base-url', 'https://test'])
    expect(args.baseUrl).toBe('https://test')
  })

  it('parses --model', () => {
    const args = parseCliArgs(['子平真诠', '--model', 'claude-sonnet-4-6'])
    expect(args.model).toBe('claude-sonnet-4-6')
  })

  it('returns all-chapters mode when chapters not provided', () => {
    const args = parseCliArgs(['子平真诠'])
    expect(args.chapters).toBeNull() // null = 整本
  })
})

describe('CLI signature consistency', () => {
  it('CLI calls loadSpecBundle with 2 args (slug, {projectRoot}) not 3', () => {
    // Regression: 在 fix spec-bundle 删 chapter 参数时, CLI 调用点未同步更新,
    // 导致 batches 报 "The path argument must be of type string. Received undefined"
    // 静态检查 CLI 源码防止再次发生
    const cliSource = fs.readFileSync(CLI_PATH, 'utf-8')
    // 找所有 loadSpecBundle(...) 调用
    const calls = [...cliSource.matchAll(/loadSpecBundle\s*\(([^)]*)\)/g)]
    expect(calls.length).toBeGreaterThan(0)
    for (const call of calls) {
      // 每个调用的逗号数 = 参数数 - 1
      // 2 参数（slug, opts）→ 1 个逗号
      // 3 参数（slug, chapter, opts）→ 2 个逗号 ← 旧 bug
      const argsStr = call[1]
      const commaCount = (argsStr.match(/,/g) || []).length
      // 容忍 {projectRoot: ROOT} 内部的冒号
      // 简单判断：参数里出现了 slug + 第二个位置参数是 slug-style (chinese) → 错
      // 严格判断：逗号数 = 1（slug + opts）✓，> 1 报错
      expect(commaCount, `loadSpecBundle call "${argsStr.trim()}" should have 1 comma (2 args: slug + opts), found ${commaCount}`).toBe(1)
    }
  })
})
