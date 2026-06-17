// src/hooks/useReaderMode.ts
import { useState, useCallback } from 'react'
import { READER_MODE_KEY } from '@/components/ModalReader/reader-mode/constants'

export type ReaderMode = 'scroll' | 'smooth' | 'flip'
const VALID_MODES: ReaderMode[] = ['scroll', 'smooth', 'flip']
const DEFAULT: ReaderMode = 'scroll'

function readStored(): ReaderMode {
  try {
    const v = localStorage.getItem(READER_MODE_KEY)
    if (v && VALID_MODES.includes(v as ReaderMode)) return v as ReaderMode
  } catch { /* 隐私模式等 */ }
  return DEFAULT
}

function writeStored(mode: ReaderMode) {
  try { localStorage.setItem(READER_MODE_KEY, mode) } catch { /* 静默 */ }
}

export function useReaderMode(): [ReaderMode, (m: ReaderMode) => void] {
  const [mode, setMode] = useState<ReaderMode>(readStored)

  const updateMode = useCallback((m: ReaderMode) => {
    setMode(m)
    writeStored(m)
  }, [])

  return [mode, updateMode]
}

export { READER_MODE_KEY }
