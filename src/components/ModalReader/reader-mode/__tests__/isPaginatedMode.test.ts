// src/components/ModalReader/reader-mode/__tests__/isPaginatedMode.test.ts
import { describe, it, expect } from 'vitest'
import { isPaginatedMode, PAGINATED_MODES } from '../constants'

describe('isPaginatedMode', () => {
  it('scroll → false', () => {
    expect(isPaginatedMode('scroll')).toBe(false)
  })

  it('smooth / flip → true', () => {
    expect(isPaginatedMode('smooth')).toBe(true)
    expect(isPaginatedMode('flip')).toBe(true)
  })

  it('PAGINATED_MODES 包含 smooth + flip', () => {
    expect(PAGINATED_MODES).toContain('smooth')
    expect(PAGINATED_MODES).toContain('flip')
    expect(PAGINATED_MODES).not.toContain('scroll')
  })
})
