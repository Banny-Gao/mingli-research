/**
 * scripts/lib/conflict.js — 落盘冲突 4 选项
 *
 * 与 source-create 共享同一 4 选项形态
 */

export const ConflictChoice = Object.freeze({
  OVERWRITE: 'A',
  BACKUP: 'B',
  CANCEL: 'C',
  ABORT: 'D',
})

/**
 * @param {string} choice - 'A' | 'B' | 'C' | 'D'
 * @param {string} filePath
 * @param {string} newContent
 * @returns {{action: 'write'|'skip'|'abort', content: string|null, backupPath: string|null}}
 */
export function resolveConflict(choice, filePath, newContent) {
  switch (choice) {
    case ConflictChoice.OVERWRITE:
      return { action: 'write', content: newContent, backupPath: null }
    case ConflictChoice.BACKUP:
      return { action: 'write', content: newContent, backupPath: `${filePath}.bak` }
    case ConflictChoice.CANCEL:
      return { action: 'skip', content: null, backupPath: null }
    case ConflictChoice.ABORT:
      return { action: 'abort', content: null, backupPath: null }
    default:
      throw new Error(`Unknown conflict choice: ${choice}`)
  }
}
