import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, Sun, Moon, Globe, X, Newspaper, Home } from 'lucide-react';
import { useTheme, useLang, useNews } from '../context/providers.jsx';
import { CATEGORIES, TRANSLATIONS } from '../utils/constants.js';
import MobileTabs from './MobileTabs.jsx';

const NAV_CATS = ['Politics','Telangana','AndhraPradesh','India','World','Sports','Cinema','Business','Technology','Viral'];

export default function Header() {
  const { dark, toggle } = useTheme();
  const { lang, toggle: toggleLang } = useLang();
  const { settings } = useNews();
  const t = TRANSLATIONS[lang];
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className={`main-header ${scrolled ? 'scrolled' : ''}`} style={{ 
        position: 'sticky', top: 0, zIndex: 1000, 
        background: 'var(--surface)', 
        borderBottom: '1px solid var(--border)',
        padding: scrolled ? '8px 0' : '12px 0',
        transition: 'var(--transition)',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setMenuOpen(true)} className="mobile-only" style={{ background: 'none', border: 'none', color: 'var(--text)', padding: 4 }}>
              <Menu size={24} />
            </button>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ 
                background: 'var(--primary-gradient)', 
                color: '#fff', 
                padding: '4px 12px', 
                borderRadius: '8px', 
                fontWeight: 900, 
                fontSize: scrolled ? '1.1rem' : '1.3rem',
                letterSpacing: '-0.5px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                ADARSHA
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ fontSize: scrolled ? '0.9rem' : '1.1rem', fontWeight: 800, color: 'var(--text)' }}>NEWS</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--muted)', fontWeight: 700 }}>ఆదర్శ వార్తలు</span>
              </div>
            </Link>
          </div>

          <nav className="desktop-only" style={{ display: 'flex', gap: 4 }}>
            {NAV_CATS.slice(0, 6).map(cat => (
              <Link key={cat} to={`/category/${cat}`} className={`nav-link ${location.pathname === `/category/${cat}` ? 'active' : ''}`}>
                {t[cat.toLowerCase()] || cat}
              </Link>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/search" style={{ color: 'var(--text)', padding: 8 }} className="desktop-only">
              <Search size={20} />
            </Link>
            <button onClick={toggleLang} style={{ 
              background: 'var(--surface2)', border: '1px solid var(--border)', 
              borderRadius: 20, padding: '5px 12px', fontSize: '.75rem', 
              fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text)'
            }}>
              <Globe size={14} />
              {lang === 'te' ? 'English' : 'తెలుగు'}
            </button>
            <button onClick={toggle} style={{ 
              background: 'none', border: 'none', color: 'var(--text)', 
              padding: 8, display: 'flex', alignItems: 'center' 
            }}>
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

        </div>
      </header>
      <MobileTabs />

      {/* DRAWER */}
      {menuOpen && (
        <div className="drawer-overlay" onClick={() => setMenuOpen(false)}>
          <div className="drawer fade-in" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ background: 'var(--primary-gradient)', color: '#fff', padding: '4px 10px', borderRadius: 4, fontWeight: 900 }}>ADARSHA NEWS</div>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text)' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: '12px 0' }}>
              <Link to="/" className="drawer-link" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Home size={20} style={{ color: 'var(--primary)' }} /> {t.home}
              </Link>
              {NAV_CATS.map(cat => {
                const catInfo = CATEGORIES.find(c => c.key === cat);
                return (
                  <Link key={cat} to={`/category/${cat}`} className="drawer-link">
                    {t[cat.toLowerCase()] || cat}
                  </Link>
                );
              })}
            </div>
            <div style={{ padding: 24, marginTop: 'auto' }}>
              <a href="https://adarshapaper.in" target="_blank" rel="noreferrer" style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '16px', background: 'var(--primary-gradient)', 
                color: '#fff', borderRadius: 12, fontWeight: 800,
                boxShadow: '0 8px 20px rgba(211, 47, 47, 0.3)'
              }}>
                <Newspaper size={20} />
                Read E-Paper
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
