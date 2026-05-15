import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNews, useLang } from '../context/providers.jsx';
import { CATEGORIES } from '../utils/constants.js';
import { NewsCard, SkeletonCard } from '../components/NewsCard.jsx';

export default function CategoryPage() {
  const { cat } = useParams();
  const { allNews, loading } = useNews();
  const { lang } = useLang();
  
  const catInfo = CATEGORIES.find(c => c.key === cat);
  const label = lang === 'te' ? (catInfo?.te || cat) : cat;
  const news = useMemo(() => allNews.filter(n => n.category === cat), [allNews, cat]);

  return (
    <>
      <Helmet>
        <title>{label} | ఆదర్శ వార్తలు</title>
      </Helmet>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 5, height: 32, background: catInfo?.color || 'var(--primary)', borderRadius: 4 }} />
            <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 900, color: 'var(--text)' }}>{label}</h1>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>{news.length} {lang === 'te' ? 'వార్తలు' : 'articles'}</p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : news.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
            <p>{lang === 'te' ? 'ఈ విభాగంలో వార్తలు లేవు' : 'No articles in this category'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {news.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.06 }}>
                <NewsCard news={n} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
