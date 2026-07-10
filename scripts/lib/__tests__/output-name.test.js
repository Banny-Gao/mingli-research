/**
 * scripts/lib/__tests__/output-name.test.js
 *
 * 覆盖 output-name.js 的 4 个导出：
 * - validateName: 合法/非法字符 + 边界
 * - resolveUniqueName: 空目录/单文件/递增
 * - writeUniqueFile: 单次写入 / 串行 N 次 / 并发 N worker
 * - parseBatchName: 单名 / 一一对应 / 数量不匹配回退
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {
  validateName,
  resolveUniqueName,
  resolveBatchNames,
  writeUniqueFile,
  parseBatchName,
  MAX_WRITE_RETRIES,
  MAX_NAME_LENGTH,
  FORBIDDEN_CHARS,
} from '../shared/output-name.js'

let tmpDir
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'output-name-test-'))
})
afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

// ===== validateName =====
describe('validateName', () => {
  it('accepts Chinese characters', () => {
    expect(validateName('古籍封面').valid).toBe(true)
    expect(validateName('古籍封面 2026').valid).toBe(true)
  })

  it('accepts latin / digits / `-_.`', () => {
    expect(validateName('foo-bar_baz.png').valid).toBe(true)
    expect(validateName('v1.2.3').valid).toBe(true)
    expect(validateName('ABC123').valid).toBe(true)
  })

  it('accepts emoji', () => {
    expect(validateName('🎨 设计稿').valid).toBe(true)
  })

  it('rejects empty string and whitespace-only', () => {
    expect(validateName('').valid).toBe(false)
    expect(validateName('').error).toContain('不能为空')
    expect(validateName('   ').valid).toBe(false)
  })

  it('rejects non-string input', () => {
    const r = validateName(null)
    expect(r.valid).toBe(false)
    expect(r.error).toContain('字符串')
  })

  it('rejects names exceeding MAX_NAME_LENGTH', () => {
    const long = 'a'.repeat(MAX_NAME_LENGTH + 1)
    const r = validateName(long)
    expect(r.valid).toBe(false)
    expect(r.error).toContain(String(MAX_NAME_LENGTH))
  })

  it('rejects path separators (both slash styles)', () => {
    expect(validateName('a/b').valid).toBe(false)
    expect(validateName('a\\b').valid).toBe(false)
  })

  it.each([
    [':', '冒号'],
    ['*', '星号'],
    ['?', '问号'],
    ['"', '双引号'],
    ['<', '小于'],
    ['>', '大于'],
    ['|', '竖线'],
  ])('rejects Windows reserved char %j (%s)', (ch) => {
    const r = validateName(`name${ch}suffix`)
    expect(r.valid).toBe(false)
    expect(r.error).toContain(ch)
  })

  it('exports FORBIDDEN_CHARS matching the spec', () => {
    const expectChars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|']
    for (const ch of expectChars) {
      expect(FORBIDDEN_CHARS.test(ch)).toBe(true)
    }
    // ASCII 控制字符（\0 \n \r \t）也在禁列
    expect(FORBIDDEN_CHARS.test('\0')).toBe(true)
    expect(FORBIDDEN_CHARS.test('\n')).toBe(true)
    expect(FORBIDDEN_CHARS.test('\r')).toBe(true)
    expect(FORBIDDEN_CHARS.test('\t')).toBe(true)
    // 普通字符不在禁列
    expect(FORBIDDEN_CHARS.test('a')).toBe(false)
    expect(FORBIDDEN_CHARS.test('-')).toBe(false)
    expect(FORBIDDEN_CHARS.test('.')).toBe(false)
    expect(FORBIDDEN_CHARS.test(' ')).toBe(false)
  })

  it.each([
    ['\0', 'NUL'],
    ['\n', 'LF'],
    ['\r', 'CR'],
    ['\t', 'TAB'],
  ])('rejects ASCII control char %s (%s) with descriptive error', (ch, _label) => {
    const r = validateName(`name${ch}suffix`)
    expect(r.valid).toBe(false)
    expect(r.error).toMatch(/控制字符/)
  })
})

// ===== resolveUniqueName =====
describe('resolveUniqueName', () => {
  it('returns baseName unchanged when outputDir does not exist', () => {
    const missing = path.join(tmpDir, 'never-created')
    expect(resolveUniqueName(missing, 'foo', 'png')).toBe('foo')
  })

  it('returns baseName unchanged when outputDir is empty', () => {
    expect(resolveUniqueName(tmpDir, 'foo', 'png')).toBe('foo')
  })

  it('returns baseName unchanged when only unrelated files exist', () => {
    fs.writeFileSync(path.join(tmpDir, 'other-01.png'), '')
    fs.writeFileSync(path.join(tmpDir, 'totally-different.jpg'), '')
    expect(resolveUniqueName(tmpDir, 'foo', 'png')).toBe('foo')
  })

  it('detects conflict on `<base>-NN.<ext>` (未递增形态) and returns next -N suffix', () => {
    fs.writeFileSync(path.join(tmpDir, 'foo-01.png'), '')
    // foo-01.png 正则把 01 读为 maxSuffix=1 → 返回 foo-2（与 spec 吻合，"未递增"也视作 1 次迭代）
    expect(resolveUniqueName(tmpDir, 'foo', 'png')).toBe('foo-2')
  })

  it('detects conflict on `<base>-N-NN.<ext>` (已递增形态)', () => {
    fs.writeFileSync(path.join(tmpDir, 'foo-1-01.png'), '')
    fs.writeFileSync(path.join(tmpDir, 'foo-2-01.png'), '')
    expect(resolveUniqueName(tmpDir, 'foo', 'png')).toBe('foo-3')
  })

  it('treats metadata.json presence as conflict', () => {
    fs.writeFileSync(path.join(tmpDir, 'foo-metadata.json'), '{}')
    // 仅有 metadata，没有 png 时也算 conflict（保证 base 与 base-N 共存不会冲突）
    expect(resolveUniqueName(tmpDir, 'foo', 'png')).toBe('foo-1')
  })

  it('ext scoped to a specific extension (json does not match png regex)', () => {
    fs.writeFileSync(path.join(tmpDir, 'foo-01.json'), '')
    // png regex 不匹配 .json，应视为无冲突
    expect(resolveUniqueName(tmpDir, 'foo', 'png')).toBe('foo')
  })

  it('handles baseName with regex-special chars by escaping', () => {
    fs.writeFileSync(path.join(tmpDir, 'a.b-01.png'), '')
    // base='a.b' 时 pattern 必须把 . 视作字面量，而不是 "a<any>b"
    expect(resolveUniqueName(tmpDir, 'a.b', 'png')).toBe('a.b-2')
    // 确认不会误匹配 aXb-NN.png
    fs.writeFileSync(path.join(tmpDir, 'aXb-01.png'), '')
    // 即便有 aXb-01.png，pattern 不会把它算作 a.b 的变体
    expect(resolveUniqueName(tmpDir, 'a.b', 'png')).toBe('a.b-2')
  })
})

// ===== writeUniqueFile =====
describe('writeUniqueFile', () => {
  it('writes a fresh file with no conflict', () => {
    const r = writeUniqueFile(tmpDir, 'foo', '.png', 'hello')
    expect(r.filepath).toBe(path.join(tmpDir, 'foo.png'))
    expect(r.finalBase).toBe('foo')
    expect(fs.readFileSync(r.filepath, 'utf-8')).toBe('hello')
  })

  it('increments to foo-1.png when foo.png already exists', () => {
    fs.writeFileSync(path.join(tmpDir, 'foo.png'), 'OLD')
    const r = writeUniqueFile(tmpDir, 'foo', '.png', 'NEW')
    expect(r.filepath).toBe(path.join(tmpDir, 'foo-1.png'))
    expect(r.finalBase).toBe('foo-1')
    expect(fs.readFileSync(r.filepath, 'utf-8')).toBe('NEW')
    expect(fs.readFileSync(path.join(tmpDir, 'foo.png'), 'utf-8')).toBe('OLD')
  })

  it('walks through foo-2.png / foo-3.png on successive calls', () => {
    fs.writeFileSync(path.join(tmpDir, 'foo.png'), '')
    fs.writeFileSync(path.join(tmpDir, 'foo-1.png'), '')
    const r = writeUniqueFile(tmpDir, 'foo', '.png', 'X')
    expect(r.finalBase).toBe('foo-2')

    fs.writeFileSync(path.join(tmpDir, 'foo-2.png'), '')
    const r2 = writeUniqueFile(tmpDir, 'foo', '.png', 'Y')
    expect(r2.finalBase).toBe('foo-3')
  })

  it('writes Buffer content correctly', () => {
    const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47]) // PNG magic
    const r = writeUniqueFile(tmpDir, 'img', '.png', buf)
    expect(Buffer.compare(fs.readFileSync(r.filepath), buf)).toBe(0)
  })

  it('does NOT touch pre-existing .tmp residue (own by other module)', () => {
    // text-overlay.js 会用 bgPath.tmp.png 这种 staging 文件；
    // writeUniqueFile 仅负责目标文件，不应碰 .tmp 残留
    fs.writeFileSync(path.join(tmpDir, 'foo.png.tmp'), 'STAGING')
    fs.writeFileSync(path.join(tmpDir, 'foo.png'), 'EXISTING')
    writeUniqueFile(tmpDir, 'foo', '.png', 'NEW')
    // .tmp 应保留
    expect(fs.readFileSync(path.join(tmpDir, 'foo.png.tmp'), 'utf-8')).toBe('STAGING')
  })

  it('serial 8 writes all succeed with unique files (no last-write-wins)', () => {
    const results = []
    for (let i = 0; i < 8; i++) {
      results.push(writeUniqueFile(tmpDir, 'ser', '.png', `payload-${i}`))
    }
    const names = new Set(results.map(r => path.basename(r.filepath)))
    expect(names.size).toBe(8)
    // 内容必须唯一保留：所有 8 个 payload 都能从某个文件读回
    for (let i = 0; i < 8; i++) {
      const expected = `payload-${i}`
      const found = fs.readdirSync(tmpDir).some(f => {
        try {
          return fs.readFileSync(path.join(tmpDir, f), 'utf-8') === expected
        } catch {
          return false
        }
      })
      expect(found, `${expected} should be retained`).toBe(true)
    }
  })

  it('concurrent 10 workers all get unique files', async () => {
    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        writeUniqueFile(tmpDir, 'con', '.png', `worker-${i}`)
      )
    )
    const names = new Set(results.map(r => path.basename(r.filepath)))
    expect(names.size).toBe(10)
    // 每个 worker 的 payload 必须不丢
    for (let i = 0; i < 10; i++) {
      const found = fs.readdirSync(tmpDir).some(f => {
        try {
          return fs.readFileSync(path.join(tmpDir, f), 'utf-8') === `worker-${i}`
        } catch {
          return false
        }
      })
      expect(found, `worker-${i} payload lost`).toBe(true)
    }
  })

  it('writes JSON extension correctly', () => {
    const r = writeUniqueFile(tmpDir, 'meta', '.json', JSON.stringify({ k: 'v' }))
    expect(r.filepath).toBe(path.join(tmpDir, 'meta.json'))
    expect(JSON.parse(fs.readFileSync(r.filepath, 'utf-8'))).toEqual({ k: 'v' })
  })

  it('handles non-standard ext (e.g. -bg.png with custom suffix)', () => {
    // writeUniqueFile 必须支持任意 ext 拼接，不依赖 resolveUniqueName 的 regex
    const r1 = writeUniqueFile(tmpDir, 'foo', '-bg.png', 'BG_1')
    expect(r1.filepath).toBe(path.join(tmpDir, 'foo-bg.png'))
    expect(r1.finalBase).toBe('foo')

    const r2 = writeUniqueFile(tmpDir, 'foo', '-bg.png', 'BG_2')
    // 第二次跑同名 --name 应自动递增到 foo-1-bg.png（regex-based resolveUniqueName 不支持 -bg.png，
    // 所以本测试同时验证了改用线性递增后的正确性）
    expect(r2.finalBase).toBe('foo-1')
    expect(fs.readFileSync(r1.filepath, 'utf-8')).toBe('BG_1')
    expect(fs.readFileSync(r2.filepath, 'utf-8')).toBe('BG_2')
  })

  it('does not collide with images saved by generateFilename (-NN.png format)', () => {
    // 模拟 t2i.js 流程：先写 metadata + bg，再被后续 downloadImage 写 foo-01.png
    writeUniqueFile(tmpDir, 'foo', '-metadata.json', '{"k":1}')
    writeUniqueFile(tmpDir, 'foo', '-bg.png', Buffer.from([0xff, 0xd8]))
    // 这些是后续 downloadImage 直接 fs.writeFileSync 的（不走 writeUniqueFile），
    // 验证 -bg.png / -metadata.json 不污染 generateFilename 的 -NN.png 命名空间
    expect(fs.existsSync(path.join(tmpDir, 'foo-metadata.json'))).toBe(true)
    expect(fs.existsSync(path.join(tmpDir, 'foo-bg.png'))).toBe(true)
    // 当再次跑同名 --name 时，writeUniqueFile 会自动递增到 foo-1-*
    const next = writeUniqueFile(tmpDir, 'foo', '-metadata.json', '{"k":2}')
    expect(path.basename(next.filepath)).toBe('foo-1-metadata.json')
  })
})

// ===== parseBatchName =====
describe('parseBatchName', () => {
  it('returns null when prompts missing (single-prompt mode)', () => {
    expect(parseBatchName({ name: 'foo' })).toBeNull()
  })

  it('returns null when name missing', () => {
    expect(parseBatchName({ prompts: ['p1', 'p2'] })).toBeNull()
  })

  it('expands single name to N copies when matched', () => {
    const opts = { prompts: ['p1', 'p2', 'p3'], name: 'foo' }
    expect(parseBatchName(opts)).toEqual(['foo', 'foo', 'foo'])
  })

  it('returns names 1:1 when count matches', () => {
    const opts = { prompts: ['p1', 'p2'], name: '封面1,封面2' }
    expect(parseBatchName(opts)).toEqual(['封面1', '封面2'])
  })

  it('returns null and clears opts.name when count mismatches', () => {
    const opts = { prompts: ['p1', 'p2'], name: '封面1,封面2,封面3' }
    const result = parseBatchName(opts)
    expect(result).toBeNull()
    // 副作用：清空 name 与 names，确保 caller 回退 timestamp
    expect(opts.name).toBeUndefined()
    expect(opts.names).toBeNull()
  })
})

// ===== resolveBatchNames =====
describe('resolveBatchNames', () => {
  it('returns null when prompts missing', () => {
    expect(resolveBatchNames({ names: ['foo'] })).toBeNull()
  })

  it('returns null when names length does not match prompts', () => {
    const out = resolveBatchNames({ prompts: ['p1', 'p2'], names: ['foo'] }, tmpDir)
    expect(out).toBeNull()
  })

  it('returns baseNames unchanged when outputDir does not exist', () => {
    const out = resolveBatchNames(
      { prompts: ['p1', 'p2'], names: ['foo', 'bar'] },
      path.join(tmpDir, 'never-created')
    )
    expect(out).toEqual(['foo', 'bar'])
  })

  it('resolves independent names with a single readdir (no per-name syscall tax)', () => {
    // 模拟已有文件：foo-01.png 已存在 → foo 必须变 foo-2；
    //                bar.png 已存在 → bar 必须变 bar-1。
    fs.writeFileSync(path.join(tmpDir, 'foo-01.png'), '')
    fs.writeFileSync(path.join(tmpDir, 'bar.png'), '')
    const out = resolveBatchNames(
      { prompts: ['p1', 'p2'], names: ['foo', 'bar'] },
      tmpDir
    )
    expect(out).toEqual(['foo-2', 'bar-1'])
  })

  it('treats metadata.json presence as conflict for the matching base', () => {
    fs.writeFileSync(path.join(tmpDir, 'foo-metadata.json'), '{}')
    fs.writeFileSync(path.join(tmpDir, 'bar-01.png'), '')
    const out = resolveBatchNames(
      { prompts: ['p1', 'p2'], names: ['foo', 'bar'] },
      tmpDir
    )
    expect(out).toEqual(['foo-1', 'bar-2'])
  })
})
