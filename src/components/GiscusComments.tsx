import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  mapping?: string
  term?: string
}

const GiscusComments: React.FC<Props> = ({ mapping = 'pathname', term = '' }) => {
  const ref = useRef<HTMLDivElement>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    if (!ref.current || ref.current.querySelector('script')) return

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', 'bannyqb/mingli-research')
    script.setAttribute('data-repo-id', 'R_kgDOOHxXjw')
    script.setAttribute('data-category', 'General')
    script.setAttribute('data-category-id', 'DIC_kwDOOHxXj84CkKX_')
    script.setAttribute('data-mapping', mapping)
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark_dimmed')
    script.setAttribute('data-lang', i18n.language)
    script.setAttribute('data-loading', 'lazy')
    script.crossOrigin = 'anonymous'
    script.async = true
    ref.current.appendChild(script)
  }, [mapping, i18n.language])

  return (
    <div
      style={{
        borderTop: '1px solid var(--color-border)',
        paddingTop: 24,
        marginTop: 32,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: 'var(--color-text-muted)',
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        Discussion
      </div>
      <div ref={ref} className="giscus" />
    </div>
  )
}

export default GiscusComments