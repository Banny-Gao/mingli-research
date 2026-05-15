import { useState, useEffect } from 'react'

export type AnnotationType = 'emphasis' | 'question' | 'quote'

export interface Annotation {
  id: string
  type: AnnotationType
  selectedText: string
  rangeStart: number
  rangeEnd: number
  note: string
  createdAt: number
}

const ANN_KEY = 'mingli_annotations'

function makeKey(slug: string, chapter: string) {
  return `${ANN_KEY}_${slug}_${chapter}`
}

export function useAnnotations(slug: string, chapter: string) {
  const key = makeKey(slug, chapter)
  const [annotations, setAnnotations] = useState<Annotation[]>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(annotations)) } catch {}
  }, [annotations, key])

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