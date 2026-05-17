import React, { useState } from 'react'
import { Star, Bookmark, MoreHorizontal, Copy } from 'lucide-react'

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
              <button
                className="action-popover-item"
                onClick={() => { onTogglePanel(); setActionPopoverOpen(false) }}
              >
                <Bookmark size={14} />
                批注{annotationsCount > 0 ? ` (${annotationsCount})` : ''}
              </button>
              <button
                className="action-popover-item"
                onClick={() => { toggleBookmark(modalKey); setActionPopoverOpen(false) }}
              >
                <Star size={14} fill={isBookmarked(modalKey) ? 'var(--color-gold)' : 'none'} />
                {isBookmarked(modalKey) ? '已收藏' : '收藏'}
              </button>
            </div>
          )}
        </div>
      )}
      {modalType === 'skill' && modalKey && (
        <button
          onClick={handleCopy}
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            padding: '6px 10px',
            cursor: 'pointer',
            color: copied ? 'var(--color-green)' : 'var(--color-text-dim)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 13,
            transition: 'all 0.2s',
          }}
        >
          <Copy size={14} />{copied ? '已复制' : '复制'}
        </button>
      )}
    </>
  )
}

export default ActionBar
