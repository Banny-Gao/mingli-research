import React from 'react';
import { Book } from '../data/books';

interface Props {
  book: Book;
  onChapterClick: (name: string) => void;
}

const ReadList: React.FC<Props> = ({ book, onChapterClick }) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 'bold', color: '#e8a040', letterSpacing: 1 }}>篇目总览</span>
        <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 10, background: 'rgba(122,79,170,0.15)', color: '#a090d0', border: '1px solid rgba(122,79,170,0.3)' }}>
          共{book.total}篇 · 已解读{book.done}篇
        </span>
      </div>
      <div style={{ display: 'grid', gap: 2 }}>
        {book.chapters.map((ch, i) => {
          const num = String(i + 1).padStart(2, '0');
          return (
            <div key={ch.name}
              onClick={() => ch.isDone && onChapterClick(ch.name)}
              style={{
                display: 'flex', alignItems: 'center', padding: '7px 12px',
                background: ch.isDone ? '#101828' : '#0d0d1a',
                border: '1px solid transparent',
                borderRadius: 5, marginBottom: 2, cursor: ch.isDone ? 'pointer' : 'default',
                borderLeft: ch.isDone ? '3px solid #60a060' : '3px solid transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (ch.isDone) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#2a2a4a';
                  (e.currentTarget as HTMLElement).style.background = '#141e30';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                (e.currentTarget as HTMLElement).style.background = ch.isDone ? '#101828' : '#0d0d1a';
              }}>
              <div style={{ minWidth: 30, textAlign: 'center', fontSize: 12, color: '#6060a0' }}>{num}</div>
              <div style={{ flex: 1, fontSize: 14, color: ch.isDone ? '#c8c0b0' : '#505070' }}>{ch.name}</div>
              {ch.isDone && <div style={{ fontSize: 12, color: '#60a060', minWidth: 50, textAlign: 'right' }}>✅</div>}
              {ch.isDone && (
                <button onClick={(e) => { e.stopPropagation(); onChapterClick(ch.name); }}
                  style={{
                    fontSize: 12, padding: '3px 10px', borderRadius: 4, marginLeft: 8,
                    color: '#7090c0', border: '1px solid #2a2a4a', background: 'transparent',
                    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#f0c060';
                    (e.currentTarget as HTMLElement).style.color = '#f0c060';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#2a2a4a';
                    (e.currentTarget as HTMLElement).style.color = '#7090c0';
                  }}>
                  查看解读
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReadList;