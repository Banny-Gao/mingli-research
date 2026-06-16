import { useState, useRef, useCallback, useEffect } from 'react'
import { X, PanelLeftClose, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group'
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
import { ReaderBody, ReaderToolbar } from './reader-mode'
import { findTextInContainer } from './reader-mode/findTextInContainer'

interface ModalReaderProps {
  chapters: Array<{ name: string }>
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  scrollToText: string | null
  initialPage?: number | null
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

const ANNOTATION_SCROLL_OFFSET = 80
const AUTO_FADE_MS = 4000
const MOBILE_BREAKPOINT = 640

const ModalReader = ({
  chapters,
  bookSlug,
  modalType,
  modalKey,
  scrollToText,
  initialPage,
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
  const [readerMode] = useReaderMode()
  const [toolbarVisible] = useState(true)

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
      prevKeyRef.current = modalKey
    }
  }, [modalKey])

  // Scroll to matching text when opened from search
  useEffect(() => {
    if (modalKey && scrollToText && modalBodyRef.current && !contentLoading) {
      const container = modalBodyRef.current
      const searchText = scrollToText.trim()
      const loc = findTextInContainer(container, searchText)
      if (loc) {
        // scroll to the block
        container.scrollTo({
          top: loc.node.parentElement?.offsetTop ?? 0,
          behavior: 'smooth',
        })
        // inject the mark
        const nodeText = loc.node.textContent || ''
        const validOffset = Math.max(0, Math.min(loc.nodeOffset, nodeText.length - 1))
        const validEndOffset = Math.min(validOffset + searchText.length, nodeText.length)
        const range = document.createRange()
        try {
          range.setStart(loc.node, validOffset)
          range.setEnd(loc.node, validEndOffset)
        } catch {
          return
        }
        const mark = document.createElement('mark')
        mark.className = 'search-flash'
        mark.textContent = nodeText.slice(validOffset, validEndOffset)
        const before = document.createTextNode(nodeText.slice(0, validOffset))
        const after = document.createTextNode(nodeText.slice(validEndOffset))
        const frag = document.createDocumentFragment()
        frag.appendChild(before)
        frag.appendChild(mark)
        frag.appendChild(after)
        const parent = loc.node.parentNode
        if (parent) {
          const idx = Array.from(parent.childNodes).indexOf(loc.node)
          parent.replaceChild(frag, loc.node)
          timerRef.current = setTimeout(() => {
            const combined = document.createTextNode(
              (parent.childNodes[idx] as Text).textContent! +
                (parent.childNodes[idx + 1] as HTMLElement).textContent! +
                (parent.childNodes[idx + 2] as Text).textContent!
            )
            parent.replaceChild(combined, parent.childNodes[idx])
            parent.removeChild(parent.childNodes[idx + 1])
            parent.removeChild(parent.childNodes[idx + 2])
            onScrollToTextConsumed()
            timerRef.current = null
          }, AUTO_FADE_MS)
        }
      }
    }
    // Cleanup: cancel pending restore timer
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [modalKey, scrollToText, onScrollToTextConsumed, loadedContent, contentLoading, skillRawText])

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
      setSkillRawText('')
      return
    }
    // skillRawContent 按章节文件夹名索引，需通过 skillToChapters 映射
    const contentKey = skillToChapters[modalKey]?.[0] || modalKey
    const loader = skillRawContent[contentKey]
    if (!loader) return
    loader().then(text => setSkillRawText(text))
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
          <div className="modal-header">
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
            <ReaderToolbar
              progress={{ current: 0, total: 0 }}
              visible={toolbarVisible}
            />
            <Button variant="ghost" size="sm" onClick={onClose} className="modal-close-btn">
              <X size={18} />
            </Button>
            {readerMode === 'scroll' && <ReadingProgress scrollRef={modalBodyRef} />}
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
                onItemClick={() => {
                  // Note: flip/smooth mode 跳转到 anchor 留给后续 task (需要 ReaderBody 暴露 goToAnchor)
                  if (window.innerWidth <= MOBILE_BREAKPOINT) setTocOpen(false)
                }}
              />
            )}
            {modalType === 'skill' ? (
              <div
                className="modal-body"
                ref={modalBodyRef}
              >
                <pre className="skill-raw-body">
                  <code>{skillRawText || '加载中...'}</code>
                </pre>
              </div>
            ) : (
              <div
                className="modal-body"
                ref={modalBodyRef}
                onMouseUp={handleMouseUp}
                onTouchEnd={e => {
                  const sel = window.getSelection()
                  if (sel && !sel.isCollapsed) e.preventDefault()
                  handleMouseUp(e)
                }}
              >
                <ReaderBody
                  mode={readerMode}
                  bookSlug={bookSlug}
                  modalType={modalType}
                  modalKey={modalKey}
                  chapters={chapters}
                  annotatedBody={annotatedBody}
                  proseClass={proseClass}
                  skillRawText={skillRawText}
                  initialPage={initialPage ?? undefined}
                  onClose={onClose}
                  onNavigate={onNavigate}
                  gestureEnabled={!tocOpen && !showPanel}
                  onCrossChapter={dir => {
                    const target = dir === 'prev' ? prevChapter : nextChapter
                    if (target) onNavigate(modalType, target)
                  }}
                  measureContainerRef={modalBodyRef}
                />
              </div>
            )}
          </div>
          {modalKey && (
            <div className="related-section">
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
                <BackToTop scrollRef={modalBodyRef} />
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
    </>
  )
}

export default ModalReader
