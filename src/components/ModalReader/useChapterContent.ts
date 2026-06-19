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
  /**
   * `skill` 模式用 skillLoaders[chapterKey] 拉取原始文本（按 chapterKey 而非 modalKey，
   * 因为 skillToChapters[modalKey][0] 才是文件路径）。
   * 调用方负责传入 chapterKey（来自 useChapterNavigation）。
   */
  skillLoaders?: LoaderMap
  /** skill 模式下用于查找文件路径的 chapter key（来自 useChapterNavigation.chapterName） */
  chapterKey?: string
}

export interface UseChapterContentResult {
  loadedContent: string
  contentLoading: boolean
  skillRawText: string
  setSkillRawText: (text: string) => void
}

/**
 * ModalReader 的"章节内容加载"hook——统一管理 interp / source / skill 三种模式。
 *
 * - `interp` / `source`：loaders[modalKey] 异步拉取 markdown
 * - `skill`：skillLoaders[chapterKey] 异步拉取原始文本（chapterKey 来自 useChapterNavigation.chapterName）
 * - modalKey / chapterKey / modalType 变化 → 重新加载；unmount → 取消未完成 loader
 * - loader 抛错 → contentLoading = false（不抛到外层）
 *
 * 把 skill loader 内化后，ModalReader 不再需要外层 effect 调 setSkillRawText。
 */
export function useChapterContent({
  modalType,
  modalKey,
  loaders,
  skillLoaders,
  chapterKey,
}: UseChapterContentParams): UseChapterContentResult {
  const [loadedContent, setLoadedContent] = useState('')
  const [contentLoading, setContentLoading] = useState(false)
  const [skillRawText, setSkillRawText] = useState('')

  // interp / source 内容加载
  useEffect(() => {
    if (!modalKey || !modalType || modalType === 'skill') return
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

  // skill 模式内容加载（按 chapterKey 而非 modalKey 查找文件）
  useEffect(() => {
    if (modalType !== 'skill' || !chapterKey) return
    const loaders = skillLoaders ?? {}
    const loader = loaders[chapterKey]
    if (!loader) return
    let cancelled = false
    // 先清空旧文本，避免 skill A → skill B 中间态残留旧内容
    setSkillRawText('')
    loader()
      .then(text => {
        if (!cancelled) setSkillRawText(text)
      })
      .catch(() => {
        /* swallow */
      })
    return () => {
      cancelled = true
    }
  }, [modalType, chapterKey, skillLoaders])

  return {
    loadedContent,
    contentLoading,
    skillRawText,
    setSkillRawText,
  }
}
