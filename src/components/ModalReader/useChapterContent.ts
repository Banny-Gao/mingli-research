// src/components/ModalReader/useChapterContent.ts
import { useEffect, useState } from 'react'
import type { ModalType } from './modalType'

type ContentLoader = () => Promise<string>
type LoaderMap = Record<string, ContentLoader>

interface UseChapterContentParams {
  modalType: ModalType
  modalKey: string
  /** `interp` / `source` 模式用 loaders[modalKey] 拉取 markdown 文本 */
  loaders: LoaderMap
}

export interface UseChapterContentResult {
  loadedContent: string
  contentLoading: boolean
}

/**
 * ModalReader 的"章节内容加载"hook——统一管理 interp / source 两种模式。
 *
 * - modalKey / modalType 变化 → 重新加载；unmount → 取消未完成 loader
 * - loader 抛错 → contentLoading = false（不抛到外层）
 */
export function useChapterContent({
  modalType,
  modalKey,
  loaders,
}: UseChapterContentParams): UseChapterContentResult {
  const [loadedContent, setLoadedContent] = useState('')
  const [contentLoading, setContentLoading] = useState(false)

  // interp / source 内容加载
  useEffect(() => {
    if (!modalKey || !modalType) return
    let cancelled = false
    // 加载时序：进入 loading 态、清空旧内容——必须在 effect 内（异步）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContentLoading(true)
    setLoadedContent('')

    const loader = loaders[modalKey]
    if (!loader) {
      setContentLoading(false)
      return
    }

    loader()
      .then(content => {
        if (!cancelled) {
          setLoadedContent(content)
          setContentLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setContentLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [modalKey, modalType, loaders])

  return {
    loadedContent,
    contentLoading,
  }
}
