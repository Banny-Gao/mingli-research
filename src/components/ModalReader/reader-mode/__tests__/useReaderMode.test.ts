import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReaderMode } from '@/hooks/useReaderMode'

describe('useReaderMode', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('默认是 scroll', () => {
    const { result } = renderHook(() => useReaderMode())
    expect(result.current[0]).toBe('scroll')
  })

  it('localStorage 已有值时读取', () => {
    localStorage.setItem('reader:mode', 'flip')
    const { result } = renderHook(() => useReaderMode())
    expect(result.current[0]).toBe('flip')
  })

  it('非法值兜底为 scroll', () => {
    localStorage.setItem('reader:mode', 'bogus')
    const { result } = renderHook(() => useReaderMode())
    expect(result.current[0]).toBe('scroll')
  })

  it('setMode 写入 localStorage', () => {
    const { result } = renderHook(() => useReaderMode())
    act(() => result.current[1]('smooth'))
    expect(result.current[0]).toBe('smooth')
    expect(localStorage.getItem('reader:mode')).toBe('smooth')
  })

  it('localStorage 写入失败时内存态仍生效', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    const { result } = renderHook(() => useReaderMode())
    expect(() => act(() => result.current[1]('flip'))).not.toThrow()
    expect(result.current[0]).toBe('flip')
    spy.mockRestore()
  })
})
