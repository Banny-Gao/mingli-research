/**
 * scripts/lib/__tests__/generate-book-cover.test.js
 *
 * 覆盖 generate-book-cover.js 的纯函数：
 * - parseCatalogMd: 提取书名 / 作者
 * - resolveTexts: 模板占位符替换 + charCount 比例缩放 + 空 slot 跳过
 * - buildMetadata: metadata JSON 构建
 */

import { describe, it, expect } from 'vitest'
import { parseCatalogMd, resolveTexts, scaleTextsToCanvas, buildMetadata } from '../generate-book-cover/core.js'

// ===== parseCatalogMd =====

describe('parseCatalogMd', () => {
  it('extracts title and author from standard catalog.md', () => {
    const md = `# 《八字提要》

> 作者：[民国] 韦千里
> 版本：据问真八字网（iwzbz.com）整理本
> 简介：民国命学家韦千里所著子平八字提要...
> 术数：命
> 类别：八字
> 内容类型：source, interpretation, skill`

    const result = parseCatalogMd(md)
    expect(result.title).toBe('八字提要')
    expect(result.author).toBe('[民国] 韦千里')
  })

  it('handles multi-author format', () => {
    const md = `# 《滴天髓阐微》

> 作者：[明] 刘基 撰 / [清] 任铁樵 注
> 版本：据《四库全书》本`

    const result = parseCatalogMd(md)
    expect(result.title).toBe('滴天髓阐微')
    expect(result.author).toBe('[明] 刘基 撰 / [清] 任铁樵 注')
  })

  it('handles author with parenthetical note', () => {
    const md = `# 《子平真诠》

> 作者：[清] 沈孝瞻 撰（乾隆四年进士）/ [民国] 徐乐吾 评注`

    const result = parseCatalogMd(md)
    expect(result.title).toBe('子平真诠')
    expect(result.author).toBe('[清] 沈孝瞻 撰（乾隆四年进士）/ [民国] 徐乐吾 评注')
  })

  it('returns null title for malformed input', () => {
    expect(parseCatalogMd('').title).toBeNull()
    expect(parseCatalogMd('# No book title here').title).toBeNull()
    expect(parseCatalogMd('> 作者：someone').title).toBeNull()
  })

  it('returns empty author string when author line missing', () => {
    const md = `# 《无名书》

> 版本：某版本`

    const result = parseCatalogMd(md)
    expect(result.title).toBe('无名书')
    expect(result.author).toBe('')
  })
})

// ===== resolveTexts =====

describe('resolveTexts', () => {
  const template = [
    {
      content: '{{title}}',
      position: { x: 'center', y: 'center' },
      size: 88,
      charCount: 4,
      color: '#2C1810',
      fontHint: 'ShouJin',
      layout: 'vertical',
      verticalDirection: 'rtl',
      stroke: null,
      explicitColor: true,
    },
    {
      content: '{{author}}',
      position: { x: 'center', y: '80%' },
      size: 24,
      color: '#3D2B1F',
      fontHint: 'HYNanGong',
      layout: 'horizontal',
      verticalDirection: 'rtl',
      stroke: null,
      explicitColor: true,
    },
    {
      content: '{{subtitle}}',
      position: { x: 'center', y: '90%' },
      size: 18,
      color: '#3D2B1F',
      fontHint: 'KaiTi',
      layout: 'horizontal',
      stroke: null,
      explicitColor: true,
    },
  ]

  it('replaces {{title}} and {{author}} placeholders', () => {
    const result = resolveTexts(template, { title: '八字提要', author: '[民国] 韦千里', subtitle: '' })
    expect(result[0].content).toBe('八字提要')
    expect(result[1].content).toBe('[民国] 韦千里')
  })

  it('skips slots whose resolved content is empty', () => {
    const result = resolveTexts(template, { title: '八字提要', author: '[民国] 韦千里', subtitle: '' })
    // subtitle 为空，第三个 slot 应被过滤掉
    expect(result).toHaveLength(2)
    expect(result[0].content).toBe('八字提要')
    expect(result[1].content).toBe('[民国] 韦千里')
  })

  it('scales size proportionally for long titles (6 chars)', () => {
    const result = resolveTexts(template, { title: '紫微斗数全书', author: '[宋] 陈抟 撰', subtitle: '' })
    const titleSlot = result.find(t => t.content === '紫微斗数全书')
    // 6 字书名 → 88 × (4/6) ≈ 59
    expect(titleSlot.size).toBe(59)
  })

  it('scales size proportionally for short titles (3 chars)', () => {
    const result = resolveTexts(template, { title: '呱呱集', author: '[民国] 韦千里', subtitle: '' })
    const titleSlot = result.find(t => t.content === '呱呱集')
    // 3 字书名 → 88 × (4/3) ≈ 117
    expect(titleSlot.size).toBe(117)
  })

  it('uses original size when charCount not specified', () => {
    const noScaleTemplate = [
      {
        content: '{{title}}',
        position: { x: 'center', y: 'center' },
        size: 50,
        fontHint: 'SimHei',
        layout: 'horizontal',
        stroke: null,
        explicitColor: false,
      },
    ]
    const result = resolveTexts(noScaleTemplate, { title: '很长的书名测试' })
    expect(result[0].size).toBe(50)
  })

  it('keeps original size when actual charCount equals charCount', () => {
    const result = resolveTexts(template, { title: '八字提要', author: '[民国] 韦千里', subtitle: '' })
    const titleSlot = result[0]
    // 4 字书名 = charCount → 保持 88
    expect(titleSlot.size).toBe(88)
  })

  it('handles null/undefined title gracefully', () => {
    const result = resolveTexts(template, { title: null, author: undefined, subtitle: '' })
    // null/undefined → '' → empty slot filtered out → only subtitle slot left,
    // but subtitle is '' so that's filtered too → empty array
    expect(result).toHaveLength(0)
  })

  it('strips charCount from resolved text objects', () => {
    const result = resolveTexts(template, { title: '八字提要', author: '[民国] 韦千里', subtitle: '' })
    for (const t of result) {
      expect(t.charCount).toBeUndefined()
    }
  })
})

