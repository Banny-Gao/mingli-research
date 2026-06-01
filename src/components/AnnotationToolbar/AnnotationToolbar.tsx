import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Copy, Highlighter, FileQuestion, Quote } from 'lucide-react'
import type { AnnotationType } from '../../hooks/useAnnotations'
import { Button } from '@/components/ui/button'
import './AnnotationToolbar.less'

interface Props {
  position: { x: number; y: number }
  selectedText?: string
  onSelect: (type: AnnotationType) => void
  onClose: () => void
}

const MOBILE_BREAKPOINT = 640
const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT

const ANN_TYPE_CONFIG = [
  { type: 'emphasis' as const, Icon: Highlighter, label: '重点', className: 'ann-emphasis' },
  { type: 'question' as const, Icon: FileQuestion, label: '疑问', className: 'ann-question' },
  { type: 'quote' as const, Icon: Quote, label: '引用', className: 'ann-quote' },
]

const Toolbar = ({ position, selectedText, onSelect, onClose }: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const [mobile, setMobile] = useState(isMobile())

  useEffect(() => {
    const update = () => setMobile(isMobile())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Desktop: clamp floating toolbar to viewport
  useEffect(() => {
    if (mobile) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.right > window.innerWidth) {
      el.style.left = `${window.innerWidth - rect.width - 8}px`
    }
    if (rect.top < 8) {
      el.style.top = `${position.y + 20}px`
    } else {
      el.style.top = `${position.y}px`
    }
    el.style.left = `${position.x}px`
  }, [position.x, position.y, mobile])

  // Desktop: close on outside click
  useEffect(() => {
    if (mobile) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose, mobile])

  const handleCopy = useCallback(async () => {
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText)
      } catch {
        /* ignore clipboard errors */
      }
    }
    onClose()
  }, [selectedText, onClose])

  if (mobile) {
    return (
      <div className="ann-toolbar-mobile" onTouchStart={e => e.preventDefault()}>
        <span className="ann-toolbar-mobile-label">标记为</span>
        {ANN_TYPE_CONFIG.map(({ type, Icon, label, className }) => (
          <Button key={type} variant="ghost" size="sm" className={`ann-toolbar-btn ${className}`} onClick={() => onSelect(type)}>
            <Icon size={14} />
            <span>{label}</span>
          </Button>
        ))}
        {selectedText && (
          <Button variant="ghost" size="sm" className="ann-toolbar-btn ann-toolbar-copy" onClick={handleCopy} title="复制">
            <Copy size={14} />
          </Button>
        )}
        <Button variant="ghost" size="sm" className="ann-toolbar-btn ann-toolbar-close" onClick={onClose}>
          <X size={14} />
        </Button>
      </div>
    )
  }

  return (
    <div ref={ref} className="ann-toolbar">
      {ANN_TYPE_CONFIG.map(({ type, label, className }) => (
        <Button key={type} variant="ghost" size="sm" className={`ann-toolbar-btn ${className}`} onClick={() => onSelect(type)}>
          {label}
        </Button>
      ))}
      {selectedText && (
        <Button variant="ghost" size="sm" className="ann-toolbar-btn ann-toolbar-copy" onClick={handleCopy} title="复制">
          <Copy size={14} />
        </Button>
      )}
      <Button variant="ghost" size="sm" className="ann-toolbar-btn ann-toolbar-close" onClick={onClose}>
        <X size={14} />
      </Button>
    </div>
  )
}

export default Toolbar
