import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'dark'
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
      {theme === 'dark' ? (
        <Sun size={20} color="var(--color-gold)" />
      ) : (
        <Moon size={20} color="var(--color-text-title)" />
      )}
    </button>
  )
}
