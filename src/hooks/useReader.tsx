import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { books } from '../data/books'
import { useReadProgress, useGlobalProgress } from './useProgress'

export interface ReaderParams {
  bookSlug: string
  modalType: 'interp' | 'skill' | 'source'
  modalKey: string
  scrollToText?: string
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
  }
  chapters: Array<{ name: string }>
  closeVersion: number // increments each time modal closes, for consumer refresh
}

const ReaderContext = createContext<ReaderContextType | null>(null)

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [bookSlug, setBookSlug] = useState('')
  const [modalType, setModalType] = useState<'interp' | 'skill' | 'source' | null>(null)
  const [modalKey, setModalKey] = useState('')
  const [scrollToText, setScrollToText] = useState<string | null>(null)
  const [closeVersion, setCloseVersion] = useState(0)
  const { touchChapter } = useGlobalProgress()
  const { markRead } = useReadProgress(bookSlug)

  const chapters = useMemo(() => {
    return books.find(b => b.slug === bookSlug)?.chapters || []
  }, [bookSlug])

  const openReader = useCallback(
    (p: ReaderParams) => {
      setBookSlug(p.bookSlug)
      setModalType(p.modalType)
      setModalKey(p.modalKey)
      setScrollToText(p.scrollToText || null)
      touchChapter(p.bookSlug, p.modalKey)
    },
    [touchChapter]
  )

  const closeReader = useCallback(() => {
    if (modalType === 'interp' && modalKey) markRead(modalKey)
    setModalType(null)
    setModalKey('')
    setBookSlug('')
    setScrollToText(null)
    setCloseVersion(v => v + 1)
  }, [modalType, modalKey, markRead])

  const consumeScrollToText = useCallback(() => {
    setScrollToText(null)
  }, [])

  const value = useMemo(
    () => ({
      openReader,
      closeReader,
      consumeScrollToText,
      state: { bookSlug, modalType, modalKey, scrollToText },
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
