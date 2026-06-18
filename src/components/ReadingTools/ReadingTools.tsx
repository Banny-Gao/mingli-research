// src/components/ReadingTools/ReadingTools.tsx
import { useState, useEffect, useRef, type CSSProperties, type RefObject } from 'react'
import { ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import gsap from 'gsap'
import { extractTOC } from './extractTOC'
import './ReadingTools.less'

const BACK_TO_TOP_THRESHOLD = 300
const SCROLL_SPY_OFFSET = 80
const SCROLL_OFFSET = 16

// ─── ReadingProgress (GSAP 平滑进度条) ───

export const ReadingProgress = ({
  scrollRef,
  readerMode,
}: {
  scrollRef: RefObject<HTMLDivElement | null>
  readerMode?: string
}) => {
  const barRef = useRef<HTMLDivElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    if (readerMode && readerMode !== 'scroll') {
      gsap.to(barRef.current, { '--progress-w': '0%', duration: 0.2 })
      return
    }
    const el = scrollRef.current
    if (!el) return
    const handler = () => {
      const pct = Math.min((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100, 100)
      if (tweenRef.current) tweenRef.current.kill()
      tweenRef.current = gsap.to(barRef.current, {
        '--progress-w': `${pct}%`,
        duration: 0.25,
        ease: 'power1.out',
        overwrite: 'auto',
      })
    }
    el.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => {
      el.removeEventListener('scroll', handler)
      tweenRef.current?.kill()
    }
  }, [scrollRef, readerMode])

  return (
    <div
      ref={barRef}
      className="reading-progress"
      style={{ '--progress-w': '0%' } as CSSProperties}
    />
  )
}

// ─── BackToTop (GSAP 平滑滚动) ───

export const BackToTop = ({
  scrollRef,
  readerMode,
}: {
  scrollRef: RefObject<HTMLDivElement | null>
  readerMode?: string
}) => {
  const [visible, setVisible] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (readerMode && readerMode !== 'scroll') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false)
      return
    }
    const el = scrollRef.current
    if (!el) return
    const handler = () => setVisible(el.scrollTop > BACK_TO_TOP_THRESHOLD)
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [scrollRef, readerMode])

  // 淡入淡出
  useEffect(() => {
    if (!btnRef.current) return
    if (visible) {
      gsap.fromTo(
        btnRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' }
      )
    }
  }, [visible])

  if (!visible) return null

  return (
    <Button
      ref={btnRef}
      variant="ghost"
      size="icon"
      onClick={() => {
        const el = scrollRef.current
        if (!el) return
        gsap.to(el, { scrollTop: 0, duration: 0.5, ease: 'power2.inOut' })
      }}
      className="back-to-top"
      aria-label="回到顶部"
    >
      <ChevronUp size={18} />
    </Button>
  )
}

// ─── extractTOC ───（已抽到 ./extractTOC）

// ─── TocSidebar ───

interface TocSidebarProps {
  html?: string
  scrollRef: React.RefObject<HTMLDivElement | null>
  open: boolean
  onItemClick?: () => void
  readerMode?: string
  /** paginated 模式下提供：把 heading id 翻成 page 索引（找不到返回 -1） */
  getPageOfHeadingId?: (id: string) => number
  /** paginated 模式下提供：跳转到指定 page */
  goToPage?: (idx: number) => void
}

export const TocSidebar = ({ html, scrollRef, open, onItemClick, readerMode, getPageOfHeadingId, goToPage }: TocSidebarProps) => {
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([])
  const [activeId, setActiveId] = useState('')

  const isPaginated = readerMode === 'smooth' || readerMode === 'flip'

  // Extract headings
  useEffect(() => {
    if (isPaginated && html) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToc(extractTOC(html))
      return
    }
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
  }, [scrollRef, html, isPaginated])

  // Scroll spy（仅滚动模式）
  useEffect(() => {
    if (isPaginated) return
    const el = scrollRef.current
    if (!el || toc.length === 0) return
    const handler = () => {
      let current = ''
      for (const item of toc) {
        const target = el.querySelector(`[id="${CSS.escape(item.id)}"]`) as HTMLElement | null
        if (
          target &&
          target.getBoundingClientRect().top - el.getBoundingClientRect().top < SCROLL_SPY_OFFSET
        ) {
          current = item.id
        }
      }
      setActiveId(current)
    }
    el.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => el.removeEventListener('scroll', handler)
  }, [scrollRef, toc, isPaginated])

  const scrollTo = (id: string) => {
    if (isPaginated) {
      // paginated 模式：先翻到目标 page，再滚动到 heading 位置
      if (getPageOfHeadingId && goToPage) {
        const pageIdx = getPageOfHeadingId(id)
        if (pageIdx >= 0) {
          goToPage(pageIdx)
          // 翻页动画完成后滚动到 heading（smooth: 滚 smooth-page 内部；flip: 等翻完）
          // 这里用一帧延迟 + measure DOM 中目标 heading 节点
          requestAnimationFrame(() => {
            const measureRoot = scrollRef.current?.querySelector('.measure-dom') as HTMLElement | null
            const target = measureRoot?.querySelector(`[id="${CSS.escape(id)}"]`) as HTMLElement | null
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          })
        }
      }
      onItemClick?.()
      return
    }
    const el = scrollRef.current
    if (!el) return
    const target = el.querySelector(`[id="${CSS.escape(id)}"]`) as HTMLElement | null
    if (target) {
      const containerRect = el.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const to = el.scrollTop + targetRect.top - containerRect.top - SCROLL_OFFSET
      gsap.to(el, { scrollTop: to, duration: 0.4, ease: 'power2.out' })
    }
    onItemClick?.()
  }

  if (toc.length === 0) return null

  return (
    <div className={`toc-sidebar ${open ? 'open' : ''}`}>
      <div className="toc-header">目录</div>
      <div className="toc-list">
        {toc.map(item => (
          <Button
            key={item.id}
            variant="ghost"
            onClick={() => scrollTo(item.id)}
            className={`toc-item ${item.level === 3 ? 'toc-sub' : ''} ${activeId === item.id ? 'active' : ''}`.trim()}
          >
            {item.text}
          </Button>
        ))}
      </div>
    </div>
  )
}
