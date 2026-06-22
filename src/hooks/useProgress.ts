import { useState, useEffect } from 'react'

// DP-3: State Machine - explicit chapter state types
export type ChapterState = 'unread' | 'reading' | 'annotated' | 'completed'
export type BookmarkType = 'interp' | 'source'

// DP-3: State transition helper
export function getChapterState(
  isDone: boolean,
  hasAnnotations: boolean,
  hasStartTime: boolean
): ChapterState {
  if (isDone && hasAnnotations) return 'annotated'
  if (isDone) return 'completed'
  if (hasStartTime) return 'reading'
  return 'unread'
}

import { BOOKMARK_KEY } from '../lib/constants'

const READ_KEY = 'mingli_read'
const GLOBAL_KEY = 'mingli_global_v2'
const MAX_RECENT = 5

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
  } catch {
    /* ignore LS errors */
  }
  return {
    currentBook: null,
    lastReadChapter: null,
    recentChapters: [],
    streakDays: 0,
    lastActiveDate: '',
  }
}

function saveGlobal(g: GlobalProgress) {
  try {
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(g))
  } catch {
    /* ignore LS errors */
  }
}

export function useGlobalProgress() {
  const [gp, setGp] = useState<GlobalProgress>(loadGlobal)

  useEffect(() => {
    const today = padDate(new Date())
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
      ].slice(0, MAX_RECENT),
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
    } catch {
      /* ignore LS errors */
    }
  }, [slug])

  const markRead = (name: string) => {
    setReadSet(prev => {
      const next = new Set(prev)
      next.add(name)
      try {
        localStorage.setItem(`${READ_KEY}_${slug}`, JSON.stringify([...next]))
      } catch {
        /* ignore LS errors */
      }
      return next
    })
  }

  const isRead = (name: string) => readSet.has(name)

  return { markRead, isRead, readCount: readSet.size }
}

interface BookmarkEntry {
  key: string
  type: string
}

export function useBookmarks(slug: string) {
  const [bookmarks, setBookmarks] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${BOOKMARK_KEY}_${slug}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        // Support both old format (string[]) and new format ({key,type}[])
        if (Array.isArray(parsed)) {
          const map = new Map<string, string>()
          for (const item of parsed) {
            if (typeof item === 'string') map.set(item, 'interp')
            else if (item?.key) map.set(item.key, item.type || 'interp')
          }
          setBookmarks(map)
        }
      }
    } catch {
      /* ignore LS errors */
    }
  }, [slug])

  const toggle = (name: string, type?: string) => {
    setBookmarks(prev => {
      const next = new Map(prev)
      if (next.has(name)) next.delete(name)
      else next.set(name, type || 'interp')
      try {
        const data: BookmarkEntry[] = []
        next.forEach((t, k) => data.push({ key: k, type: t }))
        localStorage.setItem(`${BOOKMARK_KEY}_${slug}`, JSON.stringify(data))
      } catch {
        /* ignore LS errors */
      }
      return next
    })
  }

  const isBookmarked = (name: string) => bookmarks.has(name)
  const getBookmarkType = (name: string) => bookmarks.get(name) || 'interp'

  return { toggle, isBookmarked, getBookmarkType, count: bookmarks.size }
}
