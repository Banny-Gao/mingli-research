import { useState } from 'react'
import { Star, Bookmark, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface ActionBarProps {
  modalType: 'interp' | 'source'
  modalKey: string
  isBookmarked: (key: string) => boolean
  toggleBookmark: (key: string, type?: string) => void
  annotationsCount: number
  onTogglePanel: () => void
}

const ActionBar = ({
  modalType,
  modalKey,
  isBookmarked,
  toggleBookmark,
  annotationsCount,
  onTogglePanel,
}: ActionBarProps) => {
  const [actionPopoverOpen, setActionPopoverOpen] = useState(false)

  return (
    <>
      {modalKey && (modalType === 'interp' || modalType === 'source') && (
        <DropdownMenu open={actionPopoverOpen} onOpenChange={setActionPopoverOpen}>
          <DropdownMenuTrigger>
            <span className="inline-flex items-center justify-center border border-[var(--color-border)] rounded-md px-2 py-1.5 cursor-pointer text-[var(--color-text-dim)] hover:text-[var(--color-gold)]">
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
    </>
  )
}

export default ActionBar
