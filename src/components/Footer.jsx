import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, TRANSLATIONS } from '../utils/constants.js';
import { useLang } from '../context/providers.jsx';

export default function Footer() {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const cats = CATEGORIES.slice(0, 6);
  const cats2 = CATEGORIES.slice(6);

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">ADARSHA <span>NEWS</span></div>
            <div className="footer-brand-te">ఆదర్శ వార్తలు</div>
            <p className="footer-desc">తెలంగాణ, ఆంధ్రప్రదేశ్ మరియు జాతీయ వార్తలకు మీ విశ్వసనీయ మూలం. మేము నిజాయితీగా, వేగంగా వార్తలు అందిస్తాము.</p>
            <div className="social-links" style={{ marginTop: 20 }}>
              {[['📘','https://facebook.com'],['🐦','https://twitter.com'],['📺','https://youtube.com'],['📸','https://instagram.com']].map(([icon, href]) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="social-btn">{icon}</a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              {cats.map(c => (
                <li key={c.key}><Link to={`/category/${c.key}`}>{t[c.key.toLowerCase()] || c.te}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>More</h4>
            <ul>
              {cats2.map(c => (
                <li key={c.key}><Link to={`/category/${c.key}`}>{t[c.key.toLowerCase()] || c.te}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="https://adarshapaper.in" target="_blank" rel="noopener noreferrer">📰 E-Paper</a></li>
              <li><Link to="/search">🔍 Search News</Link></li>
              <li><a href="https://adarshapaper.in" target="_blank" rel="noopener noreferrer">⚙️ Admin Panel</a></li>
            </ul>
            <h4 style={{ marginTop: 24 }}>Contact</h4>
            <p style={{ color: '#64748B', fontSize: '.85rem' }}>📧 adarshapaper@gmail.com</p>
            <p style={{ color: '#64748B', fontSize: '.85rem', marginTop: 6 }}>📞 +91 9948754788</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Adarsha News. {t.rights}</p>
          <p style={{ color: '#334155', fontSize: '.75rem' }}>
            <Link to="/privacy" style={{ color: '#475569', marginRight: 16 }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: '#475569', marginRight: 16 }}>Terms</Link>
            <Link to="/disclaimer" style={{ color: '#475569' }}>Disclaimer</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
