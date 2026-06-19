// src/components/ModalReader/__tests__/modalType.test.ts
import { describe, it, expect } from 'vitest'
import {
  MODAL_TYPES,
  type ModalType,
  MODAL_TYPE_CAPS,
  isModalType,
  MODAL_TYPE_LABEL,
  resolveCanonicalChapterName,
} from '../modalType'

describe('MODAL_TYPES / ModalType', () => {
  it('MODAL_TYPES 为不可变元组', () => {
    expect(MODAL_TYPES).toEqual(['interp', 'skill', 'source'])
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
    expect(isModalType('skill')).toBe(true)
    expect(isModalType('source')).toBe(true)
  })

  it('非法值 → false', () => {
    expect(isModalType('pdf')).toBe(false)
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

  it('skill 不支持标注 + 不翻页 + 无 proseClass', () => {
    const caps = MODAL_TYPE_CAPS.skill
    expect(caps.allowsAnnotation).toBe(false)
    expect(caps.supportsPagination).toBe(false)
    expect(caps.proseClass).toBe('')
  })
})

describe('MODAL_TYPE_LABEL', () => {
  it('每个类型都有中英文标签', () => {
    expect(MODAL_TYPE_LABEL.interp).toBe('解读')
    expect(MODAL_TYPE_LABEL.skill).toBe('技能')
    expect(MODAL_TYPE_LABEL.source).toBe('原文')
  })
})

describe('resolveCanonicalChapterName', () => {
  const skillToChapters: Record<string, string[]> = {
    技能A: ['篇章1', '篇章2'],
    技能B: ['篇章3'],
  }

  it('interp 模式：直接返回 modalKey（无映射）', () => {
    expect(resolveCanonicalChapterName('interp', '任意篇', skillToChapters)).toBe('任意篇')
  })

  it('source 模式：直接返回 modalKey（无映射）', () => {
    expect(resolveCanonicalChapterName('source', '原文篇', skillToChapters)).toBe('原文篇')
  })

  it('skill 模式：返回 skillToChapters 映射的第一个', () => {
    expect(resolveCanonicalChapterName('skill', '技能A', skillToChapters)).toBe('篇章1')
    expect(resolveCanonicalChapterName('skill', '技能B', skillToChapters)).toBe('篇章3')
  })

  it('skill 模式：未在映射中 → fallback 到 modalKey', () => {
    expect(resolveCanonicalChapterName('skill', '未映射技能', skillToChapters)).toBe('未映射技能')
  })

  it('skill 模式：skillToChapters 为空 Record → fallback', () => {
    expect(resolveCanonicalChapterName('skill', '技能X', {})).toBe('技能X')
  })
})
