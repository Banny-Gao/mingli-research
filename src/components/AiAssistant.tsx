import React, { useState } from 'react'

interface Props {
  chapter?: string
}

const AiAssistant: React.FC<Props> = ({ chapter }) => {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 100,
      }}
    >
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            right: 0,
            width: 320,
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-hover)',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-text-dim)',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            AI 助手（开发中）
          </div>
          <div
            style={{
              background: 'rgba(122,79,170,0.08)',
              border: '1px dashed var(--color-purple)',
              borderRadius: 8,
              padding: '16px 12px',
              color: 'var(--color-text-dim)',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            AI 解读助手正在训练中，目标：基于任铁樵注解体系，辅助理解原文深意。
            {chapter && (
              <>
                <br />
                <br />
                当前篇目：<strong style={{ color: 'var(--color-gold)' }}>{chapter}</strong>
              </>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              marginTop: 10,
              width: '100%',
              padding: '6px',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              color: 'var(--color-text-dim)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            关闭
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen(v => !v)}
        title="AI 助手（开发中）"
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-purple), var(--color-blue))',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(122,79,170,0.4)',
          transition: 'transform 0.2s',
          fontSize: 20,
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.1)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
      >
        ✨
      </button>
    </div>
  )
}

export default AiAssistant
