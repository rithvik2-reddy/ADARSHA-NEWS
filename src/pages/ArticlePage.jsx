import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNews, useLang } from '../context/providers.jsx';
import { TRANSLATIONS } from '../utils/constants.js';
import { safeImg, sanitizeHtml, formatDate, readingTime, getCategoryColor } from '../utils/helpers.js';
import { CompactCard } from '../components/NewsCard.jsx';
import toast from 'react-hot-toast';

function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setProgress(Math.min(100, pct));
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return <div className="reading-progress" style={{ width: `${progress}%` }} />;
}

export default function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allNews, settings } = useNews();
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const found = allNews.find(n => n.id === id);
    if (found) { setArticle(found); setLoading(false); return; }
    setLoading(true);
    axios.get(`/news-data.json?t=${Date.now()}`)
      .then(r => { const d = Array.isArray(r.data) ? r.data : []; const f = d.find(n => n.id === id); if (f) setArticle(f); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, allNews]);

  const html = useMemo(() => sanitizeHtml(article?.articleContent || ''), [article?.articleContent]);
  const related = useMemo(() => allNews.filter(n => n.category === article?.category && n.id !== id).slice(0, 4), [allNews, article, id]);
  const latest = allNews.filter(n => n.id !== id).slice(0, 8);
  const ads = settings?.newsAds;
  const catColor = getCategoryColor(article?.category);
  const readTime = readingTime(html);

  const share = (platform) => {
    const url = window.location.href;
    const text = encodeURIComponent(article?.title || '');
    if (platform === 'whatsapp') window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(url)}`, '_blank');
    else if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
    else if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    else { navigator.clipboard.writeText(url); toast.success('Link copied!'); }
  };

  if (loading) return (
    <>
      <ReadingProgress />
      <div className="container" style={{ maxWidth: 1000, paddingTop: 40, paddingBottom: 80 }}>
        <div className="skel" style={{ height: 30, width: 120, marginBottom: 24, borderRadius: 20 }} />
        <div className="skel" style={{ height: 40, width: '90%', marginBottom: 16, borderRadius: 8 }} />
        <div className="skel" style={{ height: 40, width: '70%', marginBottom: 32, borderRadius: 8 }} />
        <div className="skel" style={{ height: 480, width: '100%', marginBottom: 40, borderRadius: 16 }} />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skel" style={{ height: 20, width: i % 2 === 0 ? '100%' : '85%', marginBottom: 16, borderRadius: 4 }} />
        ))}
      </div>
    </>
  );

  if (!article) return (
    <div className="container" style={{ paddingTop: 100, paddingBottom: 120, textAlign: 'center' }}>
      <div style={{ fontSize: '5rem', marginBottom: 24 }}>📭</div>
      <h2 style={{ color: 'var(--text)', fontSize: '2rem', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>{t.notFound || 'Article Not Found'}</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 32 }}>The article you are looking for does not exist or has been removed.</p>
      <button onClick={() => navigate(-1)} style={{ padding: '12px 32px', background: 'var(--primary-gradient)', color: '#fff', border: 'none', borderRadius: 30, fontWeight: 800, cursor: 'pointer', fontSize: '1rem', boxShadow: '0 4px 12px rgba(211,47,47,0.3)' }}>{t.back || 'Go Back'}</button>
    </div>
  );

  return (
    <>
      <ReadingProgress />
      <Helmet>
        <title>{article.title} | ఆదర్శ వార్తలు</title>
        <meta name="description" content={article.title} />
        <meta property="og:title" content={article.title} />
        <meta property="og:image" content={safeImg(article.imageUrl)} />
      </Helmet>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div className="article-layout">
          
          {/* MAIN ARTICLE */}
          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="article-container">
            <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 700, marginBottom: 24, fontSize: '.85rem', cursor: 'pointer', padding: '8px 16px', borderRadius: 20, transition: 'var(--transition)' }} className="back-btn">
              ← {t.back || 'Back'}
            </button>

            <div>
              <span className="cat-tag" style={{ background: catColor, marginBottom: 16, fontSize: '0.75rem', padding: '6px 16px' }}>{t[article.category?.toLowerCase()] || article.category}</span>
            </div>

            <h1 className="article-title">{article.title}</h1>

            <div className="article-meta">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 900, fontSize: '1.2rem' }}>A</div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '0.95rem' }}>Adarsha Desk</div>
                  <div style={{ fontSize: '0.8rem' }}>{t.editorial || 'Editorial Team'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span>🕐 {formatDate(article.pubDate, lang)}</span>
                <span style={{ color: 'var(--border)' }}>|</span>
                <span>📖 {readTime} min read</span>
              </div>
            </div>

            <div className="share-bar">
              <span style={{ fontWeight: 700, marginRight: 8, color: 'var(--text)' }}>Share:</span>
              <button className="share-btn whatsapp" onClick={() => share('whatsapp')}>💬 WhatsApp</button>
              <button className="share-btn twitter" onClick={() => share('twitter')}>🐦 Twitter</button>
              <button className="share-btn facebook" onClick={() => share('facebook')}>📘 Facebook</button>
              <button className="share-btn copy" onClick={() => share('copy')}>🔗 Copy Link</button>
            </div>

            <img src={safeImg(article.imageUrl)} alt={article.title} className="article-hero" />

            <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />

            {/* RELATED NEWS */}
            {related.length > 0 && (
              <div style={{ marginTop: 64, paddingTop: 32, borderTop: '2px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', marginBottom: 24, fontFamily: 'var(--font-heading)' }}>
                  Related Stories
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                  {related.map((n, i) => (
                    <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                      <CompactCard news={n} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.article>

          {/* SIDEBAR */}
          <aside className="article-sidebar">
            {ads?.sidebar?.imageUrl ? (
              <a href={ads.sidebar.linkUrl || '#'} target="_blank" rel="noopener noreferrer" className="sidebar-ad-box">
                <img src={ads.sidebar.imageUrl.startsWith('http') ? ads.sidebar.imageUrl : `https://adarshapaper.in${ads.sidebar.imageUrl}`} alt="Advertisement" />
              </a>
            ) : (
              <div className="sidebar-ad-box placeholder">
                <span>Advertisement</span>
                <div className="placeholder-box">Ad Space</div>
              </div>
            )}
            
            <div className="latest-sidebar-widget">
              <div className="widget-header">
                <h4><span className="live-dot"></span>{t.latest || 'Latest Updates'}</h4>
              </div>
              <div className="widget-content">
                {latest.map(n => <CompactCard key={n.id} news={n} />)}
              </div>
            </div>
          </aside>
          
        </div>
      </div>

      <style>{`
        .article-layout {
          display: grid;
          grid-template-columns: 2.5fr 1fr;
          gap: 40px;
          align-items: start;
        }
        .back-btn:hover {
          background: var(--surface) !important;
          border-color: var(--primary) !important;
          color: var(--primary) !important;
          transform: translateX(-4px);
        }
        .article-sidebar {
          position: sticky;
          top: 100px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .sidebar-ad-box {
          display: block;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .sidebar-ad-box img {
          width: 100%;
          display: block;
        }
        .sidebar-ad-box.placeholder {
          padding: 16px;
          text-align: center;
        }
        .sidebar-ad-box.placeholder span {
          font-size: 0.65rem;
          text-transform: uppercase;
          color: var(--muted);
          letter-spacing: 1px;
          margin-bottom: 8px;
          display: block;
        }
        .placeholder-box {
          height: 300px;
          background: var(--surface2);
          border: 1px dashed var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          color: var(--muted);
        }
        .latest-sidebar-widget {
          background: var(--surface);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }
        .widget-header {
          padding: 16px 20px;
          background: var(--surface2);
          border-bottom: 2px solid var(--primary);
        }
        .widget-header h4 {
          font-size: 1.1rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }
        .widget-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media(max-width: 1024px) {
          .article-layout { grid-template-columns: 2fr 1fr; gap: 24px; }
        }
        @media(max-width: 900px) {
          .article-layout { grid-template-columns: 1fr; }
          .article-sidebar { display: none; }
          .article-container { padding: 20px; margin-top: 16px; border: none; box-shadow: none; background: transparent; }
        }
      `}</style>
    </>
  );
}
