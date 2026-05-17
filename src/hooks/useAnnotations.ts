import { useState, useEffect, useRef } from 'react'

export type AnnotationType = 'emphasis' | 'question' | 'quote'

export interface Annotation {
  id: string
  type: AnnotationType
  selectedText: string
  rangeStart: number
  rangeEnd: number
  note: string
  createdAt: number
  fromSource?: boolean
}

const ANN_KEY = 'mingli_annotations'

function makeKey(slug: string, chapter: string, isSource?: boolean) {
  return `${ANN_KEY}_${slug}_${chapter}${isSource ? '__source' : ''}`
}

export function useAnnotations(slug: string, chapter: string, isSource?: boolean) {
  const key = makeKey(slug, chapter, isSource)
  const [annotations, setAnnotations] = useState<Annotation[]>(() => {
    if (!chapter) return []
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  // 切换篇目时从 localStorage 重新加载批注
  useEffect(() => {
    if (!chapter) { setAnnotations([]); return }
    try {
      const raw = localStorage.getItem(key)
      setAnnotations(raw ? JSON.parse(raw) : [])
    } catch { setAnnotations([]) }
  }, [key, chapter])

  // 仅在 modalKey 非空时保存，避免 closeModal 将批注写到空 key 下
  useEffect(() => {
    if (!chapter) return
    try { localStorage.setItem(key, JSON.stringify(annotations)) } catch {}
  }, [annotations, key, chapter])

  const add = (ann: Omit<Annotation, 'id' | 'createdAt'>) => {
    setAnnotations(prev => [
      ...prev,
      { ...ann, id: Date.now().toString(36) + Math.random().toString(36).slice(2), createdAt: Date.now() },
    ])
  }

  const remove = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id))
  }

  const updateNote = (id: string, note: string) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, note } : a))
  }

  return { annotations, add, remove, updateNote }
}