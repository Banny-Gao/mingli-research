import { useState, useEffect } from 'react'

export type ReaderMode = 'scroll' | 'smooth' | 'flip'

const KEY = 'reader:mode'
const VALID: ReaderMode[] = ['scroll', 'smooth', 'flip']

function readStored(): ReaderMode {
  try {
    const v = localStorage.getItem(KEY)
    return (VALID as string[]).includes(v ?? '') ? (v as ReaderMode) : 'scroll'
  } catch {
    return 'scroll'
  }
}

function writeStored(mode: ReaderMode) {
  try {
    localStorage.setItem(KEY, mode)
  } catch {
    // 隐私模式 / quota 超限: 静默
  }
}

export function useReaderMode(): [ReaderMode, (m: ReaderMode) => void] {
  const [mode, setMode] = useState<ReaderMode>(readStored)
  useEffect(() => {
    writeStored(mode)
  }, [mode])
  return [mode, setMode]
}
