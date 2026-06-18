import { useState, useRef, useCallback, useEffect } from 'react'
import { X, PanelLeftClose, PanelLeft, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group'
import gsap from 'gsap'
import './ModalReader.less'
import { getBook } from '../../data/registry'
import { ReadingProgress, BackToTop, TocSidebar } from '../ReadingTools'
import AnnotationToolbar from '../AnnotationToolbar'
import AnnotationPanel from '../AnnotationPanel'
import ActionBar from '../ActionBar'
import { useBookmarks } from '../../hooks/useProgress'
import { useAnnotations } from '../../hooks/useAnnotations'
import type { AnnotationType, Annotation } from '../../hooks/useAnnotations'
import { injectAnnotations } from '../../utils/injectAnnotations'
import { useReaderMode } from '../../hooks/useReaderMode'
import { ReaderBody } from './reader-mode/ReaderBody'
import type { PaginatedReaderHandle } from './reader-mode/PaginatedReader'
import { ReaderSettingsDrawer } from './reader-mode/ReaderSettingsDrawer'
import { MOBILE_BREAKPOINT } from './reader-mode/constants'

interface ModalReaderProps {
  chapters: Array<{ name: string }>
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  scrollToText: string | null
  onClose: () => void
  onNavigate: (type: 'interp' | 'skill' | 'source', key: string) => void
  onScrollToTextConsumed: () => void
}

interface BookData {
  interpContent?: Record<string, () => Promise<string>>
  sourceContent?: Record<string, () => Promise<string>>
  skillRawContent?: Record<string, () => Promise<string>>
  skillDisplayNames?: Record<string, string>
  chapterToSkills?: Record<string, string[]>
  skillToChapters?: Record<string, string[]>
}

const SCROLL_OFFSET = 100
const ANNOTATION_SCROLL_OFFSET = 80
const AUTO_FADE_MS = 4000

const ModalReader = ({
  chapters,
  bookSlug,
  modalType,
  modalKey,
  scrollToText,
  onClose,
  onNavigate,
  onScrollToTextConsumed,
}: ModalReaderProps) => {
  const modalBodyRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [pendingSelection, setPendingSelection] = useState<{
    text: string
    start: number
    end: number
    matchIndex: number
  } | null>(null)
  const [tocOpen, setTocOpen] = useState(false)
  const [skillRawText, setSkillRawText] = useState('')
  const [loadedContent, setLoadedContent] = useState('')
  const [contentLoading, setContentLoading] = useState(false)

  // 阅读模式
  const [readerMode, setReaderMode] = useReaderMode()
  const [readerSettingsOpen, setReaderSettingsOpen] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const headerRef = useRef<HTMLDivElement>(null)
  const relatedRef = useRef<HTMLDivElement>(null)
  const paginatedReaderRef = useRef<PaginatedReaderHandle | null>(null)

  // GSAP 动画：header / related-section 缓动显隐。首次挂载不动画（默认已可见）
  const firstMountRef = useRef(true)
  useEffect(() => {
    if (firstMountRef.current) {
      firstMountRef.current = false
      return
    }
    const targets = [headerRef.current, relatedRef.current].filter(Boolean) as HTMLElement[]
    if (targets.length === 0) return
    // 仅在动画期间设置 will-change，结束后清除（避免常驻 GPU 合成层）
    targets.forEach(t => {
      t.style.willChange = 'height, opacity'
    })
    gsap.killTweensOf(targets)
    if (headerVisible) {
      gsap.fromTo(
        targets,
        { height: 0, opacity: 0 },
        {
          height: 'auto',
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
          clearProps: 'height',
          onComplete: () => targets.forEach(t => (t.style.willChange = '')),
        }
      )
    } else {
      gsap.to(targets, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => targets.forEach(t => (t.style.willChange = '')),
      })
    }
  }, [headerVisible])

  const bookData = getBook(bookSlug) as BookData

  const interpContent = bookData.interpContent ?? {}
  const sourceContent = bookData.sourceContent ?? {}
  const skillRawContent = bookData.skillRawContent ?? {}
  const skillDisplayNames = bookData.skillDisplayNames ?? {}
  const chapterToSkills = bookData.chapterToSkills ?? {}
  const skillToChapters = bookData.skillToChapters ?? {}

  const { toggle: toggleBookmark, isBookmarked } = useBookmarks(bookSlug)
  const { annotations, add, remove, updateNote } = useAnnotations(
    bookSlug,
    modalKey,
    modalType === 'source'
  )

  // 加载内容（异步函数）
  useEffect(() => {
    if (!modalKey || !modalType || modalType === 'skill') return
    let cancelled = false
    // 加载时序控制：进入加载态、清空旧内容、获取 loader——必须在 effect 内（异步）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContentLoading(true)
    setLoadedContent('')

    let loader: (() => Promise<string>) | undefined
    if (modalType === 'interp') {
      loader = interpContent[modalKey]
    } else if (modalType === 'source') {
      loader = sourceContent[modalKey]
    }

    if (!loader) {
      setContentLoading(false)
      return
    }

    loader()
      .then(content => {
        if (!cancelled) {
          setLoadedContent(content)
          setContentLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setContentLoading(false)
      })
    return () => {
      cancelled = true
    }
    // interpContent / sourceContent 来自 getBook(bookSlug)，bookSlug 变化触发 getBook 重渲；
    // 此处省略依赖避免重复触发加载
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalKey, modalType])

  // Reset internal UI state when navigating between chapters
  const prevKeyRef = useRef(modalKey)
  useEffect(() => {
    if (prevKeyRef.current !== modalKey) {
      setToolbarPos(null)
      setShowPanel(false)
      setPendingSelection(null)
      setTocOpen(false)
      setSkillRawText('')
      setHeaderVisible(true)
      prevKeyRef.current = modalKey
    }
  }, [modalKey])

  /**
   * 在可见 DOM 中扫描首次出现 searchText 的 text node，插入 <mark class="search-flash">
   * AUTO_FADE_MS 后还原。跨节点情况扁平化处理。
   */
  const flashMarkHighlight = useCallback(
    (searchText: string, root: HTMLElement) => {
      const container = root
      const plainText = container.textContent || ''
      let charCount = 0
      let targetNode: Text | null = null
      let targetOffset = 0
      const walk = (node: Node) => {
        if (targetNode) return
        if (node.nodeType === Node.TEXT_NODE) {
          const t = (node as Text).textContent || ''
          const nextCount = charCount + t.length
          if (searchTextId < nextCount) {
            targetNode = node as Text
            targetOffset = searchTextId - charCount
            return
          }
          charCount = nextCount
        } else {
          for (const child of Array.from(node.childNodes)) {
            walk(child)
            if (targetNode) return
          }
        }
      }
      const searchTextId = plainText.indexOf(searchText)
      if (searchTextId < 0) return
      walk(container)
      if (!targetNode) return

      let current: Text | null = targetNode
      let offset = targetOffset
      let remaining = searchText.length

      while (current && remaining > 0) {
        const nodeText = current.textContent || ''
        const available = nodeText.length - offset
        const take = Math.min(remaining, Math.max(0, available))
        if (take <= 0) {
          let next: Node | null = current.nextSibling
          while (next && next.nodeType !== Node.TEXT_NODE) next = next.nextSibling
          current = next as Text | null
          offset = 0
          continue
        }

        const validOffset = Math.max(0, Math.min(offset, nodeText.length))
        const validEnd = validOffset + take
        const parent = current.parentNode
        if (!parent) return

        const mark = document.createElement('mark')
        mark.className = 'search-flash'
        mark.textContent = nodeText.slice(validOffset, validEnd)
        const before = document.createTextNode(nodeText.slice(0, validOffset))
        const after = document.createTextNode(nodeText.slice(validEnd))
        const frag = document.createDocumentFragment()
        frag.appendChild(before)
        frag.appendChild(mark)
        frag.appendChild(after)
        const idx = Array.from(parent.childNodes).indexOf(current)
        parent.replaceChild(frag, current)

        remaining -= take
        if (remaining <= 0) {
          timerRef.current = setTimeout(() => {
            const a = parent.childNodes[idx] as Text
            const b = parent.childNodes[idx + 1] as HTMLElement
            const c = parent.childNodes[idx + 2] as Text
            const combined = document.createTextNode(
              a.textContent! + b.textContent! + c.textContent!
            )
            parent.replaceChild(combined, parent.childNodes[idx])
            parent.removeChild(parent.childNodes[idx + 1])
            parent.removeChild(parent.childNodes[idx + 1])
            onScrollToTextConsumed()
            timerRef.current = null
          }, AUTO_FADE_MS)
          return
        }

        let next: Node | null = current.nextSibling
        while (next && next.nodeType !== Node.TEXT_NODE) next = next.nextSibling
        current = next as Text | null
        offset = 0
      }

      onScrollToTextConsumed()
    },
    [onScrollToTextConsumed]
  )

  // Scroll to matching text when opened from search
  useEffect(() => {
    if (modalKey && scrollToText && modalBodyRef.current && !contentLoading) {
      const container = modalBodyRef.current

      // 翻页模式：用 PaginatedReader 暴露的 findText 找 page + 文本节点，goToPage 后滚动并闪黄
      if (readerMode === 'smooth' || readerMode === 'flip') {
        const handle = paginatedReaderRef.current
        if (!handle) {
          onScrollToTextConsumed()
          return
        }
        const found = handle.findText(scrollToText)
        if (!found) {
          onScrollToTextConsumed()
          return
        }
        // 翻页完成后再在可见 DOM 中闪黄（翻页动画异步完成，等一帧）
        handle.goToPage(found.pageIdx)
        requestAnimationFrame(() => {
          // 在可见 page 容器内扫描文本并闪黄
          const container = modalBodyRef.current?.querySelector(
            '.paginated-reader-container'
          ) as HTMLElement | null
          if (container) {
            flashMarkHighlight(found.searchText, container)
            // 滚动目标 heading 到 viewport（若文本所在的 block 是 heading）
            const walkScroll = () => {
              const marks = container.querySelectorAll('mark.search-flash')
              if (marks.length > 0) {
                marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            }
            setTimeout(walkScroll, 50)
          } else {
            onScrollToTextConsumed()
          }
        })
        return
      }
      const plainText = container.textContent || ''
      if (!plainText) return
      const searchText = scrollToText.trim()
      const idx = plainText.indexOf(searchText)
      if (idx >= 0) {
        // walk DOM 找 idx 落在哪个 text node
        let charCount = 0
        let targetNode: Text | null = null
        let targetOffset = 0
        const walk = (node: Node) => {
          if (targetNode) return
          if (node.nodeType === Node.TEXT_NODE) {
            const text = (node as Text).textContent || ''
            const nextCount = charCount + text.length
            if (idx < nextCount) {
              targetNode = node as Text
              targetOffset = idx - charCount
              return
            }
            charCount = nextCount
          } else {
            for (const child of Array.from(node.childNodes)) {
              walk(child)
              if (targetNode) return
            }
          }
        }
        walk(container)
        if (targetNode !== null) {
          const targetNodeNonNull: Text = targetNode
          const nodeText = targetNodeNonNull.textContent || ''
          // 滚到节点位置（可能跨 text node：分页时翻页模式会跨页；scroll 模式通常在同一页内）
          try {
            const range = document.createRange()
            range.setStart(targetNodeNonNull, targetOffset)
            range.setEnd(
              targetNodeNonNull,
              Math.min(targetOffset + searchText.length, nodeText.length)
            )
            const rect = range.getBoundingClientRect()
            container.scrollTo({
              top: container.scrollTop + rect.top - SCROLL_OFFSET,
              behavior: 'smooth',
            })
          } catch {
            container.scrollTo({ top: 0, behavior: 'smooth' })
          }
          flashMarkHighlight(searchText, container)
        }
      }
    }
    // Cleanup: cancel pending restore timer
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [
    modalKey,
    scrollToText,
    onScrollToTextConsumed,
    loadedContent,
    contentLoading,
    skillRawText,
    readerMode,
    flashMarkHighlight,
  ])

  // J/K keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Escape') {
        setToolbarPos(null)
        setPendingSelection(null)
        return
      }
      const currentIdx = modalKey ? chapters.findIndex(c => c.name === modalKey) : -1
      if ((e.key === 'j' || e.key === 'J') && currentIdx >= 0 && currentIdx < chapters.length - 1)
        onNavigate(modalType || 'interp', chapters[currentIdx + 1].name)
      if ((e.key === 'k' || e.key === 'K') && currentIdx > 0)
        onNavigate(modalType || 'interp', chapters[currentIdx - 1].name)
      if (e.key === 'b' || e.key === 'B') {
        if (modalKey) toggleBookmark(modalKey, modalType)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [chapters, modalKey, modalType, toggleBookmark, onNavigate])

  // Load raw skill content
  useEffect(() => {
    if (modalType !== 'skill' || !modalKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSkillRawText('')
      return
    }
    // skillRawContent 按章节文件夹名索引，需通过 skillToChapters 映射
    const contentKey = skillToChapters[modalKey]?.[0] || modalKey
    const loader = skillRawContent[contentKey]
    if (!loader) return
    loader().then(text => setSkillRawText(text))
    // skillRawContent / skillToChapters 来自 getBook(bookSlug)，bookSlug 变化已触发重渲，
    // 此处省略依赖避免 effect 重复触发
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalType, modalKey])

  const handleMouseUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !modalBodyRef.current) return
    const text = sel.toString().trim()
    if (!text) return

    // Walk DOM from selection anchor to get exact character offset
    const range = sel.getRangeAt(0)
    const startNode = range.startContainer
    const startOffset = range.startOffset

    let charCount = 0
    let foundStart = -1
    const walk = (node: Node) => {
      if (foundStart >= 0) return
      if (node === startNode) {
        if (node.nodeType === Node.TEXT_NODE) {
          foundStart = charCount + startOffset
        }
        return
      }
      if (node.nodeType === Node.TEXT_NODE) {
        charCount += (node.textContent || '').length
      } else {
        for (const child of Array.from(node.childNodes)) {
          walk(child)
          if (foundStart >= 0) return
        }
      }
    }
    walk(modalBodyRef.current)
    if (foundStart < 0) return

    // Count occurrences of text before found position to determine matchIndex
    const plainText = modalBodyRef.current.textContent || ''
    let matchIndex = 0
    let searchPos = 0
    while (true) {
      const idx = plainText.indexOf(text, searchPos)
      if (idx === -1 || idx >= foundStart) break
      matchIndex++
      searchPos = idx + 1
    }

    const clientX = 'touches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY
    setToolbarPos({ x: clientX, y: clientY - 8 })
    setPendingSelection({ text, start: foundStart, end: foundStart + text.length, matchIndex })
  }, [])

  const handleAnnotationType = (type: AnnotationType) => {
    if (!pendingSelection) return
    add({
      type,
      selectedText: pendingSelection.text,
      rangeStart: pendingSelection.start,
      rangeEnd: pendingSelection.end,
      matchIndex: pendingSelection.matchIndex,
      note: '',
      fromSource: modalType === 'source',
    })
    setToolbarPos(null)
    setPendingSelection(null)
    window.getSelection()?.removeAllRanges()
  }

  const handleNavigate = (ann: Annotation) => {
    setShowPanel(false)
    const el = modalBodyRef.current
    if (!el) return
    const target = el.querySelector(`[data-ann-id="${CSS.escape(ann.id)}"]`) as HTMLElement | null
    if (target) {
      const containerRect = el.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      el.scrollBy({
        top: targetRect.top - containerRect.top - ANNOTATION_SCROLL_OFFSET,
        behavior: 'smooth',
      })
    }
  }

  // 统一 ChapterKey 下的跨内容导航：同一篇章的 source / interp / skill 互相跳转
  const chapterName = modalType === 'skill' ? skillToChapters[modalKey]?.[0] || modalKey : modalKey
  const chapterSkillName = chapterToSkills[chapterName]?.[0]
  const hasSource = !!sourceContent[chapterName]
  const hasInterp = !!interpContent[chapterName]
  const hasSkill = !!skillRawContent[chapterName]

  // 上一篇 / 下一篇 导航
  const chapterIndex = chapters.findIndex(c => c.name === chapterName)
  const hasPrev = chapterIndex > 0
  const hasNext = chapterIndex >= 0 && chapterIndex < chapters.length - 1
  const prevChapter = hasPrev ? chapters[chapterIndex - 1].name : null
  const nextChapter = hasNext ? chapters[chapterIndex + 1].name : null

  const contentNavItems = [
    {
      type: 'source' as const,
      label: '原文',
      show: hasSource && modalType !== 'source',
      navKey: chapterName,
    },
    {
      type: 'interp' as const,
      label: '解读',
      show: hasInterp && modalType !== 'interp',
      navKey: chapterName,
    },
    {
      type: 'skill' as const,
      label: '技能',
      show: hasSkill && modalType !== 'skill' && !!chapterSkillName,
      navKey: chapterSkillName || '',
    },
  ].filter(c => c.show)
  const rawBody = contentLoading
    ? ''
    : loadedContent ||
      (modalType === 'source'
        ? '<p class="not-found-msg">未找到该篇原文</p>'
        : modalType === 'interp'
          ? '<p class="not-found-msg">未找到该篇解读内容</p>'
          : '')
  const annotatedBody = injectAnnotations(rawBody, annotations)
  const proseClass = modalType === 'interp' || modalType === 'source' ? 'prose-interp' : ''

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal-card">
          <div className="modal-header" ref={headerRef}>
            {modalType === 'interp' && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setTocOpen(v => !v)}
                title="目录"
                className={`toc-toggle-btn${tocOpen ? ' active' : ''}`}
                aria-label="切换目录"
              >
                {tocOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
              </Button>
            )}
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setReaderSettingsOpen(true)}
              title="阅读设置"
              aria-label="阅读设置"
            >
              <Settings size={16} />
            </Button>
            <ActionBar
              key={modalKey}
              bookSlug={bookSlug}
              modalType={modalType}
              modalKey={modalKey}
              isBookmarked={isBookmarked}
              toggleBookmark={toggleBookmark}
              annotationsCount={annotations.length}
              onTogglePanel={() => setShowPanel(v => !v)}
              skillRawContent={skillRawContent}
            />
            <Button variant="ghost" size="sm" onClick={onClose} className="modal-close-btn">
              <X size={18} />
            </Button>
            <ReadingProgress scrollRef={modalBodyRef} readerMode={readerMode} />
          </div>
          <div
            className="modal-content-wrapper"
            onClick={e => {
              if (tocOpen && !(e.target as HTMLElement).closest('.toc-sidebar')) {
                setTocOpen(false)
              }
            }}
          >
            {modalType === 'interp' && (
              <TocSidebar
                html={rawBody}
                scrollRef={modalBodyRef}
                open={tocOpen}
                readerMode={readerMode}
                onItemClick={() => {
                  if (window.innerWidth <= MOBILE_BREAKPOINT) setTocOpen(false)
                }}
                getPageOfHeadingId={
                  readerMode === 'smooth' || readerMode === 'flip'
                    ? (id: string) => paginatedReaderRef.current?.getPageOfHeadingId(id) ?? -1
                    : undefined
                }
                goToPage={
                  readerMode === 'smooth' || readerMode === 'flip'
                    ? (idx: number) => paginatedReaderRef.current?.goToPage(idx)
                    : undefined
                }
              />
            )}
            <div
              className="modal-body"
              ref={modalBodyRef}
              onMouseUp={
                modalType !== 'skill' && readerMode === 'scroll' ? handleMouseUp : undefined
              }
              onTouchEnd={
                modalType !== 'skill' && readerMode === 'scroll'
                  ? e => {
                      const sel = window.getSelection()
                      if (sel && !sel.isCollapsed) e.preventDefault()
                      handleMouseUp(e)
                    }
                  : undefined
              }
            >
              {modalType === 'skill' ? (
                <pre className="skill-raw-body">
                  <code>{skillRawText || '加载中...'}</code>
                </pre>
              ) : contentLoading ? (
                <div className={`${proseClass} loading-center`}>加载中...</div>
              ) : (
                <ReaderBody
                  ref={paginatedReaderRef}
                  bookSlug={bookSlug}
                  modalType={modalType}
                  modalKey={modalKey}
                  annotatedBody={annotatedBody}
                  proseClass={proseClass}
                  scrollRef={modalBodyRef}
                  initialPage={0}
                  mode={readerMode}
                  onCenterTap={() => setHeaderVisible(v => !v)}
                  onCrossChapterNavigate={dir => {
                    const targetChapter = dir === 'next' ? nextChapter : prevChapter
                    if (targetChapter) {
                      onNavigate(modalType, targetChapter)
                    }
                  }}
                />
              )}
            </div>
          </div>
          {modalKey && (
            <div className="related-section" ref={relatedRef}>
              <div className="related-left">
                {/* 同一篇章内的跨内容导航 */}
                {contentNavItems.length > 0 && (
                  <div className="related-tags">
                    {contentNavItems.map(({ type, label, navKey }) => (
                      <Button
                        key={type}
                        variant="ghost"
                        size="sm"
                        className={`related-tag-${type}`}
                        onClick={() => onNavigate(type, navKey)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                )}

                {[
                  {
                    key: 'interp',
                    data: (chapterToSkills[chapterName] || []).filter(
                      s => modalType !== 'skill' || s !== modalKey
                    ),
                    label: '关联技能',
                    navigateType: 'skill' as const,
                    displayName: skillDisplayNames,
                  },
                  {
                    key: 'skill',
                    data: skillToChapters[modalKey],
                    label: '相关篇目',
                    navigateType: 'interp' as const,
                    displayName: null as Record<string, string> | null,
                  },
                ]
                  .filter(item => item.data?.length)
                  .map(({ key, data, label, navigateType, displayName }) => (
                    <div key={key} className="related-tags">
                      <span className="related-label">{label}</span>
                      {(data as string[]).map(item => (
                        <Button
                          key={item}
                          variant="ghost"
                          size="xs"
                          className={`related-tag-${key}`}
                          onClick={() => onNavigate(navigateType, item)}
                        >
                          {displayName ? displayName[item] || item : item}
                        </Button>
                      ))}
                    </div>
                  ))}
              </div>

              {/* 上一篇 / 下一篇 */}
              {chapters.length > 1 && (
                <div className="chapter-nav-center">
                  <ButtonGroup>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!hasPrev}
                      onClick={() => prevChapter && onNavigate(modalType, prevChapter)}
                      title={prevChapter || undefined}
                    >
                      上一篇
                    </Button>
                    <ButtonGroupText>
                      {chapterIndex + 1} / {chapters.length}
                    </ButtonGroupText>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!hasNext}
                      onClick={() => nextChapter && onNavigate(modalType, nextChapter)}
                      title={nextChapter || undefined}
                    >
                      下一篇
                    </Button>
                  </ButtonGroup>
                </div>
              )}

              <div className="related-right">
                <BackToTop scrollRef={modalBodyRef} readerMode={readerMode} />
              </div>
            </div>
          )}

          {showPanel && (
            <AnnotationPanel
              annotations={annotations}
              onRemove={remove}
              onUpdateNote={updateNote}
              onNavigate={handleNavigate}
              onClose={() => setShowPanel(false)}
            />
          )}
        </div>
      </div>
      {toolbarPos && (
        <AnnotationToolbar
          position={toolbarPos}
          selectedText={pendingSelection?.text}
          onSelect={handleAnnotationType}
          onClose={() => {
            setToolbarPos(null)
            setPendingSelection(null)
          }}
        />
      )}

      {/* 阅读设置底部抽屉 */}
      <ReaderSettingsDrawer
        open={readerSettingsOpen}
        onOpenChange={setReaderSettingsOpen}
        readerMode={readerMode}
        onModeChange={setReaderMode}
      />
    </>
  )
}

export default ModalReader
