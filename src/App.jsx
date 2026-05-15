import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import BottomNav from './components/BottomNav.jsx';
import HomePage from './pages/HomePage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: '5rem', marginBottom: 20 }}>🗞️</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)', marginBottom: 12 }}>404 — Page Not Found</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 28 }}>The page you're looking for doesn't exist.</p>
      <a href="/" style={{ background: 'var(--primary)', color: '#fff', padding: '12px 28px', borderRadius: 8, fontWeight: 700 }}>🏠 Go Home</a>
    </div>
  );
}

const pageVariants = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isAdmin && <Header />}
      <div style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/article/:id" element={<ArticlePage />} />
              <Route path="/category/:cat" element={<CategoryPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
      {!isAdmin && <Footer />}
      {!isAdmin && <BottomNav />}
    </div>
  );
}
