import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { AnnotationType } from '../hooks/useAnnotations'

interface Props {
  position: { x: number; y: number }
  onSelect: (type: AnnotationType) => void
  onClose: () => void
}

const Toolbar: React.FC<Props> = ({ position, onSelect, onClose }) => {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Clamp toolbar to viewport
    const el = ref.current
    if (el) {
      const rect = el.getBoundingClientRect()
      if (rect.right > window.innerWidth) {
        el.style.left = `${window.innerWidth - rect.width - 8}px`
      }
      if (rect.top < 8) {
        el.style.top = `${position.y + 20}px`
      }
    }
  }, [position])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="ann-toolbar"
      style={{ left: position.x, top: position.y }}
    >
      <button className="ann-toolbar-btn ann-emphasis" onClick={() => onSelect('emphasis')}>{t('annotations.emphasis')}</button>
      <button className="ann-toolbar-btn ann-question" onClick={() => onSelect('question')}>{t('annotations.question')}</button>
      <button className="ann-toolbar-btn ann-quote" onClick={() => onSelect('quote')}>{t('annotations.quote')}</button>
      <button className="ann-toolbar-btn ann-toolbar-close" onClick={onClose}>×</button>
    </div>
  )
}

export default Toolbar