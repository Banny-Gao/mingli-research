import { StrictMode, lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './styles/index.css'
import './styles/index.less'
import { ReaderProvider, useReader } from './hooks/useReader'

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
              <Route path="/:slug" element={<LazyBookApp />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <GlobalModal />
        </ReaderProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)
