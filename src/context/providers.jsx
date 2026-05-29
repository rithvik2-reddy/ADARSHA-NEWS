import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const ThemeCtx = createContext({});
const LangCtx = createContext({});
const NewsCtx = createContext({});

export const useTheme = () => useContext(ThemeCtx);
export const useLang = () => useContext(LangCtx);
export const useNews = () => useContext(NewsCtx);

// Firebase Config - Loaded from Environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

export let db = null;
export let auth = null;
export let storage = null;

try {
  // Only initialize if we have the absolute minimum required
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    if (firebaseConfig.storageBucket) {
      storage = getStorage(app);
    }
    console.log("🔥 Firebase initialized successfully");
  } else {
    console.warn("⚠️ Firebase configuration missing: Falling back to local news-data.json");
  }
} catch (e) {
  console.error("❌ Firebase Initialization Error:", e);
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
  const [firebaseInitialized, setFirebaseInitialized] = useState(!!db);

  useEffect(() => {
    const cached = localStorage.getItem('an_cache');
    if (cached) {
      try { setAllNews(JSON.parse(cached)); setLoading(false); } catch {}
    }

    const fetchNews = async () => {
      const hide = () => { if (window.__hideSplash) window.__hideSplash(); };
      
      let localDocs = [];
      let cloudDocs = [];

      // 1. Fetch from local news-data.json (automated and published news)
      try {
        const r = await fetch(`/news-data.json?v=${Date.now()}`);
        if (r.ok) {
          const data = await r.json();
          localDocs = Array.isArray(data) ? data : [];
          console.log(`✅ Fetched ${localDocs.length} articles from local news-data.json`);
        }
      } catch (err) {
        console.error("❌ Local news-data.json fetch failed:", err);
      }

      // 2. Fetch from Firestore (if connected)
      try {
        if (db) {
          const q = query(collection(db, 'news'), orderBy('pubDate', 'desc'));
          const snapshot = await getDocs(q);
          cloudDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log(`✅ Fetched ${cloudDocs.length} articles from Firestore`);
        }
      } catch (err) {
        console.warn("⚠️ Firestore fetch failed:", err);
      }

      // 3. Fetch from KVDB (fallback if Firebase is not connected)
      if (cloudDocs.length === 0) {
        try {
          const r = await fetch('https://kvdb.io/Gqnp6KVjhagrkfr8gbLi8S/news');
          if (r.ok) {
            const data = await r.json();
            cloudDocs = Array.isArray(data) ? data : [];
            console.log(`✅ Fetched ${cloudDocs.length} articles from KVDB`);
          }
        } catch (err) {
          console.warn("⚠️ KVDB fetch failed:", err);
        }
      }

      // Merge local and cloud articles, de-duplicating by id
      const mergedMap = new Map();
      localDocs.forEach(item => {
        if (item && item.id) mergedMap.set(item.id, item);
      });
      cloudDocs.forEach(item => {
        if (item && item.id) mergedMap.set(item.id, item);
      });

      const finalDocs = Array.from(mergedMap.values());

      if (finalDocs.length > 0) {
        // Sort by pubDate descending (newest first)
        finalDocs.sort((a, b) => {
          const dA = a.pubDate ? new Date(a.pubDate) : new Date(0);
          const dB = b.pubDate ? new Date(b.pubDate) : new Date(0);
          return dB - dA;
        });
        setAllNews(finalDocs);
        localStorage.setItem('an_cache', JSON.stringify(finalDocs));
      }
      
      setLoading(false);
      hide();
    };

    fetchNews();
    
    // Global safety timeout to remove splash screen no matter what
    const t = setTimeout(() => { 
      setLoading(false); 
      if (window.__hideSplash) window.__hideSplash(); 
    }, 4000);

    fetch(`https://adarshapaper.in/settings.json?t=${Date.now()}`)
      .then(r => r.json())
      .then((s) => {
        setSettings(s);

        // Dynamic Firebase Sync: If settings have firebase keys and we haven't initialized yet
        if (!firebaseInitialized && s.firebase?.apiKey && s.firebase?.projectId) {
          try {
            const app = initializeApp(s.firebase);
            db = getFirestore(app);
            auth = getAuth(app);
            if (s.firebase.storageBucket) storage = getStorage(app);
            setFirebaseInitialized(true);
            console.log("🔥 Firebase dynamically initialized from settings.json");
            // Re-fetch news from Firestore now that we are connected
            fetchNews();
          } catch (e) { console.error("Dynamic Firebase Init Error:", e); }
        }
      })
      .catch(err => console.warn("Could not load settings:", err));
    
    return () => clearTimeout(t);
  }, [firebaseInitialized]);

  const byCategory = (cat) => cat === 'Latest'
    ? allNews.slice(0, 60)
    : allNews.filter(n => n.category === cat);

  return (
    <NewsCtx.Provider value={{ allNews, loading, settings, byCategory }}>
      {children}
    </NewsCtx.Provider>
  );
}
