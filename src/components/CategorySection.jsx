import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NewsCard, SkeletonCard } from './NewsCard.jsx';
import { TRANSLATIONS } from '../utils/constants.js';
import { useLang } from '../context/providers.jsx';

export default function CategorySection({ title, titleTe, news, loading, catKey, color }) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const label = lang === 'te' ? titleTe : title;

  return (
    <section style={{ marginTop: 48 }}>
      <div className="section-head">
        <h2 className="section-title" style={{ '--accent-color': color || 'var(--primary)' }}>
          {label}
        </h2>
        {catKey && (
          <Link to={`/category/${catKey}`} className="view-all">
            {t.viewAll} <span>→</span>
          </Link>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
        {loading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : news.slice(0, 4).map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <NewsCard news={n} />
            </motion.div>
          ))
        }
      </div>
    </section>
  );
}
