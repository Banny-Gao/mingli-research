import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { books } from '../data/books';
import { interpContent, skillContent } from '../data/di-tian-sui';
import ReadList from '../components/ReadList';
import SkillGrid from '../components/SkillGrid';

const BookApp: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<'read' | 'skill'>('read');
  const [modalType, setModalType] = useState<'interp' | 'skill' | null>(null);
  const [modalKey, setModalKey] = useState('');

  const book = books.find(b => b.slug === slug);

  if (!book) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, color: '#f0c060', marginBottom: 16 }}>404</div>
          <p style={{ color: '#8080a0', marginBottom: 16 }}>未找到该典籍</p>
          <Link to="/" style={{ display: 'inline-block', padding: '8px 24px', background: '#1a0f38', border: '1px solid #f0c060', color: '#f0c060', borderRadius: 8, fontSize: 14, textDecoration: 'none' }}>
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const openModal = (type: 'interp' | 'skill', key: string) => {
    setModalType(type);
    setModalKey(key);
    setTimeout(() => {
      gsap.fromTo('.modal-card',
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.4)' }
      );
      gsap.fromTo('.modal-backdrop',
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }
      );
    }, 10);
  };

  const closeModal = () => {
    gsap.to('.modal-card', { opacity: 0, scale: 0.95, duration: 0.15, ease: 'power2.in',
      onComplete: () => { setModalType(null); setModalKey(''); }
    });
  };

  const modalTitle = modalType === 'interp' ? `【${modalKey}】原文解读` : `【${modalKey}】技能文件`;
  const modalBody = modalType === 'interp'
    ? interpContent[modalKey] || '<p style="color:#8080a0;text-align:center;padding:40px 0">未找到该篇解读内容</p>'
    : skillContent[modalKey] || '<p style="color:#8080a0;text-align:center;padding:40px 0">未找到该技能内容</p>';

  const proseClass = modalType === 'interp' ? 'prose-interp' : 'prose-skill';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingLeft: 16, paddingRight: 16, paddingBottom: 64 }}>

      {/* Hero */}
      <div style={{ width: '100%', maxWidth: 1100, paddingTop: 64, paddingBottom: 32, textAlign: 'center', borderBottom: '1px solid #1f1f38', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(122,79,170,0.15) 0%, transparent 70%)' }} />
        <div style={{ display: 'inline-block', background: 'rgba(122,79,170,0.2)', border: '1px solid rgba(122,79,170,0.4)', color: '#b090e0', fontSize: 11, letterSpacing: 3, padding: '4px 16px', borderRadius: 20, marginBottom: 16 }}>
          正统子平 · 任铁樵增注本
        </div>
        <h1 style={{ fontSize: 24, color: '#f0c060', fontWeight: 'bold', letterSpacing: 5, marginBottom: 8, textShadow: '0 0 30px rgba(240,192,96,0.3)' }}>
          《{book.title}》
        </h1>
        <p style={{ fontSize: 13, color: '#8080a0', marginBottom: 24 }}>原著：刘伯温（托名）｜注疏：任铁樵｜评注：徐乐吾</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, color: '#f0c060', fontWeight: 'bold' }}>{book.total}</div><div style={{ fontSize: 12, color: '#8080a0', marginTop: 4 }}>全篇章</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, color: '#60a060', fontWeight: 'bold' }}>{book.done}</div><div style={{ fontSize: 12, color: '#8080a0', marginTop: 4 }}>已解读</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, color: '#7a4faa', fontWeight: 'bold' }}>{book.skills.length}</div><div style={{ fontSize: 12, color: '#8080a0', marginTop: 4 }}>技能文件</div></div>
        </div>
      </div>

      {/* Back */}
      <div style={{ width: '100%', maxWidth: 1100, marginBottom: 24 }}>
        <Link to="/" style={{ fontSize: 12, color: '#7090c0', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f0c060'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#7090c0'}>
          ← 返回典籍首页
        </Link>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 1100, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #1f1f38' }}>
        <button onClick={() => setActiveTab('read')} style={{
          background: activeTab === 'read' ? '#1a0f38' : 'transparent',
          border: '1px solid',
          borderColor: activeTab === 'read' ? '#f0c060' : '#2a2a4a',
          color: activeTab === 'read' ? '#f0c060' : '#8080a0',
          padding: '9px 22px', borderRadius: 6, cursor: 'pointer', fontSize: 14, letterSpacing: 1, transition: 'all 0.2s'
        }}>原文解读</button>
        <button onClick={() => setActiveTab('skill')} style={{
          background: activeTab === 'skill' ? '#1a0f38' : 'transparent',
          border: '1px solid',
          borderColor: activeTab === 'skill' ? '#f0c060' : '#2a2a4a',
          color: activeTab === 'skill' ? '#f0c060' : '#8080a0',
          padding: '9px 22px', borderRadius: 6, cursor: 'pointer', fontSize: 14, letterSpacing: 1, transition: 'all 0.2s'
        }}>技能库</button>
      </div>

      {/* Content */}
      <div style={{ width: '100%', maxWidth: 1100, animation: 'fadeUp 0.3s ease-out forwards' }}>
        {activeTab === 'read' && <ReadList book={book} onChapterClick={(n) => openModal('interp', n)} />}
        {activeTab === 'skill' && <SkillGrid book={book} onSkillClick={(n) => openModal('skill', n)} />}
      </div>

      {/* Modal */}
      {modalType && (
        <div className="modal-backdrop" onClick={(e) => {
          if ((e.target as HTMLElement).classList.contains('modal-backdrop')) closeModal();
        }}>
          <div className="modal-card">
            <div className="modal-header">
              <span style={{ fontWeight: 'bold', color: '#f0c060', letterSpacing: 1 }}>{modalTitle}</span>
              <button onClick={closeModal} style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#1a0f38', border: '1px solid #2a2a4a', color: '#8080a0', fontSize: 18, cursor: 'pointer', transition: 'all 0.2s', opacity: 0.7
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.7'}>×</button>
            </div>
            <div className="modal-body">
              <div className={proseClass} dangerouslySetInnerHTML={{ __html: modalBody }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookApp;