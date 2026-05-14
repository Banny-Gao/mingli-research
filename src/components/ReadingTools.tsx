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
  const [open, setOpen] = useState(true)
  const toc = extractTOC(html)

  if (toc.length === 0) return null

  const scrollTo = (id: string) => {
    const el = scrollRef.current
    if (!el) return
    const target = el.querySelector(`[id="${id}"], h2, h3`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 80,
        right: 16,
        width: 180,
        zIndex: 40,
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-hover)',
        borderRadius: 8,
        padding: 12,
        maxHeight: 'calc(100vh - 160px)',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--color-text-dim)', letterSpacing: 1 }}>目录</span>
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-dim)',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          {open ? '−' : '+'}
        </button>
      </div>
      {open &&
        toc.map(item => (
          <div
            key={item.id}
            onClick={() => scrollTo(item.id)}
            style={{
              fontSize: 12,
              color: 'var(--color-text-dim)',
              padding: '3px 0',
              paddingLeft: item.level === 3 ? 12 : 0,
              cursor: 'pointer',
              transition: 'color 0.2s',
              borderLeft: '2px solid transparent',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--color-gold)')}
            onMouseLeave={e =>
              ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-dim)')
            }
          >
            {item.text}
          </div>
        ))}
    </div>
  )
}
