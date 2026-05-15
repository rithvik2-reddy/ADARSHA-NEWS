import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useNews, useLang } from '../context/providers.jsx';
import { CATEGORIES, TRANSLATIONS } from '../utils/constants.js';
import { NewsCard, SkeletonCard } from '../components/NewsCard.jsx';

export default function SearchPage() {
  const { allNews, loading } = useNews();
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [catFilter, setCatFilter] = useState('');

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allNews.filter(n => {
      const matchQ = !q || n.title?.toLowerCase().includes(q) || n.articleContent?.toLowerCase().includes(q);
      const matchC = !catFilter || n.category === catFilter;
      return matchQ && matchC;
    });
  }, [allNews, query, catFilter]);

  return (
    <>
      <Helmet><title>{t.search} | ఆదర్శ వార్తలు</title></Helmet>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 24, color: 'var(--text)' }}>🔍 {t.search}</h1>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setParams({ q: e.target.value }); }}
            placeholder={lang === 'te' ? 'వార్తలు వెతకండి...' : 'Search news...'}
            style={{ flex: 1, minWidth: 200, padding: '12px 18px', background: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 40, fontSize: '1rem', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font)' }}
          />
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: '12px 18px', background: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 40, color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '.9rem', cursor: 'pointer' }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{lang === 'te' ? c.te : c.key}</option>)}
          </select>
        </div>

        {query && <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: '.9rem' }}>{results.length} results for "<strong>{query}</strong>"</p>}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : results.length === 0 && query ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
            <p>{lang === 'te' ? 'ఫలితాలు లేవు' : 'No results found'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {(query || catFilter ? results : allNews.slice(0, 40)).map(n => <NewsCard key={n.id} news={n} />)}
          </div>
        )}
      </div>
    </>
  );
}
