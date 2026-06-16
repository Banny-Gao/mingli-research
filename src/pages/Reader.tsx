import { useEffect, useRef, Suspense, lazy } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useReader } from '../hooks/useReader'
import { useMediaQuery } from '../hooks/useMediaQuery'

const MOBILE_QUERY = '(max-width: 640px)'

const LazyModalReader = lazy(async () => {
  await import('highlight.js/styles/atom-one-dark.css')
  return import('../components/ModalReader')
})

const Loading = () => (
  <div className="page-wrapper">
    <div className="page-container">
      <div className="loading-center">加载中...</div>
    </div>
  </div>
)

/**
 * 移动端专用的"阅读"路由：/books/:section/:slug/read/:type/:key
 *   或 /:slug/read/:type/:key
 *
 * - 由 BookApp / SearchBar / Notes 跳转过来：openReader 已在跳转前设置好 state，
 *   本组件只负责渲染，不再重复调用 openReader
 * - 直链访问（state 为空）：useEffect 回调 openReader 回填 state
 * - 系统返回键：popstate → useReader 内部清空 state → BookApp 恢复
 * - 桌面端访问此 URL：redirect 到 BookApp，由 GlobalModal 接管渲染 modal
 */
const Reader = () => {
  const { section, slug, type, key } = useParams<{
    section?: string
    slug?: string
    type?: string
    key?: string
  }>()
  const { state, openReader, chapters, closeReader, consumeScrollToText } = useReader()
  const isMobile = useMediaQuery(MOBILE_QUERY)

  // 用 ref 标记是否已完成初始化，确保 openReader 只调一次
  const initializedRef = useRef(false)

  // 直链进入时回填 state（只在 state 完全为空时触发）
  useEffect(() => {
    if (initializedRef.current) return
    if (!slug || !type || !key) return
    // 如果 state 已经有值（从 BookApp / SearchBar 跳过来的），不重复调
    if (state.modalType && state.modalKey) {
      initializedRef.current = true
      return
    }
    initializedRef.current = true
    const normalizedType = type === 'chapter' ? 'interp' : type
    openReader({
      bookSlug: slug,
      modalType: normalizedType as 'interp' | 'skill' | 'source',
      modalKey: decodeURIComponent(key),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, type, key])

  if (!slug || !type || !key) {
    return <Navigate to="/" replace />
  }

  // 桌面端访问 /read/...：把控制权交回 BookApp + GlobalModal
  if (!isMobile) {
    const target = section ? `/books/${section}/${slug}` : `/${slug}`
    return <Navigate to={target} replace />
  }

  if (!state.modalType || !state.modalKey) {
    return <Loading />
  }

  return (
    <Suspense fallback={<Loading />}>
      <LazyModalReader
        chapters={chapters}
        bookSlug={state.bookSlug}
        modalType={state.modalType}
        modalKey={state.modalKey}
        scrollToText={state.scrollToText}
        initialPage={state.initialPage}
        onClose={closeReader}
        onNavigate={(t, k) => {
          // 移动端 reader 路由内切章节：hook 内部会以 replace:true navigate，
          // 不污染历史栈
          openReader({
            bookSlug: state.bookSlug,
            modalType: t,
            modalKey: k,
          })
        }}
        onScrollToTextConsumed={consumeScrollToText}
      />
    </Suspense>
  )
}

export default Reader
