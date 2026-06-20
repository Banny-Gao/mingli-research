import { useState, useRef, useMemo } from 'react'
import { X, PanelLeftClose, PanelLeft, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group'
import './ModalReader.less'
import { getBook } from '../../data/registry'
import { ReadingProgress, BackToTop, TocSidebar } from '../ReadingTools'
import AnnotationToolbar from '../AnnotationToolbar'
import AnnotationPanel from '../AnnotationPanel'
import ActionBar from '../ActionBar'
import { RelatedTags } from './RelatedTags'
import { useBookmarks } from '../../hooks/useProgress'
import { useAnnotations } from '../../hooks/useAnnotations'
import type { AnnotationType, Annotation } from '../../hooks/useAnnotations'
import { injectAnnotations } from '../../utils/injectAnnotations'
import { useReaderMode } from '../../hooks/useReaderMode'
import { ReaderBody } from './reader-mode/ReaderBody'
import type { PaginatedReaderHandle } from './reader-mode/PaginatedReader'
import { ReaderSettingsDrawer } from './reader-mode/ReaderSettingsDrawer'
import { MOBILE_BREAKPOINT, isPaginatedMode, CLASS as MODAL_CLASS } from './reader-mode/constants'
import { useAnimatedCollapse } from './reader-mode/useAnimatedCollapse'
import { MODAL_TYPE_CAPS, NOT_FOUND_MSG, type ModalType } from './modalType'
import { useChapterLocalState } from './useChapterLocalState'
import { useChapterShortcuts } from './useChapterShortcuts'
import { useChapterContent } from './useChapterContent'
import { useScrollToText } from './useScrollToText'
import { useSelectionToolbar } from './useSelectionToolbar'
import { useChapterNavigation } from './useChapterNavigation'

interface ModalReaderProps {
  chapters: Array<{ name: string }>
  bookSlug: string
  modalType: ModalType
  modalKey: string
  scrollToText: string | null
  onClose: () => void
  onNavigate: (type: ModalType, key: string) => void
  onScrollToTextConsumed: () => void
}

const ANNOTATION_SCROLL_OFFSET = 80

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
  // 章节本地 UI 状态（toolbar / panel / selection / toc / header 显隐）
  // modalKey 变化时 hook 内部自动 reset 到默认值。
  const {
    toolbarPos,
    setToolbarPos,
    showPanel,
    setShowPanel,
    pendingSelection,
    setPendingSelection,
    tocOpen,
    setTocOpen,
    headerVisible,
    setHeaderVisible,
  } = useChapterLocalState(modalKey)

  const bookData = getBook(bookSlug)

  // bookData 子表用 useMemo 稳定引用（避免下游 useEffect 依赖列表因 ?? {} 触发连锁重渲）
  const interpContent = useMemo(() => bookData.interpContent ?? {}, [bookData])
  const sourceContent = useMemo(() => bookData.sourceContent ?? {}, [bookData])
  const skillRawContent = useMemo(() => bookData.skillRawContent ?? {}, [bookData])

  // 章节导航派生（chapterName / prev-next / contentNavItems），封装在 useChapterNavigation
  const { chapterName, chapterIndex, hasPrev, hasNext, prevChapter, nextChapter, contentNavItems } =
    useChapterNavigation({ chapters, modalType, modalKey, bookData })

  // interp / source / skill 章节内容加载（统一在 useChapterContent 内）
  const { loadedContent, contentLoading, skillRawText } = useChapterContent({
    modalType,
    modalKey,
    loaders: modalType === 'interp' ? interpContent : modalType === 'source' ? sourceContent : {},
    skillLoaders: skillRawContent,
    chapterKey: chapterName,
  })

  // 阅读模式
  const [readerMode, setReaderMode] = useReaderMode()
  const [readerSettingsOpen, setReaderSettingsOpen] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const relatedRef = useRef<HTMLDivElement>(null)
  const paginatedReaderRef = useRef<PaginatedReaderHandle | null>(null)

  // header / related-section 缓动显隐
  useAnimatedCollapse({ refs: [headerRef, relatedRef], visible: headerVisible })

  const { toggle: toggleBookmark, isBookmarked } = useBookmarks(bookSlug)
  const { annotations, add, remove, updateNote } = useAnnotations(
    bookSlug,
    modalKey,
    modalType === 'source'
  )

  // 当前 modalType 的能力（proseClass / 是否标注 / 是否分页）
  const caps = MODAL_TYPE_CAPS[modalType]

  // Scroll to matching text when opened from search（封装在 useScrollToText）
  useScrollToText({
    modalKey,
    scrollToText,
    contentLoading,
    loadedContent,
    skillRawText,
    readerMode,
    modalBodyRef,
    paginatedReaderRef,
    onConsumed: onScrollToTextConsumed,
  })

  // J/K 键盘快捷键（封装在 useChapterShortcuts）
  useChapterShortcuts({
    chapters,
    modalKey,
    modalType,
    onNavigate,
    toggleBookmark,
    onCancelSelection: () => {
      setToolbarPos(null)
      setPendingSelection(null)
    },
  })

  // 文本选区 → toolbar（封装在 useSelectionToolbar）
  const { handleSelection: handleMouseUp } = useSelectionToolbar({
    containerRef: modalBodyRef,
    onSelect: (position, selection) => {
      setToolbarPos(position)
      setPendingSelection(selection)
    },
  })

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

  const rawBody = contentLoading ? '' : loadedContent || NOT_FOUND_MSG[modalType]
  const annotatedBody = injectAnnotations(rawBody, annotations)
  const proseClass = caps.proseClass

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
              if (tocOpen && !(e.target as HTMLElement).closest(`.${MODAL_CLASS.tocSidebar}`)) {
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
                  isPaginatedMode(readerMode)
                    ? (id: string) => paginatedReaderRef.current?.getPageOfHeadingId(id) ?? -1
                    : undefined
                }
                goToPage={
                  isPaginatedMode(readerMode)
                    ? (idx: number) => paginatedReaderRef.current?.goToPage(idx)
                    : undefined
                }
              />
            )}
            <div
              className="modal-body"
              ref={modalBodyRef}
              onMouseUp={
                caps.allowsAnnotation && readerMode === 'scroll' ? handleMouseUp : undefined
              }
              onTouchEnd={
                caps.allowsAnnotation && readerMode === 'scroll'
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
                <RelatedTags
                  data={contentNavItems.map(({ type }) => type)}
                  displayName={Object.fromEntries(
                    contentNavItems.map(({ type, label }) => [type, label])
                  )}
                  // itemKey 由 data 项自身决定（source/interp/skill），保证每个 tag 用对 CSS 颜色
                  itemKey={item => item}
                  size="xs"
                  onItemClick={item => {
                    const found = contentNavItems.find(c => c.type === item)
                    if (found) onNavigate(found.type, found.navKey)
                  }}
                />
              </div>

              {/* 上一篇 / 下一篇 */}
              {chapters.length > 1 && (
                <div className="chapter-nav-center">
                  <ButtonGroup>
                    <Button
                      variant="ghost"
                      size="xs"
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
                      size="xs"
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
