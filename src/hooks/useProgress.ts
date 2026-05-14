import { useState, useEffect } from 'react'

const READ_KEY = 'mingli_read'
const BOOKMARK_KEY = 'mingli_bookmarks'

export function useReadProgress(slug: string) {
  const [readSet, setReadSet] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${READ_KEY}_${slug}`)
      if (raw) setReadSet(new Set(JSON.parse(raw)))
    } catch {}
  }, [slug])

  const markRead = (name: string) => {
    setReadSet(prev => {
      const next = new Set(prev)
      next.add(name)
      try {
        localStorage.setItem(`${READ_KEY}_${slug}`, JSON.stringify([...next]))
      } catch {}
      return next
    })
  }

  const isRead = (name: string) => readSet.has(name)

  return { markRead, isRead, readCount: readSet.size }
}

export function useBookmarks(slug: string) {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${BOOKMARK_KEY}_${slug}`)
      if (raw) setBookmarks(new Set(JSON.parse(raw)))
    } catch {}
  }, [slug])

  const toggle = (name: string) => {
    setBookmarks(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      try {
        localStorage.setItem(`${BOOKMARK_KEY}_${slug}`, JSON.stringify([...next]))
      } catch {}
      return next
    })
  }

  const isBookmarked = (name: string) => bookmarks.has(name)

  return { toggle, isBookmarked, count: bookmarks.size }
}
