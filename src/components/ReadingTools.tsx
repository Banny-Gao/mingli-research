import React, { useRef, useState, useEffect } from 'react'

interface Props {
  scrollRef: React.RefObject<HTMLDivElement | null>
}

export const ReadingProgress: React.FC<Props> = ({ scrollRef }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => {
      const max = el.scrollHeight - el.clientHeight
      setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0)
    }
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [scrollRef])

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'var(--color-border-card)',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--color-purple), var(--color-gold))',
          transition: 'width 0.1s',
          borderRadius: '0 1px 1px 0',
        }}
      />
    </div>
  )
}

export const BackToTop: React.FC<{ scrollRef: React.RefObject<HTMLDivElement | null> }> = ({
  scrollRef,
}) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => setVisible(el.scrollTop > 300)
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [scrollRef])

  if (!visible) return null

  return (
    <button
      onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'var(--color-purple-bg)',
        border: '1px solid var(--color-gold)',
        color: 'var(--color-gold)',
        fontSize: 18,
        cursor: 'pointer',
        zIndex: 100,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      ↑
    </button>
  )
}

export function extractTOC(html: string): { id: string; text: string; level: number }[] {
  const toc: { id: string; text: string; level: number }[] = []
  const regex = /<h([23])[^>]*>([^<]+)<\/h[23]>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1])
    const text = match[2].trim()
    const id = text.replace(/[^a-zA-Z0-9一-龥]/g, '-').toLowerCase()
    toc.push({ id, text, level })
  }
  return toc
}

export const TableOfContents: React.FC<{
  html: string
  scrollRef: React.RefObject<HTMLDivElement | null>
}> = ({ html, scrollRef }) => {
  const [open, setOpen] = useState(false)
  const toc = extractTOC(html)

  if (toc.length === 0) return null

  const scrollTo = (id: string) => {
    const el = scrollRef.current
    if (!el) return
    const target = el.querySelector(`[id="${id}"]`) as HTMLElement | null
    if (target) {
      const top = target.offsetTop - 16
      el.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className="toc-container">
      <div className="toc-header">
        <span className="toc-label">目录</span>
        <button className="toc-toggle-btn" onClick={() => setOpen(!open)}>
          {open ? '− 收起' : '+ 展开'}
        </button>
      </div>
      {open && (
        <div className="toc-list">
          {toc.map(item => (
            <button
              key={item.id}
              className="toc-item"
              onClick={() => scrollTo(item.id)}
            >
              {item.text}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
