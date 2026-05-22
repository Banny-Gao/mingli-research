import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import './AiAssistant.less'

interface Props {
  chapter?: string
}

const AiAssistant = ({ chapter }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="ai-assistant">
      {open && (
        <div className="ai-assistant-panel">
          <div className="ai-assistant-header">AI 助手（开发中）</div>
          <div className="ai-assistant-body">
            AI 解读助手正在训练中，目标：基于任铁樵注解体系，辅助理解原文深意。
            {chapter && (
              <>
                <br />
                <br />
                当前篇目：<strong className="ai-assistant-name">{chapter}</strong>
              </>
            )}
          </div>
          <button className="ai-assistant-close" onClick={() => setOpen(false)}>
            关闭
          </button>
        </div>
      )}
      <button
        className="ai-assistant-fab"
        onClick={() => setOpen(v => !v)}
        title="AI 助手（开发中）"
      >
        <Sparkles size={20} />
      </button>
    </div>
  )
}

export default AiAssistant
