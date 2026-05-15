import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { safeImg, getCategoryColor } from '../utils/helpers.js';
import { TRANSLATIONS } from '../utils/constants.js';
import { useLang } from '../context/providers.jsx';

export default function HeroSlider({ news }) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const slides = news.slice(0, 5);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIdx(i => (i + 1) % slides.length), [slides.length]);
  const prev = () => setIdx(i => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next, slides.length]);

  if (!slides.length) return (
    <div style={{ height: 480, background: 'var(--surface2)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div className="skel" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius)', background: 'linear-gradient(90deg, var(--surface2) 25%, var(--border) 50%, var(--surface2) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    </div>
  );

  const cur = slides[idx];
  const catColor = getCategoryColor(cur.category);

  return (
    <div className="hero-slider-container" style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', maxHeight: 520 }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', inset: 0 }}>
          <Link to={`/article/${cur.id}`} className="hero-slide" style={{ height: '100%', display: 'block' }}>
            <img src={safeImg(cur.imageUrl, cur.category)} alt={cur.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="eager" />
            <div className="hero-overlay">
              <span className="cat-tag" style={{ background: catColor }}>{t[cur.category?.toLowerCase()] || cur.category}</span>
              <h2 style={{ fontSize: 'clamp(1.1rem,2.5vw,1.9rem)', maxWidth: 640 }}>{cur.title}</h2>
              <div style={{ color: 'rgba(255,255,255,.7)', fontSize: '.8rem', marginTop: 8 }}>
                🕐 {new Date(cur.pubDate).toLocaleString(lang === 'te' ? 'te-IN' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* PREV / NEXT */}
      <button onClick={prev} style={btnStyle('left')}>‹</button>
      <button onClick={next} style={btnStyle('right')}>›</button>

      {/* DOTS */}
      <div style={{ position: 'absolute', bottom: 16, right: 20, display: 'flex', gap: 6 }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`hero-dot${i === idx ? ' active' : ''}`} />
        ))}
      </div>

      {/* THUMBNAIL STRIP */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 220, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }} className="hero-thumbs">
        {slides.map((n, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{ flex: 1, border: 'none', padding: 0, cursor: 'pointer', position: 'relative', overflow: 'hidden', opacity: i === idx ? 1 : .6, transition: 'opacity .3s', outline: i === idx ? '2px solid #DC2626' : 'none' }}>
            <img src={safeImg(n.imageUrl, n.category)} alt={n.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'flex-end', padding: '6px 8px' }}>
              <span style={{ color: '#fff', fontSize: '.65rem', fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.title}</span>
            </div>
          </button>
        ))}
      </div>

      <style>{`
        .hero-slider-container { aspectRatio: 16/7; }
        @media(max-width:768px){
          .hero-slider-container { aspectRatio: 16/10; }
          .hero-thumbs { display:none !important; }
          .hero-overlay h2 { font-size: 1.1rem !important; }
        }
      `}</style>
    </div>
  );
}

const btnStyle = (side) => ({
  position: 'absolute', [side]: 16, top: '50%', transform: 'translateY(-50%)',
  background: 'rgba(0,0,0,.5)', border: 'none', color: '#fff', width: 44, height: 44,
  borderRadius: '50%', fontSize: '1.5rem', display: 'flex', alignItems: 'center',
  justifyContent: 'center', cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)',
  transition: 'background .2s', lineHeight: 1,
});
