import { useState, useEffect } from 'react'

const READ_KEY = 'mingli_read'
const BOOKMARK_KEY = 'mingli_bookmarks'
const GLOBAL_KEY = 'mingli_global_v2'

export interface RecentChapter {
  slug: string
  chapter: string
  ts: number
}

export interface GlobalProgress {
  currentBook: string | null
  lastReadChapter: string | null
  recentChapters: RecentChapter[]
  streakDays: number
  lastActiveDate: string
}

function computeStreak(existing: GlobalProgress, todayStr: string): number {
  if (!existing.lastActiveDate) return 1
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yStr = yesterday.toISOString().slice(0, 10)
  if (existing.lastActiveDate === todayStr) return existing.streakDays
  if (existing.lastActiveDate === yStr) return existing.streakDays + 1
  return 1
}

function padDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function loadGlobal(): GlobalProgress {
  try {
    const raw = localStorage.getItem(GLOBAL_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { currentBook: null, lastReadChapter: null, recentChapters: [], streakDays: 0, lastActiveDate: '' }
}

function saveGlobal(g: GlobalProgress) {
  try { localStorage.setItem(GLOBAL_KEY, JSON.stringify(g)) } catch {}
}

export function useGlobalProgress() {
  const [gp, setGp] = useState<GlobalProgress>(loadGlobal)

  useEffect(() => {
    const today = padDate(new Date())
    const next = { ...gp, lastActiveDate: today }
    // update streak without full re-render just for lastActiveDate
    if (gp.lastActiveDate !== today) {
      const updated = { ...gp, streakDays: computeStreak(gp, today), lastActiveDate: today }
      saveGlobal(updated)
      setGp(updated)
    }
  }, [])

  const touchChapter = (slug: string, chapter: string) => {
    const today = padDate(new Date())
    const next: GlobalProgress = {
      ...gp,
      currentBook: slug,
      lastReadChapter: chapter,
      streakDays: computeStreak(gp, today),
      lastActiveDate: today,
      recentChapters: [
        { slug, chapter, ts: Date.now() },
        ...gp.recentChapters.filter(r => !(r.slug === slug && r.chapter === chapter)),
      ].slice(0, 5),
    }
    saveGlobal(next)
    setGp(next)
  }

  return { ...gp, touchChapter }
}

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
