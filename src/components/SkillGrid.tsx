import React from 'react';
import { Book } from '../data/books';

interface Props {
  book: Book;
  onSkillClick: (name: string) => void;
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
};

const SkillGrid: React.FC<Props> = ({ book, onSkillClick }) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 'bold', color: '#e8a040', letterSpacing: 1 }}>技能库</span>
        <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 10, background: 'rgba(122,79,170,0.15)', color: '#a090d0', border: '1px solid rgba(122,79,170,0.3)' }}>
          共{book.skills.length}个技能文件
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {book.skills.map((sk) => {
          const info = skillDesc[sk.name] || { desc: '', tag: sk.name };
          return (
            <div key={sk.name} onClick={() => onSkillClick(sk.name)}
              style={{
                background: '#101828', border: '1px solid #1a1a30', borderRadius: 6,
                padding: '14px 16px', cursor: 'pointer', transition: 'all 0.2s', display: 'block'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#7a4faa';
                (e.currentTarget as HTMLElement).style.background = '#141e30';
                (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#1a1a30';
                (e.currentTarget as HTMLElement).style.background = '#101828';
                (e.currentTarget as HTMLElement).style.transform = '';
              }}>
              <div style={{ fontSize: 12, padding: '2px 8px', borderRadius: 3, marginBottom: 8, display: 'inline-block', background: 'rgba(122,79,170,0.15)', color: '#a090d0', border: '1px solid rgba(122,79,170,0.3)' }}>
                {info.tag}
              </div>
              <div style={{ fontSize: 15, fontWeight: 'bold', color: '#f0c060', marginBottom: 4 }}>{info.tag}篇 · 技能</div>
              <div style={{ fontSize: 12, color: '#8080a0', lineHeight: 1.5, marginBottom: 8 }}>{info.desc}</div>
              <div style={{ fontSize: 11, color: '#5070a0' }}>skills/{sk.name}/SKILL.md →</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillGrid;