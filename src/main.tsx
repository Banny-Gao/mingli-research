import { StrictMode, lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './styles/index.css'
import './styles/index.less'
import { ReaderProvider, useReader } from './hooks/useReader'
import { useMediaQuery } from './hooks/useMediaQuery'

const LoadingFallback = () => (
  <div className="page-wrapper">
    <div className="page-container">
      <div className="loading-center">加载中...</div>
    </div>
  </div>
)

// 路由级代码分割：页面组件懒加载
const LazyLanding = lazy(() => import('./pages/Landing'))
const LazyBookApp = lazy(() => import('./pages/BookApp'))
const LazyNotes = lazy(() => import('./pages/Notes'))
const LazyReader = lazy(() => import('./pages/Reader'))

// ModalReader 惰性加载（CSS 优先加载，再加载组件）
const LazyModalReader = lazy(async () => {
  await import('highlight.js/styles/atom-one-dark.css')
  return import('./components/ModalReader')
})

// Prevent FOUC: apply saved theme before React renders
const initTheme = () => {
  try {
    const saved = localStorage.getItem('mingli_theme')
    if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light')
  } catch {
    /* ignore theme errors */
  }
}

function GlobalModal() {
  const { state, chapters, openReader, closeReader, consumeScrollToText } = useReader()
  const isMobile = useMediaQuery('(max-width: 640px)')

  // 移动端：modal 由 /read/... 路由的 LazyReader 独占渲染，避免双层挂载
  if (isMobile) return null
  if (!state.modalType) return null

  return (
    <LazyModalReader
      chapters={chapters}
      bookSlug={state.bookSlug}
      modalType={state.modalType}
      modalKey={state.modalKey}
      scrollToText={state.scrollToText}
      onClose={closeReader}
      onNavigate={(type, key) =>
        openReader({ bookSlug: state.bookSlug, modalType: type, modalKey: key })
      }
      onScrollToTextConsumed={consumeScrollToText}
    />
  )
}

initTheme()

ReactDOM.createRoot(document.body!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter basename="/mingli-research">
        <ReaderProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<LazyLanding />} />
              <Route path="/notes" element={<LazyNotes />} />
              <Route path="/books/:section/:slug" element={<LazyBookApp />} />
              {/* 移动端阅读路由：push 一条新历史，系统返回键可关闭 */}
              <Route path="/books/:section/:slug/read/:type/:key" element={<LazyReader />} />
              <Route path="/:slug" element={<LazyBookApp />} />
              <Route path="/:slug/read/:type/:key" element={<LazyReader />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <GlobalModal />
        </ReaderProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)
