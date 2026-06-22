// src/components/ModalReader/__tests__/modalType.test.ts
import { describe, it, expect } from 'vitest'
import {
  MODAL_TYPES,
  type ModalType,
  MODAL_TYPE_CAPS,
  isModalType,
  MODAL_TYPE_LABEL,
} from '../modalType'

describe('MODAL_TYPES / ModalType', () => {
  it('MODAL_TYPES 为不可变元组', () => {
    expect(MODAL_TYPES).toEqual(['interp', 'source'])
  })

  it('ModalType 派生 = MODAL_TYPES 元素联合', () => {
    const sample: ModalType = 'interp'
    expect(sample).toBe('interp')
    // 类型层面已由 ModalType 联合保护；下面这行如果取消注释 tsc 会报错（验证编译期约束）
    // const invalid: ModalType = 'pdf'
  })
})

describe('isModalType', () => {
  it('合法值 → true', () => {
    expect(isModalType('interp')).toBe(true)
    expect(isModalType('source')).toBe(true)
  })

  it('非法值 → false', () => {
    expect(isModalType('pdf')).toBe(false)
    expect(isModalType('skill')).toBe(false)
    expect(isModalType('')).toBe(false)
    expect(isModalType(null)).toBe(false)
    expect(isModalType(undefined)).toBe(false)
    expect(isModalType(123)).toBe(false)
  })
})

describe('MODAL_TYPE_CAPS', () => {
  it('interp / source 支持标注 + 翻页 + 有 proseClass', () => {
    for (const t of ['interp', 'source'] as const) {
      const caps = MODAL_TYPE_CAPS[t]
      expect(caps.allowsAnnotation).toBe(true)
      expect(caps.supportsPagination).toBe(true)
      expect(caps.proseClass).toBe('prose-interp')
    }
  })
})

describe('MODAL_TYPE_LABEL', () => {
  it('每个类型都有中英文标签', () => {
    expect(MODAL_TYPE_LABEL.interp).toBe('解读')
    expect(MODAL_TYPE_LABEL.source).toBe('原文')
  })
})
