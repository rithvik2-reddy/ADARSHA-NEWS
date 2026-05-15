import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Search, FileText, Settings } from 'lucide-react';
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
      <NavLink to="/epaper" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <FileText size={20} />
        <span>E-Paper</span>
      </NavLink>
      <NavLink to="/admin" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Settings size={20} />
        <span>Admin</span>
      </NavLink>
    </nav>
  );
}
