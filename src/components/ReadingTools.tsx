import React, { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

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
        flexShrink: 0,
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
        bottom: 10,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'var(--color-purple-bg)',
        border: '1px solid var(--color-gold)',
        color: 'var(--color-gold)',
        cursor: 'pointer',
        zIndex: 100,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ArrowUp size={18} />
    </button>
  )
}

export function extractTOC(html: string): { id: string; text: string; level: number }[] {
  const toc: { id: string; text: string; level: number }[] = []
  const regex = /<h([23])[^>]+id="([^"]+)"[^>]*>([^<]+)<\/h[23]>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1])
    const id = match[2]
    const text = match[3].trim()
    toc.push({ id, text, level })
  }
  return toc
}

interface TocSidebarProps {
  html: string
  scrollRef: React.RefObject<HTMLDivElement | null>
  open: boolean
}

export const TocSidebar: React.FC<TocSidebarProps> = ({ html, scrollRef, open }) => {
  const toc = extractTOC(html)
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const el = scrollRef.current
    if (!el || toc.length === 0) return
    const handler = () => {
      let current = ''
      for (const item of toc) {
        const target = el.querySelector(`[id="${CSS.escape(item.id)}"]`) as HTMLElement | null
        if (target && target.offsetTop - el.scrollTop < 100) {
          current = item.id
        }
      }
      setActiveId(current)
    }
    el.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => el.removeEventListener('scroll', handler)
  }, [scrollRef, toc])

  const scrollTo = (id: string) => {
    const el = scrollRef.current
    if (!el) return
    const target = el.querySelector(`[id="${CSS.escape(id)}"]`) as HTMLElement | null
    if (target) {
      const top = target.offsetTop - 16
      el.scrollTo({ top, behavior: 'smooth' })
    }
  }

  if (toc.length === 0) return null

  return (
    <div className={`toc-sidebar ${open ? 'toc-sidebar-open' : 'toc-sidebar-closed'}`}>
      <div className="toc-sidebar-header">目录</div>
      <div className="toc-sidebar-list">
        {toc.map(item => (
          <button
            key={item.id}
            className={`toc-sidebar-item ${item.level === 2 ? 'toc-l2' : 'toc-l3'} ${activeId === item.id ? 'toc-active' : ''}`}
            onClick={() => scrollTo(item.id)}
          >
            {item.text}
          </button>
        ))}
      </div>
    </div>
  )
}
