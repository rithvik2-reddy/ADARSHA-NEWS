import React from 'react';
import { Link } from 'react-router-dom';
import { safeImg, getCategoryColor, formatDate } from '../utils/helpers.js';
import { TRANSLATIONS } from '../utils/constants.js';
import { useLang } from '../context/providers.jsx';

export function NewsCard({ news, style }) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  if (!news) return null;
  const color = getCategoryColor(news.category);
  return (
    <Link to={`/article/${news.id}`} className="news-card" style={style}>
      <div className="card-img" style={{ aspectRatio: '16/10' }}>
        <span className="cat-tag" style={{ background: color, position: 'absolute', top: 10, left: 10, zIndex: 2 }}>{t[news.category?.toLowerCase()] || news.category}</span>
        <img src={safeImg(news.imageUrl)} alt={news.title} loading="lazy" />
      </div>
      <div className="card-body">
        <h3 className="card-title">{news.title}</h3>
        <div className="card-meta">
          <span>🕐 {formatDate(news.pubDate, lang)}</span>
          <span className="card-readmore">{t.readMore} →</span>
        </div>
      </div>
    </Link>
  );
}

export function CompactCard({ news }) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  if (!news) return null;
  const color = getCategoryColor(news.category);
  return (
    <Link to={`/article/${news.id}`} className="compact-card">
      <img src={safeImg(news.imageUrl)} alt={news.title} loading="lazy" />
      <div className="compact-card-body">
        <span className="cat-tag" style={{ background: color, marginBottom: 6 }}>{t[news.category?.toLowerCase()] || news.category}</span>
        <div className="compact-card-title">{news.title}</div>
        <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 6 }}>🕐 {formatDate(news.pubDate, lang)}</div>
      </div>
    </Link>
  );
}

export function SkeletonCard() {
  return (
    <div className="news-card">
      <div className="skel" style={{ aspectRatio: '16/10', width: '100%' }} />
      <div className="card-body">
        <div className="skel" style={{ height: 14, width: '60%', marginBottom: 8 }} />
        <div className="skel" style={{ height: 18, marginBottom: 6 }} />
        <div className="skel" style={{ height: 18, width: '80%', marginBottom: 6 }} />
        <div className="skel" style={{ height: 18, width: '70%' }} />
      </div>
    </div>
  );
}

export function SkeletonCompact() {
  return (
    <div className="compact-card">
      <div className="skel" style={{ width: 100, height: 72, borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skel" style={{ height: 14, width: '40%', marginBottom: 8 }} />
        <div className="skel" style={{ height: 16, marginBottom: 6 }} />
        <div className="skel" style={{ height: 16, width: '70%' }} />
      </div>
    </div>
  );
}
