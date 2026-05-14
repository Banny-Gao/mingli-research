import React from 'react'
import { Book } from '../data/books'

interface Props {
  book: Book
  onSkillClick: (name: string) => void
}

const skillDesc: Record<string, { desc: string; tag: string }> = {
  tiandao: { desc: '天元地元人元、阴阳为本、三元论核心定理', tag: '天道' },
  kundao: { desc: '地支刚柔、五气偏全、十二宫生旺死绝', tag: '坤道' },
  rendao: { desc: '顺悖吉凶、五行偏枯、中和为贵', tag: '人道' },
  zhiming: { desc: '顺逆之机、用神不可伤、旺极宜泄', tag: '知命' },
  liqi: { desc: '进退之机、旺相休囚、进气退气、衰旺辨法', tag: '理气' },
  peihe: { desc: '干支配合定祸福、用神不拘名、两造对比', tag: '配合' },
  tiangan: { desc: '十干性情、五阳从气五阴从势、十干专论', tag: '天干' },
  dizhi: { desc: '阳动阴静、六冲合局、藏干主次、生方旺方', tag: '地支' },
  bage: { desc: '八格取用、正格变格判别、杂格批判、格局分析', tag: '八格' },
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
          const info = skillDesc[sk.name] || { desc: '', tag: sk.name }
          return (
            <div key={sk.name} onClick={() => onSkillClick(sk.name)} className="skill-card">
              <div className="section-badge" style={{ marginBottom: 8, display: 'inline-block' }}>
                {info.tag}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 'bold',
                  color: 'var(--color-gold)',
                  marginBottom: 4,
                }}
              >
                {info.tag}篇 · 技能
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-dim)',
                  lineHeight: 1.5,
                  marginBottom: 8,
                }}
              >
                {info.desc}
              </div>
              <div style={{ fontSize: 11, color: '#5070a0' }}>skills/{sk.name}/SKILL.md →</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SkillGrid
