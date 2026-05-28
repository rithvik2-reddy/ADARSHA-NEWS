import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNews, useLang } from '../context/providers.jsx';
import { CATEGORIES, TRANSLATIONS } from '../utils/constants.js';
import HeroSlider from '../components/HeroSlider.jsx';
import TrendingSection from '../components/TrendingSection.jsx';
import CategorySection from '../components/CategorySection.jsx';
import { CompactCard, SkeletonCompact, NewsCard } from '../components/NewsCard.jsx';

const HOME_CATS = ['Politics', 'Telangana', 'AndhraPradesh', 'India', 'World', 'Sports', 'Cinema', 'Business', 'Technology'];

export default function HomePage() {
  const { allNews, loading, settings } = useNews();
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];

  const catMap = useMemo(() => {
    const m = {};
    allNews.forEach(n => {
      if (!m[n.category]) m[n.category] = [];
      m[n.category].push(n);
    });
    return m;
  }, [allNews]);

  return (
    <>
      <Helmet>
        <title>ఆదర్శ వార్తలు | తాజా తెలుగు వార్తలు - Adarsha News</title>
        <meta name="description" content="తెలంగాణ, ఆంధ్రప్రదేశ్, జాతీయ, అంతర్జాతీయ తాజా వార్తలు. Latest Telugu News." />
      </Helmet>

      <main className="home-main">


        <div className="container" style={{ paddingTop: 12, paddingBottom: 40 }}>
          
          {/* HERO SECTION - PREMIUM LAYOUT */}
          <div className="hero-grid">
            <div className="hero-slider-wrapper">
              <HeroSlider news={loading ? [] : allNews.slice(0, 5)} />
            </div>

            {/* LATEST UPDATES WIDGET */}
            <div className="latest-widget">
              <div className="latest-widget-header">
                <h3><span className="live-dot"></span>{t.latest || 'Latest Updates'}</h3>
                <div className="latest-line"></div>
              </div>
              <div className="latest-widget-content">
                {loading
                  ? Array(5).fill(0).map((_, i) => <SkeletonCompact key={i} />)
                  : allNews.slice(0, 15).map((n, i) => (
                      <motion.div key={n.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                        <CompactCard news={n} />
                      </motion.div>
                    ))
                }
              </div>
            </div>
          </div>
        </div>

        {settings?.newsAds?.banner?.imageUrl && (
          <div className="container" style={{ marginBottom: 30, display: 'flex', justifyContent: 'center' }}>
            <a href={settings.newsAds.banner.linkUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', maxWidth: '970px' }}>
              <img 
                src={settings.newsAds.banner.imageUrl.startsWith('http') ? settings.newsAds.banner.imageUrl : `https://adarshapaper.in${settings.newsAds.banner.imageUrl}?v=${Date.now()}`} 
                alt="Banner Advertisement" 
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }} 
              />
            </a>
          </div>
        )}

        {/* TRENDING SECTION - FULL WIDTH BACKGROUND */}
        {!loading && allNews.length > 0 && (
          <div className="trending-wrapper">
            <div className="container">
              <TrendingSection news={allNews.slice(0, 20)} />
            </div>
          </div>
        )}

        <div className="container" style={{ paddingBottom: 60 }}>
          {/* CATEGORY GRID LAYOUT */}
          <div className="content-layout">
            <div className="main-content">
              {HOME_CATS.slice(0, 5).map(cat => {
                const catInfo = CATEGORIES.find(c => c.key === cat);
                const catNews = catMap[cat] || [];
                if (!loading && catNews.length === 0) return null;
                return (
                  <CategorySection
                    key={cat}
                    title={cat}
                    titleTe={catInfo?.te || cat}
                    news={catNews}
                    loading={loading}
                    catKey={cat}
                    color={catInfo?.color}
                  />
                );
              })}
            </div>
            
            <div className="sidebar">
              {/* ADVERTISEMENT WIDGET */}
              <div className="sidebar-ad" style={{ padding: settings?.newsAds?.sidebar?.imageUrl ? '0' : '16px' }}>
                {settings?.newsAds?.sidebar?.imageUrl ? (
                  <a href={settings.newsAds.sidebar.linkUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'block', overflow: 'hidden' }}>
                    <img 
                      src={settings.newsAds.sidebar.imageUrl.startsWith('http') ? settings.newsAds.sidebar.imageUrl : `https://adarshapaper.in${settings.newsAds.sidebar.imageUrl}?v=${Date.now()}`} 
                      alt="Advertisement" 
                      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }} 
                    />
                  </a>
                ) : (
                  <>
                    <span className="ad-label">Advertisement</span>
                    <div className="ad-placeholder">Ad Space (300x250)</div>
                  </>
                )}
              </div>

              {/* REMAINING CATEGORIES */}
              {HOME_CATS.slice(5).map(cat => {
                const catInfo = CATEGORIES.find(c => c.key === cat);
                const catNews = catMap[cat] || [];
                if (!loading && catNews.length === 0) return null;
                return (
                  <CategorySection
                    key={cat}
                    title={cat}
                    titleTe={catInfo?.te || cat}
                    news={catNews}
                    loading={loading}
                    catKey={cat}
                    color={catInfo?.color}
                  />
                );
              })}
            </div>
          </div>

          {/* MORE STORIES */}
          {!loading && allNews.length > 5 && (
            <section style={{ marginTop: 60 }}>
              <div className="section-head" style={{ justifyContent: 'center' }}>
                <h2 className="section-title" style={{ padding: '0 20px' }}>{t.moreStories || 'More Top Stories'}</h2>
              </div>
              <div className="more-stories-grid">
                {allNews.slice(0, 40).map(n => <NewsCard key={n.id} news={n} />)}
              </div>
            </section>
          )}

        </div>
      </main>

      <style>{`
        .home-main { background: var(--bg); }
        .hero-grid {
          display: grid;
          grid-template-columns: 2.2fr 1fr;
          gap: 24px;
          align-items: stretch;
          margin-bottom: 24px;
        }
        .hero-slider-wrapper { height: 100%; min-height: 400px; border-radius: var(--radius); overflow: hidden; }
        
        .latest-widget {
          background: var(--surface);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          height: 100%;
          max-height: 520px;
        }
        .latest-widget-header {
          padding: 16px 20px;
          background: var(--surface2);
          border-bottom: 2px solid var(--primary);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .latest-widget-header h3 {
          font-size: 1.1rem;
          font-weight: 900;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          animation: pulse-badge 1.5s infinite;
        }
        .latest-line {
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .latest-widget-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          flex: 1;
        }
        .latest-widget-content::-webkit-scrollbar { width: 4px; }
        .latest-widget-content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        
        .trending-wrapper {
          background: var(--surface2);
          padding: 40px 0;
          margin: 40px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        
        .content-layout {
          display: grid;
          grid-template-columns: 2.2fr 1fr;
          gap: 40px;
          align-items: start;
        }
        
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 40px;
          position: sticky;
          top: 100px;
        }
        
        .sidebar-ad {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 16px;
          text-align: center;
        }
        .ad-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          color: var(--muted);
          letter-spacing: 1px;
          display: block;
          margin-bottom: 8px;
        }
        .ad-placeholder {
          width: 100%;
          height: 250px;
          background: var(--surface);
          border: 1px dashed var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          font-size: 0.9rem;
          border-radius: 4px;
        }
        
        .more-stories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        @media(max-width: 1024px) {
          .hero-grid { grid-template-columns: 1.5fr 1fr; }
          .content-layout { grid-template-columns: 1.5fr 1fr; gap: 24px; }
        }
        @media(max-width: 768px) {
          .mobile-tabs { display: flex !important; }
          .hero-grid { grid-template-columns: 1fr; display: flex; flex-direction: column; }
          .hero-slider-wrapper { min-height: 240px; order: 1; }
          .latest-widget { max-height: 450px; order: 2; border-radius: 0; border-left: none; border-right: none; }
          .content-layout { grid-template-columns: 1fr; }
          .sidebar { position: static; }
          .more-stories-grid { grid-template-columns: 1fr; }
          .trending-wrapper { padding: 24px 0; margin: 24px 0; }
        }
        @media(max-width: 480px) {
          .latest-widget-header h3 { font-size: 0.95rem; }
        }
      `}</style>
    </>
  );
}
