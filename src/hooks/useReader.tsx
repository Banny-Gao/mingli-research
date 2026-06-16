import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { books } from '../data/books'
import { useReadProgress, useGlobalProgress } from './useProgress'
import { useMediaQuery } from './useMediaQuery'
import { useReaderRoute, buildReaderPath, READER_PATH_RE } from './useReaderRoute'

const MOBILE_QUERY = '(max-width: 640px)'
export interface ReaderParams {
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  scrollToText?: string
  initialPage?: number
}

interface ReaderContextType {
  openReader: (p: ReaderParams) => void
  closeReader: () => void
  consumeScrollToText: () => void
  state: {
    bookSlug: string
    modalType: 'interp' | 'skill' | 'source' | null
    modalKey: string
    scrollToText: string | null
    initialPage: number | null
  }
  chapters: Array<{ name: string }>
  closeVersion: number
}

const ReaderContext = createContext<ReaderContextType | null>(null)

export function ReaderProvider({ children }: { children: ReactNode }) {
  const [bookSlug, setBookSlug] = useState('')
  const [modalType, setModalType] = useState<'interp' | 'skill' | 'source' | null>(null)
  const [modalKey, setModalKey] = useState('')
  const [scrollToText, setScrollToText] = useState<string | null>(null)
  const [initialPage, setInitialPage] = useState<number | null>(null)
  const [closeVersion, setCloseVersion] = useState(0)
  const { touchChapter } = useGlobalProgress()
  const { markRead } = useReadProgress(bookSlug)
  const location = useLocation()
  const isMobile = useMediaQuery(MOBILE_QUERY)

  const chapters = useMemo(() => {
    return books.find(b => b.slug === bookSlug)?.chapters || []
  }, [bookSlug])

  const clearState = useCallback(() => {
    setModalType(null)
    setModalKey('')
    setBookSlug('')
    setScrollToText(null)
    setInitialPage(null)
    setCloseVersion(v => v + 1)
  }, [])

  // 移动端 reader 路由状态机：封装 popstate / 路由变化 / 断点兜底
  const { enterRoute, exitRoute } = useReaderRoute({
    isMobile,
    modalType,
    bookSlug,
    modalKey,
    onExit: clearState,
  })

  const openReader = useCallback(
    (p: ReaderParams) => {
      setBookSlug(p.bookSlug)
      setModalType(p.modalType)
      setModalKey(p.modalKey)
      setScrollToText(p.scrollToText || null)
      setInitialPage(p.initialPage ?? null)
      touchChapter(p.bookSlug, p.modalKey)

      if (!isMobile) return

      const path = buildReaderPath(p.bookSlug, p.modalType, p.modalKey)
      const replace = READER_PATH_RE.test(location.pathname)
      enterRoute(path, { replace })
    },
    [isMobile, location.pathname, enterRoute, touchChapter]
  )

  const closeReader = useCallback(() => {
    if (modalType === 'interp' && modalKey) markRead(modalKey)
    exitRoute()
    clearState()
  }, [modalType, modalKey, markRead, exitRoute, clearState])

  const consumeScrollToText = useCallback(() => {
    setScrollToText(null)
  }, [])

  const value = useMemo(
    () => ({
      openReader,
      closeReader,
      consumeScrollToText,
      state: { bookSlug, modalType, modalKey, scrollToText, initialPage },
      chapters,
      closeVersion,
    }),
    [
      openReader,
      closeReader,
      consumeScrollToText,
      bookSlug,
      modalType,
      modalKey,
      scrollToText,
      initialPage,
      chapters,
      closeVersion,
    ]
  )

  return <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>
}

export function useReader() {
  const ctx = useContext(ReaderContext)
  if (!ctx) throw new Error('useReader must be inside ReaderProvider')
  return ctx
}
