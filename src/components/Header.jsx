import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme, useLang, useNews } from '../context/providers.jsx';
import { CATEGORIES, TRANSLATIONS } from '../utils/constants.js';

const NAV_CATS = ['Politics','Telangana','AndhraPradesh','India','World','Sports','Cinema','Business','Technology','Viral'];

export default function Header() {
  const { dark, toggle } = useTheme();
  const { lang, toggle: toggleLang } = useLang();
  const { allNews, settings } = useNews();
  const t = TRANSLATIONS[lang];
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const tickerNews = allNews.slice(0, 15);
  const ads = settings?.newsAds;

  return (
    <>
      {/* BREAKING NEWS TOP BAR */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 1000 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'stretch', height: 44 }}>
          
          <div className="ticker-label" style={{ borderRadius: 0, padding: '0 24px' }}>
            <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="breaking-badge" style={{ padding: '2px 6px', fontSize: '.6rem', marginRight: 4 }}>Live</span>
              {t.liveNews || 'BREAKING NEWS'}
            </span>
          </div>
          
          <div className="ticker-wrap" style={{ flex: 1, border: 'none', borderRadius: 0, height: '100%', background: 'transparent', boxShadow: 'none' }}>
            {tickerNews.length > 0 ? (
              <div className="ticker-track">
                {[...tickerNews, ...tickerNews].map((n, i) => (
                  <Link to={`/article/${n.id}`} key={i} className="ticker-item">
                    <span className="ticker-dot"></span>
                    {n.title}
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ paddingLeft: 20, color: 'var(--muted)', fontSize: '.85rem' }}>Loading latest updates...</div>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingLeft: 16, borderLeft: '1px solid var(--border)', flexShrink: 0 }} className="top-actions">
            <span style={{ fontSize: '.75rem', color: 'var(--muted)', fontWeight: 600 }}>
              {new Date().toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <button onClick={toggleLang} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px', fontSize: '.75rem', fontWeight: 700, color: 'var(--text)' }}>
              {lang === 'te' ? 'English' : 'తెలుగు'}
            </button>
            <button className={`dark-toggle${dark ? ' on' : ''}`} onClick={toggle} title="Toggle dark mode" />
          </div>

        </div>
      </div>

      {/* MAIN HEADER */}
      <header className={`main-header ${scrolled ? 'scrolled' : ''}`} style={{ background: 'var(--surface)', padding: '20px 0', position: 'relative', zIndex: 999 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          
          {/* LOGO */}
          <Link to="/" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, flexShrink: 0 }}>
            <span style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', fontWeight: 900, color: 'var(--text)', letterSpacing: '-1.5px', fontFamily: 'Inter, sans-serif' }}>
              ADARSHA <span style={{ color: 'var(--primary)' }}>NEWS</span>
            </span>
            <span style={{ fontSize: '.85rem', color: 'var(--muted)', fontFamily: "'Noto Sans Telugu', sans-serif", fontWeight: 700, letterSpacing: '1px', marginTop: 4 }}>ఆదర్శ వార్తలు</span>
          </Link>

          {/* AD BANNER */}
          {ads?.banner?.imageUrl ? (
            <a href={ads.banner.linkUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'block', flexShrink: 1 }} className="header-ad">
              <img src={ads.banner.imageUrl.startsWith('http') ? ads.banner.imageUrl : `https://adarshapaper.in${ads.banner.imageUrl}`} alt="Advertisement" style={{ maxHeight: 80, borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
            </a>
          ) : (
            <div className="header-ad" style={{ height: 80, width: 400, background: 'var(--surface2)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '.8rem', flexShrink: 1 }}>
              Advertisement Space
            </div>
          )}

          {/* SEARCH & MOBILE MENU */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <div className="search-box header-search">
              <span style={{ color: 'var(--muted)' }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && search.trim()) { window.location.href = `/search?q=${encodeURIComponent(search.trim())}`; } }}
                placeholder={t.search + '...'}
              />
            </div>
            <button onClick={() => setMenuOpen(true)} className="hamburger-btn" aria-label="Menu" style={{ background: 'none', border: 'none', fontSize: '1.8rem', color: 'var(--text)', padding: 4 }}>
              ☰
            </button>
          </div>

        </div>
      </header>

      {/* STICKY NAV BAR */}
      <nav className="nav-bar" style={{ position: 'sticky', top: 0, zIndex: 998 }}>
        <div className="container">
          <ul style={{ display: 'flex', listStyle: 'none', gap: 4, overflowX: 'auto', scrollbarWidth: 'none', padding: '0 8px' }}>
            <li>
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                🏠 {t.home}
              </Link>
            </li>
            {NAV_CATS.map(cat => {
              const catInfo = CATEGORIES.find(c => c.key === cat);
              const active = location.pathname === `/category/${cat}`;
              return (
                <li key={cat}>
                  <Link to={`/category/${cat}`} className={`nav-link ${active ? 'active' : ''}`}>
                    {t[cat.toLowerCase()] || catInfo?.te || cat}
                  </Link>
                </li>
              );
            })}
            <li style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }} className="nav-epaper-btn">
              <a href="https://adarshapaper.in" target="_blank" rel="noopener noreferrer" style={{ background: 'var(--primary-gradient)', color: '#fff', padding: '6px 16px', borderRadius: 20, fontSize: '.8rem', fontWeight: 800, letterSpacing: '0.5px', boxShadow: '0 2px 8px rgba(211,47,47,0.4)', display: 'flex', alignItems: 'center', gap: 6, transition: 'var(--transition)' }}>
                📰 E-PAPER
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      {menuOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setMenuOpen(false)} />
          <div className="drawer fade-in">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Inter' }}>ADARSHA <span style={{ color: 'var(--primary)' }}>NEWS</span></span>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'var(--surface2)', border: 'none', width: 32, height: 32, borderRadius: '50%', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>✕</button>
            </div>
            
            <div style={{ padding: '16px 24px' }}>
              <div className="search-box" style={{ width: '100%' }}>
                <span style={{ color: 'var(--muted)' }}>🔍</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && search.trim()) { window.location.href = `/search?q=${encodeURIComponent(search.trim())}`; } }}
                  placeholder={t.search + '...'}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <Link to="/" className="drawer-link" onClick={() => setMenuOpen(false)}>🏠 {t.home}</Link>
            {NAV_CATS.map(cat => {
              const catInfo = CATEGORIES.find(c => c.key === cat);
              return (
                <Link key={cat} to={`/category/${cat}`} className="drawer-link" onClick={() => setMenuOpen(false)}>
                  {t[cat.toLowerCase()] || catInfo?.te || cat}
                </Link>
              );
            })}
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="https://adarshapaper.in" target="_blank" rel="noopener noreferrer" style={{ background: 'var(--primary-gradient)', color: '#fff', padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontWeight: 800 }}>📰 Read E-Paper</a>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={toggleLang} style={{ flex: 1, padding: '12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontWeight: 700, color: 'var(--text)' }}>
                  {lang === 'te' ? 'Switch to English' : 'తెలుగులోకి మార్చండి'}
                </button>
                <button onClick={toggle} style={{ flex: 1, padding: '12px', background: dark ? 'var(--primary-gradient)' : 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontWeight: 700, color: dark ? '#fff' : 'var(--text)' }}>
                  {dark ? '☀️ Light' : '🌙 Dark Mode'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .hamburger-btn { display: none !important; }
        @media(max-width: 1024px) {
          .header-ad { display: none !important; }
        }
        @media(max-width: 768px) {
          .hamburger-btn { display: flex !important; }
          .header-search { display: none !important; }
          .top-actions { display: none !important; }
          .nav-epaper-btn { display: none !important; }
          .nav-link { padding: 12px 14px; font-size: .8rem; }
        }
        @media(max-width: 480px) {
          .ticker-label { padding: 0 12px !important; font-size: .7rem; }
        }
      `}</style>
    </>
  );
}
