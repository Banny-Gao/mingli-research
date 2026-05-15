import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Annotation, AnnotationType } from '../hooks/useAnnotations'

interface Props {
  annotations: Annotation[]
  onRemove: (id: string) => void
  onUpdateNote: (id: string, note: string) => void
  onNavigate: (ann: Annotation) => void
}

const TYPE_LABELS: Record<AnnotationType, string> = {
  emphasis: '重点',
  question: '疑问',
  quote: '引用',
}
const TYPE_LABELS_KEY: Record<AnnotationType, string> = {
  emphasis: 'annotations.emphasis',
  question: 'annotations.question',
  quote: 'annotations.quote',
}
const TYPE_CLASS: Record<AnnotationType, string> = {
  emphasis: 'ann-type-emphasis',
  question: 'ann-type-question',
  quote: 'ann-type-quote',
}

const AnnotationPanel: React.FC<Props> = ({ annotations, onRemove, onUpdateNote, onNavigate }) => {
  const { t } = useTranslation()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [noteVal, setNoteVal] = useState('')

  const grouped = annotations

  return (
    <div className="ann-panel">
      <div className="ann-panel-header">
        <span className="ann-panel-title">{t('annotations.title')}</span>
        {annotations.length > 0 && (
          <span className="ann-panel-count">{annotations.length}条</span>
        )}
      </div>
      <div className="ann-panel-body">
        {annotations.length === 0 && (
          <div className="ann-panel-empty">{t('annotations.empty')}</div>
        )}
        {annotations.map(ann => (
          <div key={ann.id} className="ann-item">
            <div className="ann-item-header">
              <span className={`ann-type-badge ${TYPE_CLASS[ann.type]}`}>
                {t(TYPE_LABELS_KEY[ann.type])}
              </span>
              <button
                className="ann-item-remove"
                onClick={() => onRemove(ann.id)}
                title="删除"
              >
                ×
              </button>
            </div>
            <div
              className="ann-item-text"
              onClick={() => onNavigate(ann)}
              title="点击跳转到原文"
            >
              「{ann.selectedText}」
            </div>
            {editingId === ann.id ? (
              <div className="ann-note-edit">
                <textarea
                  value={noteVal}
                  onChange={e => setNoteVal(e.target.value)}
                  placeholder={t('annotations.addNote')}
                  rows={2}
                  className="ann-note-input"
                />
                <div className="ann-note-actions">
                  <button
                    className="ann-note-save"
                    onClick={() => { onUpdateNote(ann.id, noteVal); setEditingId(null) }}
                  >
                    {t('annotations.save')}
                  </button>
                  <button className="ann-note-cancel" onClick={() => setEditingId(null)}>
                    {t('annotations.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {ann.note && (
                  <div className="ann-note-text">{ann.note}</div>
                )}
                <button
                  className="ann-note-add-btn"
                  onClick={() => { setEditingId(ann.id); setNoteVal(ann.note) }}
                >
                  {ann.note ? t('annotations.editNote') : t('annotations.addNote')}
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