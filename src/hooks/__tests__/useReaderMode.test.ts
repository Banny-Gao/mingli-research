// src/hooks/__tests__/useReaderMode.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReaderMode } from '../useReaderMode'

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
    localStorage.setItem('reader:mode', 'invalid')
    const { result } = renderHook(() => useReaderMode())
    expect(result.current[0]).toBe('scroll')
  })

  it('setMode 写入 localStorage', () => {
    const { result } = renderHook(() => useReaderMode())
    act(() => result.current[1]('smooth'))
    expect(result.current[0]).toBe('smooth')
    expect(localStorage.getItem('reader:mode')).toBe('smooth')
  })

  it('setMode 切换回 scroll', () => {
    const { result } = renderHook(() => useReaderMode())
    act(() => result.current[1]('flip'))
    act(() => result.current[1]('scroll'))
    expect(result.current[0]).toBe('scroll')
    expect(localStorage.getItem('reader:mode')).toBe('scroll')
  })
})
