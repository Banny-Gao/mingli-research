import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { HelmetProvider } from 'react-helmet-async'
import './styles/index.css'
import './styles/index.less'
import 'highlight.js/styles/atom-one-dark.css'
import Landing from './pages/Landing'
import BookApp from './pages/BookApp'
import Notes from './pages/Notes'
import { ReaderProvider, useReader } from './hooks/useReader'
import ModalReader from './components/ModalReader'

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
    <ModalReader
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
      <Helmet>
        <script>{`
          (function(){
            try{
              var t=localStorage.getItem('mingli_theme');
              if(t==='light')document.documentElement.setAttribute('data-theme','light');
            }catch(e){}
          })();
        `}</script>
      </Helmet>
      <HashRouter>
        <ReaderProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/:slug" element={<BookApp />} />
            <Route path="/books/:section/:slug" element={<BookApp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <GlobalModal />
        </ReaderProvider>
      </HashRouter>
    </HelmetProvider>
  </StrictMode>
)
