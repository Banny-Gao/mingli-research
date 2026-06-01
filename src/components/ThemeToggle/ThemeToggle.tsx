import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'dark'
  )
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('mingli_theme', theme)
  }, [theme])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
      className="theme-toggle-btn"
      aria-label="切换主题"
    >
      {theme === 'dark' ? (
        <Sun size={20} color="var(--color-gold)" />
      ) : (
        <Moon size={20} color="var(--color-text-title)" />
      )}
    </Button>
  )
}
