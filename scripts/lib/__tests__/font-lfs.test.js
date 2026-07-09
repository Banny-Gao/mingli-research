/**
 * scripts/lib/__tests__/font-lfs.test.js
 * 覆盖 Git LFS 化后的指针文件识别逻辑（isFontAvailableOnDisk / isLfsPointer）。
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { isLfsPointer } from '../shared/font-installer.js'

let tmpDir

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'font-lfs-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

function writeRealFont(filepath, sizeBytes = 10_000_000) {
  // 写满 sizeBytes 字节，magic 头任意即可
  const buf = Buffer.alloc(sizeBytes)
  buf.write('OTTO', 0)
  fs.writeFileSync(filepath, buf)
}

function writeLfsPointer(filepath) {
  const content = [
    'version https://git-lfs.github.com/spec/v1',
    'oid sha256:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    'size 101000000',
    '',
  ].join('\n')
  fs.writeFileSync(filepath, content)
}

function writeTinyFile(filepath, size = 50) {
  fs.writeFileSync(filepath, Buffer.alloc(size, 'a'))
}

describe('isLfsPointer', () => {
  it('识别标准 LFS 指针（133 字节，magic 头正确）', () => {
    const fp = path.join(tmpDir, 'simhei.ttf')
    writeLfsPointer(fp)
    expect(fs.statSync(fp).size).toBeGreaterThanOrEqual(120)
    expect(isLfsPointer(fp)).toBe(true)
  })

  it('拒绝真实字体文件（>200 字节）', () => {
    const fp = path.join(tmpDir, 'PingFang.ttc')
    writeRealFont(fp, 1_000_000)
    expect(isLfsPointer(fp)).toBe(false)
  })

  it('拒绝不存在文件（不抛错，返回 false）', () => {
    const fp = path.join(tmpDir, 'nope.ttf')
    expect(isLfsPointer(fp)).toBe(false)
  })

  it('拒绝 120 字节以下的非指针小文件（玲珑体 1.3MB 不会误判）', () => {
    const fp = path.join(tmpDir, 'MFLingLong.otf')
    writeTinyFile(fp, 50)
    expect(isLfsPointer(fp)).toBe(false)
  })

  it('拒绝 133 字节但 magic 头不对的文件（防御性）', () => {
    const fp = path.join(tmpDir, 'fake-lfs.ttf')
    fs.writeFileSync(fp, 'this is not a lfs pointer but happens to be 133 bytes long!'.padEnd(133, 'x'))
    expect(fs.statSync(fp).size).toBeGreaterThanOrEqual(120)
    expect(isLfsPointer(fp)).toBe(false)
  })
})