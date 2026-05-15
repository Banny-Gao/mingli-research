import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { HelmetProvider } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import './styles/index.css'
import './i18n'
import Landing from './pages/Landing'
import BookApp from './pages/BookApp'
import Notes from './pages/Notes'

const initTheme = () => {
  try {
    const saved = localStorage.getItem('mingli_theme')
    if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light')
  } catch {}
}
initTheme()

export function ThemeToggle() {
  const { t } = useTranslation()
  const [theme, setTheme] = useState(() =>
    document.documentElement.getAttribute('data-theme') || 'dark',
  )
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('mingli_theme', theme)
  }, [theme])
  return (
    <button
      onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
      className="theme-toggle-btn"
    >
      {theme === 'dark' ? `${t('theme.light')} ☀️` : `${t('theme.dark')} 🌙`}
    </button>
  )
}

export function LangToggle() {
  const { i18n } = useTranslation()
  return (
    <button
      className="lang-toggle-btn"
      onClick={() => {
        const next = i18n.language === 'zh' ? 'en' : 'zh'
        i18n.changeLanguage(next)
        localStorage.setItem('mingli_lang', next)
      }}
    >
      {i18n.language === 'zh' ? 'EN' : '中文'}
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