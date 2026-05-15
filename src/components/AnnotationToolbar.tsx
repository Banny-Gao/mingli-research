import React, { useEffect, useRef, useState } from 'react'
import type { AnnotationType } from '../hooks/useAnnotations'

interface Props {
  position: { x: number; y: number }
  onSelect: (type: AnnotationType) => void
  onClose: () => void
}

const Toolbar: React.FC<Props> = ({ position, onSelect, onClose }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const btn = (type: AnnotationType, label: string, color: string) => (
    <button
      className="ann-toolbar-btn"
      style={{ background: color + '22', borderColor: color + '55', color }}
      onClick={() => onSelect(type)}
    >
      {label}
    </button>
  )

  return (
    <div
      ref={ref}
      className="ann-toolbar"
      style={{ left: position.x, top: position.y }}
    >
      {btn('emphasis', '重点', '#f0c060')}
      {btn('question', '疑问', '#d05050')}
      {btn('quote', '引用', '#60c060')}
      <button className="ann-toolbar-btn ann-toolbar-close" onClick={onClose}>×</button>
    </div>
  )
}

export default Toolbar