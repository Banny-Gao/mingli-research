import React, { useEffect, useRef, useState } from 'react'
import { X, Copy, Highlighter, FileQuestion, Quote } from 'lucide-react'
import type { AnnotationType } from '../../hooks/useAnnotations'
import './AnnotationToolbar.less'

interface Props {
  position: { x: number; y: number }
  selectedText?: string
  onSelect: (type: AnnotationType) => void
  onClose: () => void
}

const MOBILE_BREAKPOINT = 640
const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT

const Toolbar: React.FC<Props> = ({ position, selectedText, onSelect, onClose }) => {
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

  const handleCopy = async () => {
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText)
      } catch { /* ignore clipboard errors */ }
    }
    onClose()
  }

  if (mobile) {
    return (
      <div className="ann-toolbar-mobile" onTouchStart={e => e.preventDefault()}>
        <span className="ann-toolbar-mobile-label">标记为</span>
        <button className="ann-toolbar-btn ann-emphasis" onClick={() => onSelect('emphasis')}>
          <Highlighter size={14} />
          <span>重点</span>
        </button>
        <button className="ann-toolbar-btn ann-question" onClick={() => onSelect('question')}>
          <FileQuestion size={14} />
          <span>疑问</span>
        </button>
        <button className="ann-toolbar-btn ann-quote" onClick={() => onSelect('quote')}>
          <Quote size={14} />
          <span>引用</span>
        </button>
        {selectedText && (
          <button className="ann-toolbar-btn ann-toolbar-copy" onClick={handleCopy} title="复制">
            <Copy size={14} />
          </button>
        )}
        <button className="ann-toolbar-btn ann-toolbar-close" onClick={onClose}>
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div ref={ref} className="ann-toolbar">
      <button className="ann-toolbar-btn ann-emphasis" onClick={() => onSelect('emphasis')}>
        重点
      </button>
      <button className="ann-toolbar-btn ann-question" onClick={() => onSelect('question')}>
        疑问
      </button>
      <button className="ann-toolbar-btn ann-quote" onClick={() => onSelect('quote')}>
        引用
      </button>
      {selectedText && (
        <button className="ann-toolbar-btn ann-toolbar-copy" onClick={handleCopy} title="复制">
          <Copy size={14} />
        </button>
      )}
      <button className="ann-toolbar-btn ann-toolbar-close" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  )
}

export default Toolbar
