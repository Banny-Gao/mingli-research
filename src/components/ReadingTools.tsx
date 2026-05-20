import React, { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

interface Props {
  scrollRef: React.RefObject<HTMLDivElement | null>
}

export const ReadingProgress: React.FC<Props> = ({ scrollRef }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => {
      const pct = el.scrollTop / (el.scrollHeight - el.clientHeight)
      setProgress(Math.min(pct * 100, 100))
    }
    el.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => el.removeEventListener('scroll', handler)
  }, [scrollRef])

  if (progress <= 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 2,
        background: 'linear-gradient(90deg, #7a4faa, #f0c060)',
        width: `${progress}%`,
        transition: 'width 0.1s',
        zIndex: 10,
      }}
    />
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
      className="back-to-top"
      aria-label="回到顶部"
    >
      <ChevronUp size={18} />
    </button>
  )
}

function mdId(text: string): string {
  return text
    .replace(/[^\w一-鿿\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
}

export function extractTOC(text: string): { id: string; text: string; level: number }[] {
  const toc: { id: string; text: string; level: number }[] = []

  // Try HTML format: <h2 id="...">...</h2>
  const htmlRegex = /<h([23])[^>]+id="([^"]+)"[^>]*>([^<]+)<\/h[23]>/gi
  let match
  while ((match = htmlRegex.exec(text)) !== null) {
    toc.push({ id: match[2], text: match[3].trim(), level: parseInt(match[1]) })
  }
  if (toc.length > 0) return toc

  // Fallback: parse markdown headings (## / ### lines)
  for (const line of text.split('\n')) {
    const m = line.match(/^(#{2,3})\s+(.+)$/)
    if (m) {
      const level = m[1].length
      const headingText = m[2].trim()
      toc.push({ id: mdId(headingText), text: headingText, level })
    }
  }
  return toc
}

interface TocSidebarProps {
  html?: string
  scrollRef: React.RefObject<HTMLDivElement | null>
  open: boolean
  onItemClick?: () => void
}

export const TocSidebar: React.FC<TocSidebarProps> = ({ html, scrollRef, open, onItemClick }) => {
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([])
  const [activeId, setActiveId] = useState('')

  // Extract headings from rendered DOM (triggered by html change when content loads)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const headings = el.querySelectorAll('h2, h3')
    const items: { id: string; text: string; level: number }[] = []
    headings.forEach(h => {
      if (!h.id) return
      items.push({
        id: h.id,
        text: (h.textContent || '').replace(/¶$/, '').trim(),
        level: parseInt(h.tagName[1]),
      })
    })
    setToc(items)
  }, [scrollRef, html])

  // Scroll spy
  useEffect(() => {
    const el = scrollRef.current
    if (!el || toc.length === 0) return
    const handler = () => {
      let current = ''
      for (const item of toc) {
        const target = el.querySelector(`[id="${CSS.escape(item.id)}"]`) as HTMLElement | null
        if (target && target.getBoundingClientRect().top - el.getBoundingClientRect().top < 80) {
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
      const containerRect = el.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      el.scrollBy({ top: targetRect.top - containerRect.top - 16, behavior: 'smooth' })
    }
    onItemClick?.()
  }

  if (toc.length === 0) return null

  return (
    <div className={`toc-sidebar ${open ? 'open' : ''}`}>
      <div className="toc-header">目录</div>
      <div className="toc-list">
        {toc.map(item => (
          <button
            key={item.id}
            className={`toc-item ${item.level === 3 ? 'toc-sub' : ''} ${activeId === item.id ? 'active' : ''}`}
            onClick={() => scrollTo(item.id)}
          >
            {item.text}
          </button>
        ))}
      </div>
    </div>
  )
}
