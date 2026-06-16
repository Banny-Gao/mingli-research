import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveScroll, loadScroll,
  savePage, loadPage,
  scrollKey, pageKey,
} from '../persistence'

describe('persistence', () => {
  beforeEach(() => sessionStorage.clear())

  it('scrollKey 拼接规则', () => {
    expect(scrollKey('b1', 'interp', 'k1')).toBe('scroll:b1:interp:k1')
  })

  it('pageKey 拼接规则', () => {
    expect(pageKey('b1', 'source', 'k2')).toBe('page:b1:source:k2')
  })

  it('saveScroll / loadScroll 读写', () => {
    saveScroll('b1', 'interp', 'k1', 1234)
    expect(loadScroll('b1', 'interp', 'k1')).toBe(1234)
  })

  it('loadScroll 未存返回 0', () => {
    expect(loadScroll('b1', 'interp', 'k1')).toBe(0)
  })

  it('savePage / loadPage 读写', () => {
    savePage('b1', 'interp', 'k1', 5)
    expect(loadPage('b1', 'interp', 'k1')).toBe(5)
  })

  it('sessionStorage 不可用时静默', () => {
    const original = window.sessionStorage
    const broken: Storage = {
      length: 0,
      clear() {},
      getItem() { return null },
      key() { return null },
      removeItem() {},
      setItem() { throw new Error('SecurityError') },
    }
    Object.defineProperty(window, 'sessionStorage', {
      value: broken,
      configurable: true,
      writable: true,
    })
    try {
      expect(() => saveScroll('b', 't', 'k', 1)).not.toThrow()
      expect(loadScroll('b', 't', 'k')).toBe(0)
    } finally {
      Object.defineProperty(window, 'sessionStorage', {
        value: original,
        configurable: true,
        writable: true,
      })
    }
  })
})
