import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES, TRANSLATIONS } from '../utils/constants.js';
import { useLang } from '../context/providers.jsx';

export default function MobileTabs() {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const location = useLocation();

  return (
    <div className="mobile-category-tabs">
      {CATEGORIES.map(cat => (
        <Link
          key={cat.key}
          to={`/category/${cat.key}`}
          className={`mobile-tab-item ${location.pathname === `/category/${cat.key}` ? 'active' : ''}`}
        >
          {t[cat.key.toLowerCase()] || cat.key}
        </Link>
      ))}
    </div>
  );
}
