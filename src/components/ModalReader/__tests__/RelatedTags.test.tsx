// src/components/ModalReader/__tests__/RelatedTags.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { RelatedTags } from '../RelatedTags'

function getButtons(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('button'))
}

describe('RelatedTags', () => {
  it('空 data 不渲染（返回 null）', () => {
    const { container } = render(<RelatedTags data={[]} onItemClick={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('有 data：渲染每个 item 为可点击按钮', () => {
    const onItemClick = vi.fn()
    const { container } = render(<RelatedTags data={['a', 'b', 'c']} onItemClick={onItemClick} />)
    const buttons = getButtons(container)
    expect(buttons.map(b => b.textContent)).toEqual(['a', 'b', 'c'])
  })

  it('点击 → 调 onItemClick(value)', () => {
    const onItemClick = vi.fn()
    const { container } = render(<RelatedTags data={['x']} onItemClick={onItemClick} />)
    fireEvent.click(getButtons(container)[0])
    expect(onItemClick).toHaveBeenCalledWith('x')
  })

  it('displayName 存在时显示 displayName[item]（fallback 到原 item）', () => {
    const displayName = { 'skill-1': '技能一号' }
    const { container } = render(
      <RelatedTags
        data={['skill-1', 'unknown-key']}
        displayName={displayName}
        onItemClick={vi.fn()}
      />
    )
    const buttons = getButtons(container)
    expect(buttons.map(b => b.textContent)).toEqual(['技能一号', 'unknown-key'])
  })

  it('label 存在时显示在 <span.related-label>', () => {
    const { container } = render(
      <RelatedTags data={['a']} label="关联技能" onItemClick={vi.fn()} />
    )
    const span = container.querySelector('span.related-label')
    expect(span?.textContent).toBe('关联技能')
    expect(span?.tagName).toBe('SPAN')
  })

  it('无 label 时不渲染 <span>', () => {
    const { container } = render(<RelatedTags data={['a']} onItemClick={vi.fn()} />)
    expect(container.querySelector('span')).toBeNull()
  })

  it('itemKey 决定 className', () => {
    const { container } = render(
      <RelatedTags data={['x']} itemKey="interp" onItemClick={vi.fn()} />
    )
    const btn = container.querySelector('button')
    expect(btn?.className).toContain('related-tag-interp')
  })

  it('itemKey 为函数：按每个 item 决定 className', () => {
    const { container } = render(
      <RelatedTags data={['source', 'interp']} itemKey={item => item} onItemClick={vi.fn()} />
    )
    const buttons = container.querySelectorAll('button') as NodeListOf<HTMLButtonElement>
    expect(buttons[0].className).toContain('related-tag-source')
    expect(buttons[1].className).toContain('related-tag-interp')
  })

  it('无 itemKey 时 className 退化为 related-tag', () => {
    const { container } = render(<RelatedTags data={['x']} onItemClick={vi.fn()} />)
    const btn = container.querySelector('button')
    expect(btn?.className).toContain('related-tag')
    expect(btn?.className).not.toContain('related-tag-')
  })
})
