// src/utils/__tests__/trySilent.test.ts
import { describe, it, expect, vi } from 'vitest'
import { trySilent } from '../trySilent'

describe('trySilent', () => {
  it('fn 正常返回 → 返回 fn 的结果', () => {
    expect(trySilent(() => 42)).toBe(42)
  })

  it('fn 抛错 + 无 fallback → 返回 null', () => {
    expect(
      trySilent(() => {
        throw new Error('boom')
      })
    ).toBeNull()
  })

  it('fn 抛错 + fallback → 返回 fallback', () => {
    expect(
      trySilent(() => {
        throw new Error('boom')
      }, 'default')
    ).toBe('default')
    expect(
      trySilent(() => {
        throw new Error('boom')
      }, 0)
    ).toBe(0)
  })

  it('fn 返回 falsy 值（不抛错）→ 不被当作错误', () => {
    expect(trySilent(() => 0)).toBe(0)
    expect(trySilent(() => '')).toBe('')
    expect(trySilent(() => null)).toBeNull()
    expect(trySilent(() => undefined)).toBeUndefined()
    expect(trySilent(() => false)).toBe(false)
  })

  it('支持 promise 风格的同步 fn（不 catch async 异常）', () => {
    // 设计约束：仅同步 try/catch；async 错误由调用方 .catch() 处理
    expect(trySilent(() => Promise.resolve(1))).toBeInstanceOf(Promise)
  })

  it('支持副作用函数', () => {
    const sideEffect = vi.fn()
    trySilent(() => {
      sideEffect()
    })
    expect(sideEffect).toHaveBeenCalledTimes(1)
  })

  it('副作用 fn 抛错且 swallow 成功 → sideEffect 被调用过', () => {
    const sideEffect = vi.fn(() => {
      throw new Error('boom')
    })
    expect(() => trySilent(sideEffect)).not.toThrow()
    expect(sideEffect).toHaveBeenCalledTimes(1)
  })
})
