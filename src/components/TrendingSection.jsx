import React from 'react';
import { Link } from 'react-router-dom';
import { safeImg } from '../utils/helpers.js';
import { TRANSLATIONS } from '../utils/constants.js';
import { useLang } from '../context/providers.jsx';

export default function TrendingSection({ news }) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const items = news.slice(0, 10);

  return (
    <section style={{ marginTop: 48 }}>
      <div className="section-head">
        <h2 className="section-title">🔥 {t.trending}</h2>
      </div>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
        {items.map((n, i) => (
          <Link key={n.id} to={`/article/${n.id}`} style={{ minWidth: 180, maxWidth: 180, flexShrink: 0, textDecoration: 'none' }}>
            <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '1' }}>
              <img src={safeImg(n.imageUrl, n.category)} alt={n.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }} loading="lazy" />
              <div style={{ position: 'absolute', top: 8, left: 8, width: 28, height: 28, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '.85rem', color: '#fff' }}>{i + 1}</div>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 40%,rgba(0,0,0,.85))', display: 'flex', alignItems: 'flex-end', padding: '10px 8px' }}>
                <span style={{ color: '#fff', fontSize: '.72rem', fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>{n.title}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
