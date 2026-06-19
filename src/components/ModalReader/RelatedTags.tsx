// src/components/ModalReader/RelatedTags.tsx
import { Button } from '@/components/ui/button'
import { CLASS } from './reader-mode/constants'

interface RelatedTagsProps {
  /** 可点击的项值数组 */
  data: string[]
  /** 标签文本（可选；不传则不渲染 <span>） */
  label?: string
  /** 用于 className 后缀：传字符串则所有按钮共享同一 type-key；传函数则按 item 动态决定 */
  itemKey?: string | ((item: string) => string)
  /** 显示名映射（可选） */
  displayName?: Record<string, string> | null
  /** 点击回调，参数为 item value */
  onItemClick: (item: string) => void
  /** 按钮尺寸（默认 "xs"） */
  size?: 'xs' | 'sm' | 'default'
}

/**
 * 关联标签组：渲染一组可点击按钮 + 可选 label。
 *
 * 用于 ModalReader 底部的"同一篇章内的跨内容导航"和"关联技能 / 相关篇目"。
 * 抽到独立组件以：(1) 消除 ModalReader 内的重复 JSX；(2) 提升可测性。
 */
export function RelatedTags({
  data,
  label,
  itemKey,
  displayName,
  onItemClick,
  size = 'xs',
}: RelatedTagsProps) {
  if (data.length === 0) return null
  const resolveItemKey = (item: string) => (typeof itemKey === 'function' ? itemKey(item) : itemKey)
  return (
    <div className="related-tags">
      {label && <span className="related-label">{label}</span>}
      {data.map(item => {
        const key = resolveItemKey(item)
        return (
          <Button
            key={item}
            variant="ghost"
            size={size}
            className={key ? CLASS.relatedTag(key) : 'related-tag'}
            onClick={() => onItemClick(item)}
          >
            {displayName?.[item] || item}
          </Button>
        )
      })}
    </div>
  )
}
