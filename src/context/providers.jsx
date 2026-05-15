import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

const ThemeCtx = createContext({});
const LangCtx = createContext({});
const NewsCtx = createContext({});

export const useTheme = () => useContext(ThemeCtx);
export const useLang = () => useContext(LangCtx);
export const useNews = () => useContext(NewsCtx);

// Firebase Config (will read from env variables if provided)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let db = null;
try {
  if (firebaseConfig.projectId) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (e) {
  console.warn("Firebase not initialized:", e);
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('an_dark');
    if (saved !== null) return saved === '1';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('an_dark', dark ? '1' : '0');
  }, [dark]);
  return <ThemeCtx.Provider value={{ dark, toggle: () => setDark(d => !d) }}>{children}</ThemeCtx.Provider>;
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('an_lang') || 'te');
  const toggle = () => setLang(l => { const n = l === 'te' ? 'en' : 'te'; localStorage.setItem('an_lang', n); return n; });
  return <LangCtx.Provider value={{ lang, toggle }}>{children}</LangCtx.Provider>;
}

export function NewsProvider({ children }) {
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const cached = localStorage.getItem('an_cache');
    if (cached) {
      try { setAllNews(JSON.parse(cached)); setLoading(false); } catch {}
    }

    const fetchNews = async () => {
      try {
        if (db) {
          // Fetch from Firebase
          const q = query(collection(db, 'news'), orderBy('pubDate', 'desc'));
          const snapshot = await getDocs(q);
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (docs.length > 0) {
            setAllNews(docs);
            localStorage.setItem('an_cache', JSON.stringify(docs));
            setLoading(false);
            if (window.__hideSplash) window.__hideSplash();
            return;
          }
        }
      } catch (err) {
        console.warn("Firebase fetch failed, falling back to local JSON:", err);
      }

      // Fallback to local JSON
      fetch(`/news-data.json?v=${Date.now()}`)
        .then(r => r.json()).then(data => {
          const d = Array.isArray(data) ? data : [];
          setAllNews(d);
          setLoading(false);
          localStorage.setItem('an_cache', JSON.stringify(d));
          if (window.__hideSplash) window.__hideSplash();
        }).catch(() => { setLoading(false); if (window.__hideSplash) window.__hideSplash(); });
    };

    fetchNews();

    fetch(`https://adarshapaper.in/settings.json?t=${Date.now()}`)
      .then(r => r.json()).then(setSettings).catch(() => {});
  }, []);

  const byCategory = (cat) => cat === 'Latest'
    ? allNews.slice(0, 60)
    : allNews.filter(n => n.category === cat);

  return (
    <NewsCtx.Provider value={{ allNews, loading, settings, byCategory }}>
      {children}
    </NewsCtx.Provider>
  );
}