// ===== scaleTextsToCanvas =====

describe('scaleTextsToCanvas', () => {
  it('scales size proportionally when canvas is larger than refCanvas', () => {
    const texts = [{ content: '标题', size: 88 }, { content: '作者', size: 24 }]
    // refCanvas=864 → canvas=1792，scale≈2.074
    const result = scaleTextsToCanvas(texts, 864, 1792)
    expect(result[0].size).toBe(Math.round(88 * (1792 / 864))) // 183
    expect(result[1].size).toBe(Math.round(24 * (1792 / 864))) // 50
  })

  it('returns input unchanged when refCanvas equals canvas width', () => {
    const texts = [{ content: '标题', size: 88 }]
    expect(scaleTextsToCanvas(texts, 864, 864)).toBe(texts)
  })

  it('returns input unchanged when refCanvas is null', () => {
    const texts = [{ content: '标题', size: 88 }]
    expect(scaleTextsToCanvas(texts, null, 1792)).toBe(texts)
  })

  it('does not mutate input array', () => {
    const texts = [{ content: '标题', size: 88 }]
    const result = scaleTextsToCanvas(texts, 864, 1792)
    expect(texts[0].size).toBe(88) // 原数组未变
    expect(result).not.toBe(texts) // 返回新数组
    expect(result[0]).not.toBe(texts[0]) // 新对象
  })

  it('scales size down when canvas is smaller than refCanvas', () => {
    const texts = [{ content: '标题', size: 183 }]
    const result = scaleTextsToCanvas(texts, 1792, 864)
    expect(result[0].size).toBe(88)
  })
})

// ===== buildMetadata =====

describe('buildMetadata', () => {
  it('builds valid metadata JSON with all required fields', () => {
    const meta = buildMetadata({
      book: { title: '八字提要', author: '[民国] 韦千里' },
      texts: [
        { content: '八字提要', position: { x: 'center', y: 'center' }, size: 88, fontHint: 'ShouJin', layout: 'vertical', verticalDirection: 'rtl', color: '#2C1810', stroke: null, explicitColor: true },
        { content: '[民国] 韦千里', position: { x: 'center', y: '80%' }, size: 24, fontHint: 'HYNanGong', layout: 'horizontal', verticalDirection: 'rtl', color: '#3D2B1F', stroke: null, explicitColor: true },
      ],
      bgPath: '/abs/path/to/bg.png',
      filename: '八字提要.png',
      size: 12345,
    })

    expect(meta.type).toBe('t2i')
    expect(meta.name).toBe('八字提要')
    expect(meta.prompt).toBe('书籍名称：八字提要,作者信息：[民国] 韦千里')
    expect(meta.aspectRatio).toBe('3:4')
    expect(meta.model).toBe('image-01')
    expect(meta.backgroundPath).toBe('/abs/path/to/bg.png')
    expect(meta.results[0].filename).toBe('八字提要.png')
    expect(meta.results[0].reusedFrom).toBe('/abs/path/to/bg.png')
    expect(meta.textOverlay.texts).toHaveLength(2)
    expect(meta.textOverlay.texts[0].content).toBe('八字提要')
  })
})
