import React from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { books } from '../data/books';

const Landing: React.FC = () => {
  React.useEffect(() => {
    const cards = document.querySelectorAll('.book-card');
    gsap.fromTo(cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out', delay: 0.1 }
    );
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, paddingBottom: 64, paddingLeft: 16, paddingRight: 16 }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 64, position: 'relative', overflow: 'hidden', width: '100%', maxWidth: 1100 }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, pointerEvents: 'none', background: 'radial-gradient(ellipse, rgba(122,79,170,0.15) 0%, transparent 70%)' }} />
        <div style={{ display: 'inline-block', background: 'rgba(122,79,170,0.2)', border: '1px solid rgba(122,79,170,0.4)', color: '#b090e0', fontSize: 11, letterSpacing: 3, padding: '4px 16px', borderRadius: 20, marginBottom: 16 }}>
          正统子平学术
        </div>
        <h1 style={{ fontSize: 30, color: '#f0c060', letterSpacing: 6, marginBottom: 10, fontWeight: 'bold', textShadow: '0 0 30px rgba(240,192,96,0.3)' }}>
          命理学术中心
        </h1>
        <p style={{ fontSize: 13, color: '#8080a0' }}>经典原文 · 专业注解 · 学术整理</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 48, marginBottom: 64 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, color: '#f0c060', fontWeight: 'bold' }}>{books.length}</div>
          <div style={{ fontSize: 12, color: '#8080a0', marginTop: 4 }}>典籍</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, color: '#f0c060', fontWeight: 'bold' }}>{books.reduce((s, b) => s + b.total, 0)}</div>
          <div style={{ fontSize: 12, color: '#8080a0', marginTop: 4 }}>总篇章</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, color: '#f0c060', fontWeight: 'bold' }}>{books.reduce((s, b) => s + b.done, 0)}</div>
          <div style={{ fontSize: 12, color: '#8080a0', marginTop: 4 }}>已解读</div>
        </div>
      </div>

      {/* Book Grid */}
      <div style={{ width: '100%', maxWidth: 900, display: 'grid', gap: 20 }}>
        {books.map((book) => (
          <Link key={book.slug} to={`/${book.slug}`} style={{ display: 'block', background: '#101828', border: '1px solid #1a1a30', borderRadius: 12, padding: 28, textDecoration: 'none', transition: 'all 0.25s', cursor: 'pointer' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#f0c060';
              (e.currentTarget as HTMLElement).style.background = '#141e30';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(240,192,96,0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#1a1a30';
              (e.currentTarget as HTMLElement).style.background = '#101828';
              (e.currentTarget as HTMLElement).style.transform = '';
              (e.currentTarget as HTMLElement).style.boxShadow = '';
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, color: '#f0c060', fontWeight: 'bold', letterSpacing: 2, marginBottom: 8 }}>《{book.title}》</h2>
                <p style={{ fontSize: 13, color: '#8080a0' }}>原著：刘伯温（托名）｜注疏：任铁樵</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, color: '#f0c060', fontWeight: 'bold' }}>{book.total}</div>
                <div style={{ fontSize: 12, color: '#8080a0' }}>篇章</div>
              </div>
            </div>
            <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', background: '#1a1a30' }}>
              <div style={{ height: '100%', borderRadius: 3, width: `${book.total > 0 ? (book.done / book.total * 100) : 0}%`, background: 'linear-gradient(90deg, #7a4faa, #f0c060)', transition: 'width 0.5s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#6060a0' }}>
              <span>已解读 {book.done} 篇</span>
              <span>{book.total > 0 ? Math.round(book.done / book.total * 100) : 0}% 完成</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 80, textAlign: 'center', fontSize: 12, color: '#505070', borderTop: '1px solid #1f1f38', paddingTop: 20, width: '100%', maxWidth: 1100 }}>
        Hermes Agent · 学术整理 · <a href="https://www.iwzbz.com" target="_blank" rel="noreferrer" style={{ color: '#7090c0' }}>iwzbz.com</a>
      </div>
    </div>
  );
};

export default Landing;