import { describe, it, expect } from 'vitest'
import { parseCliArgs } from '../generate-interpretations-cli.js'

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
