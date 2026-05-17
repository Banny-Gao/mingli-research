import React, { useState } from 'react'
import { Star, Bookmark, MoreHorizontal, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ActionBarProps {
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  isBookmarked: (key: string) => boolean
  toggleBookmark: (key: string) => void
  annotationsCount: number
  onTogglePanel: () => void
  skillRawContent: Record<string, any>
}

const ActionBar: React.FC<ActionBarProps> = ({
  modalType,
  modalKey,
  isBookmarked,
  toggleBookmark,
  annotationsCount,
  onTogglePanel,
  skillRawContent,
}) => {
  const [actionPopoverOpen, setActionPopoverOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (modalType !== 'skill') return
    const raw = (skillRawContent as Record<string, () => Promise<string>>)[modalKey]
    if (!raw) return
    const text = await raw()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {modalKey && (modalType === 'interp' || modalType === 'source') && (
        <div className="action-popover-container">
          <button className="action-popover-btn" onClick={() => setActionPopoverOpen(v => !v)}>
            <MoreHorizontal size={16} />
          </button>
          {actionPopoverOpen && (
            <div className="action-popover">
              <Button variant="ghost" size="sm" onClick={() => { onTogglePanel(); setActionPopoverOpen(false) }}>
                <Bookmark size={14} />
                批注{annotationsCount > 0 ? ` (${annotationsCount})` : ''}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { toggleBookmark(modalKey); setActionPopoverOpen(false) }}>
                <Star size={14} fill={isBookmarked(modalKey) ? 'var(--color-gold)' : 'none'} />
                {isBookmarked(modalKey) ? '已收藏' : '收藏'}
              </Button>
            </div>
          )}
        </div>
      )}
      {modalType === 'skill' && modalKey && (
        <Button
          onClick={handleCopy}
          style={{ color: copied ? 'var(--color-green)' : 'var(--color-text-dim)' }}
        >
          <Copy size={14} />{copied ? '已复制' : '复制'}
        </Button>
      )}
    </>
  )
}

export default ActionBar
