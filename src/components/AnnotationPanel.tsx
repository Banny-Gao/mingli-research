import React, { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Annotation, AnnotationType } from '../hooks/useAnnotations'

interface Props {
  annotations: Annotation[]
  onRemove: (id: string) => void
  onUpdateNote: (id: string, note: string) => void
  onNavigate: (ann: Annotation) => void
  onClose: () => void
}

const TYPE_LABELS: Record<AnnotationType, string> = {
  emphasis: '重点',
  question: '疑问',
  quote: '引用',
}
const TYPE_CLASS: Record<AnnotationType, string> = {
  emphasis: 'ann-type-emphasis',
  question: 'ann-type-question',
  quote: 'ann-type-quote',
}

const AnnotationPanel: React.FC<Props> = ({
  annotations,
  onRemove,
  onUpdateNote,
  onNavigate,
  onClose,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [noteVal, setNoteVal] = useState('')

  return (
    <div className="ann-panel">
      <div className="ann-panel-header">
        <span className="ann-panel-title">批注列表</span>
        <div className="flex items-center gap-2">
          {annotations.length > 0 && (
            <span className="ann-panel-count">{annotations.length}条</span>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
      </div>
      <div className="ann-panel-body">
        {annotations.length === 0 && <div className="ann-panel-empty">选中文字添加批注</div>}
        {annotations.map(ann => (
          <div key={ann.id} className="ann-item">
            <div className="ann-item-header">
              <span className={`ann-type-badge ${TYPE_CLASS[ann.type]}`}>
                {TYPE_LABELS[ann.type]}
              </span>
              <button className="ann-item-remove" onClick={() => onRemove(ann.id)} title="删除">
                <Trash2 size={12} />
              </button>
            </div>
            <div className="ann-item-text" onClick={() => onNavigate(ann)} title="点击跳转到原文">
              「{ann.selectedText}」
            </div>
            {editingId === ann.id ? (
              <div className="ann-note-edit">
                <textarea
                  value={noteVal}
                  onChange={e => setNoteVal(e.target.value)}
                  placeholder="添加批注..."
                  rows={2}
                  className="ann-note-input"
                />
                <div className="ann-note-actions">
                  <button
                    className="ann-note-save"
                    onClick={() => {
                      onUpdateNote(ann.id, noteVal)
                      setEditingId(null)
                    }}
                  >
                    保存
                  </button>
                  <button className="ann-note-cancel" onClick={() => setEditingId(null)}>
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <>
                {ann.note && <div className="ann-note-text">{ann.note}</div>}
                <button
                  className="ann-note-add-btn"
                  onClick={() => {
                    setEditingId(ann.id)
                    setNoteVal(ann.note)
                  }}
                >
                  {ann.note ? '编辑批注' : '添加批注'}
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AnnotationPanel
