import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { HelmetProvider } from 'react-helmet-async'
import './styles/index.css'
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

export function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.getAttribute('data-theme') || 'dark',
  )
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('mingli_theme', theme)
  }, [theme])
  return (
    <button
      onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
      className="theme-toggle-btn"
    >
      {theme === 'dark' ? '☀️ 浅色' : '🌙 深色'}
    </button>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/:slug" element={<BookApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)