import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES, TRANSLATIONS } from '../utils/constants.js';
import { useLang } from '../context/providers.jsx';

export default function MobileTabs() {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const location = useLocation();

  return (
    <div className="mobile-category-tabs" style={{
      display: 'flex',
      overflowX: 'auto',
      gap: 12,
      padding: '8px 0',
      borderBottom: '1px solid var(--border)'
    }}>
      {CATEGORIES.map(cat => (
        <Link
          key={cat.key}
          to={`/category/${cat.key}`}
          className="mobile-tab-item"
          style={{
            whiteSpace: 'nowrap',
            color: 'var(--text)',
            padding: '4px 8px',
            borderRadius: 4,
            fontWeight: 600,
            background: location.pathname === `/category/${cat.key}` ? 'var(--primary-gradient)' : 'transparent',
            color: location.pathname === `/category/${cat.key}` ? '#fff' : 'inherit'
          }}
        >
          {t[cat.key.toLowerCase()] || cat.key}
        </Link>
      ))}
    </div>
  );
}
