import { describe, it, expect } from 'vitest'
import { resolveConflict, ConflictChoice } from '../conflict.js'

describe('resolveConflict', () => {
  it('returns 覆盖 when choice is overwrite', () => {
    const result = resolveConflict(ConflictChoice.OVERWRITE, '/tmp/x.md', 'new content')
    expect(result.action).toBe('write')
    expect(result.content).toBe('new content')
  })

  it('returns 备份 + 写入 when choice is backup', () => {
    const result = resolveConflict(ConflictChoice.BACKUP, '/tmp/x.md', 'new content')
    expect(result.action).toBe('write')
    expect(result.backupPath).toBe('/tmp/x.md.bak')
  })

  it('returns 取消 when choice is cancel', () => {
    const result = resolveConflict(ConflictChoice.CANCEL, '/tmp/x.md', 'new content')
    expect(result.action).toBe('skip')
    expect(result.content).toBeNull()
  })

  it('returns 退出 when choice is abort', () => {
    const result = resolveConflict(ConflictChoice.ABORT, '/tmp/x.md', 'new content')
    expect(result.action).toBe('abort')
    expect(result.content).toBeNull()
  })
})
