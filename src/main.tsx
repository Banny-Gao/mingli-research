import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { HelmetProvider } from 'react-helmet-async'
import './styles/index.css'
import './styles/index.less'
import Landing from './pages/Landing'
import BookApp from './pages/BookApp'
import Notes from './pages/Notes'

// Prevent FOUC: apply saved theme before React renders
const initTheme = () => {
  try {
    const saved = localStorage.getItem('mingli_theme')
    if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light')
  } catch {}
}
initTheme()

ReactDOM.createRoot(document.body!).render(
  <React.StrictMode>
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
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/:slug" element={<BookApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </HelmetProvider>
  </React.StrictMode>
)