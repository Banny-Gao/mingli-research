/**
 * scripts/lib/__tests__/profile-rerender-bg-path.test.js
 *
 * 覆盖 profile.js 的两个 profile 的 resolveRerenderBgPath 钩子。
 *
 * 关键回归 bug：t2i profile 之前直接 path.join(metaPath dir, backgroundPath)，
 * 当 backgroundPath 已经是绝对路径时会被重复拼接成
 * "<dir>/<dir>/<file>"（issue：t2i --rerender "底图不存在"）。
 */

import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { T2I_PROFILE, I2I_PROFILE } from '../image-gen/profile.js'

const META_DIR = '/Users/gaozhipeng/Desktop/mingli-research/public/images'
const META_PATH = `${META_DIR}/八字提要-metadata.json`
const ABS_BG = '/Users/gaozhipeng/Desktop/mingli-research/public/images/墨兰鎏金-古籍封面.png'
const REL_BG = '墨兰鎏金-古籍封面.png'

describe('T2I_PROFILE.resolveRerenderBgPath', () => {
  it('passes through absolute backgroundPath as-is (no double-join)', () => {
    const meta = { backgroundPath: ABS_BG, results: [] }
    const resolved = T2I_PROFILE.resolveRerenderBgPath(meta, META_PATH)
    expect(resolved).toBe(ABS_BG)
    // 失败时的特征：路径里出现两次 public/images
    expect(resolved).not.toMatch(/\/public\/images\/.*\/public\/images\//)
  })

  it('resolves relative backgroundPath against metaPath dir', () => {
    const meta = { backgroundPath: REL_BG, results: [] }
    const resolved = T2I_PROFILE.resolveRerenderBgPath(meta, META_PATH)
    expect(resolved).toBe(`${META_DIR}/${REL_BG}`)
  })

  it('falls back to results[0].filename when no backgroundPath', () => {
    const meta = { results: [{ filename: 'cover.png' }] }
    const resolved = T2I_PROFILE.resolveRerenderBgPath(meta, META_PATH)
    expect(resolved).toBe(`${META_DIR}/cover.png`)
  })
})

describe('I2I_PROFILE.resolveRerenderBgPath', () => {
  it('prefers inputImage.absPath when present', () => {
    // i2i 用 fs.existsSync 过滤 candidates，所以 inputImage 必须真实存在。
    const tmpInput = path.join(os.tmpdir(), `rerender-bg-input-${Date.now()}.png`)
    fs.writeFileSync(tmpInput, Buffer.alloc(8))
    try {
      const meta = {
        inputImage: { absPath: tmpInput },
        backgroundPath: ABS_BG,
        results: [{ filename: 'out.png' }],
      }
      const resolved = I2I_PROFILE.resolveRerenderBgPath(meta, META_PATH)
      expect(resolved).toBe(tmpInput)
    } finally {
      fs.rmSync(tmpInput, { force: true })
    }
  })

  it('resolves absolute backgroundPath without double-join', () => {
    const meta = { backgroundPath: ABS_BG, results: [{ filename: 'out.png' }] }
    const resolved = I2I_PROFILE.resolveRerenderBgPath(meta, META_PATH)
    expect(resolved).toBe(ABS_BG)
  })

  it('resolves relative backgroundPath against metaPath dir', () => {
    const meta = { backgroundPath: REL_BG, results: [{ filename: 'out.png' }] }
    const resolved = I2I_PROFILE.resolveRerenderBgPath(meta, META_PATH)
    expect(resolved).toBe(`${META_DIR}/${REL_BG}`)
  })

  it('falls back to results[0].filename when no backgroundPath and no inputImage', () => {
    // i2i 的 candidates 用 fs.existsSync 过滤，所以这里需要一个真实存在的文件。
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rerender-bg-'))
    const tmpFile = path.join(tmpDir, 'out.png')
    fs.writeFileSync(tmpFile, Buffer.alloc(8))
    try {
      const meta = { results: [{ filename: 'out.png' }] }
      const resolved = I2I_PROFILE.resolveRerenderBgPath(meta, `${tmpDir}/x-metadata.json`)
      expect(resolved).toBe(tmpFile)
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })
})
