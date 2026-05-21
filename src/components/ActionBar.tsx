import React, { useState } from 'react'
import { Star, Bookmark, MoreHorizontal, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface ActionBarProps {
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  isBookmarked: (key: string) => boolean
  toggleBookmark: (key: string, type?: string) => void
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
        <DropdownMenu open={actionPopoverOpen} onOpenChange={setActionPopoverOpen}>
          <DropdownMenuTrigger>
            <span className="inline-flex items-center justify-center border border-[var(--color-border)] rounded-md px-2 py-1.5 cursor-pointer text-[var(--color-text-dim)] hover:text-[var(--color-gold)]"
            >
              <MoreHorizontal size={16} />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={[
              'z-[10001]',
              'bg-[var(--color-bg-card)]',
              'border border-[var(--color-border)]',
              'shadow-lg',
            ].join(' ')}
          >
            <DropdownMenuItem
              onClick={() => {
                onTogglePanel()
                setActionPopoverOpen(false)
              }}
            >
              <Bookmark size={14} />
              批注{annotationsCount > 0 ? ` (${annotationsCount})` : ''}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                toggleBookmark(modalKey, modalType)
                setActionPopoverOpen(false)
              }}
            >
              <Star size={14} fill={isBookmarked(modalKey) ? 'var(--color-gold)' : 'none'} />
              {isBookmarked(modalKey) ? '已收藏' : '收藏'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {modalType === 'skill' && modalKey && (
        <Button
          onClick={handleCopy}
          style={{ color: copied ? 'var(--color-green)' : 'var(--color-text-dim)' }}
        >
          <Copy size={14} />
          {copied ? '已复制' : '复制'}
        </Button>
      )}
    </>
  )
}

export default ActionBar
