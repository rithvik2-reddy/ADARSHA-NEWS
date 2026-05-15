import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Search, FileText } from 'lucide-react';
import { TRANSLATIONS } from '../utils/constants.js';
import { useLang } from '../context/providers.jsx';

export default function BottomNav() {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Home size={20} />
        <span>{t.home}</span>
      </NavLink>
      <NavLink to="/category/Politics" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Grid size={20} />
        <span>{t.latest}</span>
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Search size={20} />
        <span>{t.search}</span>
      </NavLink>
      <a href="https://adarshapaper.in" target="_blank" rel="noopener noreferrer" className="bottom-nav-item">
        <FileText size={20} />
        <span>E-Paper</span>
      </a>
    </nav>
  );
}
