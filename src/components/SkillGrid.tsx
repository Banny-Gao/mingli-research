import React from 'react'
import type { Book } from '../data/book-types'
import { ArrowRight } from 'lucide-react'
import { skillDisplayNames } from '../data/ditiansui-site'

interface Props {
  book: Book
  onSkillClick: (name: string) => void
}

const SkillGrid: React.FC<Props> = ({ book, onSkillClick }) => {
  return (
    <div>
      <div className="section-header">
        <span className="section-title">技能库</span>
        <span className="section-badge">共{book.skills.length}个技能文件</span>
      </div>
      <div className="skill-grid">
        {book.skills.map(sk => {
          const displayName = skillDisplayNames[sk.name] || sk.name
          return (
            <div key={sk.name} onClick={() => onSkillClick(sk.name)} className="skill-card">
              <div className="section-badge mb-2 inline-block">
                {sk.name}
              </div>
              <div className="text-[15px] font-bold text-[var(--color-gold)] mb-2">
                {displayName}
              </div>
              <div className="flex items-center gap-0.5 text-xs text-[#5070a0]">skills/{sk.name}/SKILL.md <ArrowRight size={11} /></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SkillGrid
