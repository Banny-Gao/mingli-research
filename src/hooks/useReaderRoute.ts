import { useRef, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { books } from '../data/books'

/** 匹配 reader 路由段：/books/:section/:slug/read/:type/:key  或  /:slug/read/:type/:key */
export const READER_PATH_RE = /\/read\/(interp|source)\/[^/]+$/

export function buildReaderPath(bookSlug: string, modalType: string, modalKey: string): string {
  const book = books.find(b => b.slug === bookSlug)
  const section = book?.section
  const encoded = encodeURIComponent(modalKey)
  return section
    ? `/books/${section}/${bookSlug}/read/${modalType}/${encoded}`
    : `/${bookSlug}/read/${modalType}/${encoded}`
}

interface UseReaderRouteParams {
  isMobile: boolean
  modalType: string | null
  bookSlug: string
  modalKey: string
  onExit: () => void
}

interface UseReaderRouteReturn {
  /** 推入 reader 路由历史，replace=true 时替换当前条（章节内切换） */
  enterRoute: (path: string, opts?: { replace?: boolean }) => void
  /** 退出 reader 路由，内部 navigate(-1) */
  exitRoute: () => void
}

/**
 * 移动端 reader 路由状态机
 *
 * 封装 reader 路由的进入/退出/断点兜底逻辑，内部管理
 * activeRef 状态标记，确保 popstate / 路由变化 / modal 关闭
 * 三条路径的退出互不冲突。
 */
export function useReaderRoute({
  isMobile,
  modalType,
  bookSlug,
  modalKey,
  onExit,
}: UseReaderRouteParams): UseReaderRouteReturn {
  const navigate = useNavigate()
  const location = useLocation()
  const activeRef = useRef(false)

  const isModalActive = modalType !== null && !!bookSlug && !!modalKey

  const enterRoute = useCallback(
    (path: string, opts?: { replace?: boolean }) => {
      activeRef.current = true
      navigate(path, opts)
    },
    [navigate]
  )

  const exitRoute = useCallback(() => {
    if (activeRef.current) {
      navigate(-1)
    }
  }, [navigate])

  // popstate：系统返回键 / 浏览器手势返回 → 退出
  useEffect(() => {
    if (!isMobile) return
    const handler = () => {
      if (!READER_PATH_RE.test(window.location.pathname)) {
        onExit()
      }
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [isMobile, onExit])

  // 路由离开：navigate / Link / 地址栏修改 → 退出
  useEffect(() => {
    if (!isMobile) return
    if (activeRef.current && !READER_PATH_RE.test(location.pathname)) {
      onExit()
    }
  }, [isMobile, location.pathname, onExit])

  // 断点旋转兜底：桌面 → 移动端时迁入 reader 路由
  // 同时充当 activeRef 的唯一复位点：modal 关闭后才置 false
  useEffect(() => {
    if (!isMobile) return
    if (!isModalActive) {
      activeRef.current = false
      return
    }
    if (READER_PATH_RE.test(location.pathname)) return
    if (activeRef.current) return
    activeRef.current = true
    navigate(buildReaderPath(bookSlug, modalType, modalKey))
  }, [isMobile, isModalActive, bookSlug, modalType, modalKey, location.pathname, navigate])

  return { enterRoute, exitRoute }
}
