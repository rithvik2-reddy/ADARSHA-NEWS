import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { Globe, Clock, Zap, Menu, ArrowLeft, Share2, MessageSquare } from 'lucide-react';
import './index.css';

const translations = {
  te: {
    liveNews: 'తాజా వార్తలు',
    home: 'హోమ్',
    latest: 'తాజా',
    national: 'జాతీయ',
    world: 'అంతర్జాతీయ',
    business: 'వ్యాపారం',
    technology: 'టెక్నాలజీ',
    entertainment: 'వినోదం',
    sports: 'క్రీడలు',
    readMore: 'ఇంకా చదవండి',
    aboutUs: 'మా గురించి',
    contact: 'సంప్రదించండి',
    rights: 'అన్ని హక్కులూ ప్రత్యేకించబడినవి.',
    english: 'English',
    telugu: 'తెలుగు',
    share: 'షేర్ చేయండి',
    editorial: 'ఆదర్శ న్యూస్ ఎడిటోరియల్'
  },
  en: {
    liveNews: 'LIVE NEWS',
    home: 'Home',
    latest: 'Latest',
    national: 'National',
    world: 'World',
    business: 'Business',
    technology: 'Technology',
    entertainment: 'Entertainment',
    sports: 'Sports',
    readMore: 'Read More',
    aboutUs: 'About Us',
    contact: 'Contact',
    rights: 'All rights reserved.',
    english: 'English',
    telugu: 'Telugu',
    share: 'Share',
    editorial: 'Adarsha News Editorial'
  }
};

// API Base URL for backend communication
// News data is fetched from the GitHub-hosted JSON file.
// GitHub Actions updates this every 30 minutes automatically — no PC or server needed!
const NEWS_DATA_URL = "https://raw.githubusercontent.com/rithvik2-reddy/ADARSHA-NEWS/master/public/news-data.json";

const SOURCE_LINE_PATTERNS = [
  /^సాక్షి[,:\s-]/i,
  /^sakshi[,:\s-]/i,
  /^సాక్షి ప్రతినిధి/i,
  /^sakshi representative/i
];

function sanitizeArticleHtml(html) {
  if (!html) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  doc.querySelectorAll('script, style, iframe, .app-download-banner, .sakshi-play-store, .source-branding, .footer-credits').forEach((el) => el.remove());

  doc.querySelectorAll('a').forEach((a) => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    const text = (a.textContent || '').toLowerCase();
    if (
      href.includes('play.google.com') ||
      href.includes('apps.apple.com') ||
      href.includes('sakshi.com/apps') ||
      text.includes('play store') ||
      text.includes('download app')
    ) {
      a.remove();
    }
  });

  doc.querySelectorAll('p, span, div, strong').forEach((el) => {
    if (el.children.length > 0) return;
    const text = (el.textContent || '').trim();
    if (!text) return;
    if (SOURCE_LINE_PATTERNS.some((pattern) => pattern.test(text))) {
      el.remove();
    }
  });

  return doc.body.innerHTML
    .replace(/<p>\s*Download[^<]*<\/p>/gi, '')
    .replace(/<p>\s*Google Play[^<]*<\/p>/gi, '')
    .trim();
}

const Home = ({ lang, t, latestNews, allNews, activeCategory, setActiveCategory, categoryNews }) => {
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-US', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
  };

  const currentFeed = categoryNews[activeCategory] || [];
  const categories = ['Latest', 'National', 'World', 'Business', 'Technology', 'Entertainment', 'Sports'];

  return (
    <>
      <nav>
        <div className="container">
          <ul>
            <li><a className={activeCategory === 'Latest' ? 'active' : ''} onClick={() => setActiveCategory('Latest')}><Menu size={16} style={{display:'inline', marginBottom:'-3px'}}/> {t.home}</a></li>
            {categories.slice(1).map(cat => (
              <li key={cat}>
                <a className={activeCategory === cat ? 'active' : ''} onClick={() => setActiveCategory(cat)}>{t[cat.toLowerCase()] || cat}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="container">
        {activeCategory === 'Latest' && latestNews.length > 0 && (
          <section className="hero-section">
            <Link to={`/article/${latestNews[0].id}`} className="hero-main-article">
              <img src={latestNews[0].imageUrl} alt={latestNews[0].title} />
              <div className="hero-content">
                <span className="category-tag">{t[latestNews[0].category?.toLowerCase()] || latestNews[0].category}</span>
                <h1>{latestNews[0].title}</h1>
                <div className="timestamp"><Clock size={14}/> {formatDate(latestNews[0].pubDate)}</div>
              </div>
            </Link>
            <div className="hero-side-articles">
              {latestNews.slice(1, 5).map((news) => (
                 <Link to={`/article/${news.id}`} key={news.id} className="side-article">
                   <img src={news.imageUrl} alt={news.title} />
                   <div>
                     <h3>{news.title}</h3>
                     <div className="timestamp"><Clock size={12}/> {formatDate(news.pubDate)}</div>
                   </div>
                 </Link>
              ))}
            </div>
          </section>
        )}

        <section style={{ marginTop: '40px' }}>
          <h2 className="section-title">{activeCategory === 'Latest' ? t.latest : (t[activeCategory.toLowerCase()] || activeCategory)} {lang === 'te' ? 'వార్తలు' : 'News'}</h2>
          <div className="news-grid">
            {currentFeed.map((news) => (
              <Link 
                to={`/article/${news.id}`} 
                key={news.id} 
                className="news-card"
                onMouseEnter={() => {
                  // Prefetch image to browser cache
                  const img = new Image();
                  img.src = news.imageUrl;
                }}
              >
                <div className="news-card-img-wrapper">
                  <span className="category-tag" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>{t[news.category?.toLowerCase()] || news.category}</span>
                  <img src={news.imageUrl} alt={news.title} loading="lazy" />
                </div>
                <div className="news-card-content">
                  <h3 className="news-card-title">{news.title}</h3>
                  <div className="card-footer">
                    <div className="timestamp"><Clock size={12}/> {formatDate(news.pubDate)}</div>
                    <span className="read-more-btn">{t.readMore} &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

const SkeletonArticle = () => (
  <main className="container article-container">
    <div className="skeleton-card" style={{gridColumn:'1/-1',padding:'24px',borderRadius:'10px',background:'#fff'}}>
      <div className="skeleton-line short" style={{marginBottom:'20px'}}></div>
      <div className="skeleton-line" style={{height:'28px',marginBottom:'10px'}}></div>
      <div className="skeleton-line" style={{height:'28px',width:'75%',marginBottom:'28px'}}></div>
      <div className="skeleton-img" style={{borderRadius:'10px',marginBottom:'28px',height:'320px'}}></div>
      {[1,2,3,4,5].map(i=><div key={i} className="skeleton-line" style={{height:'15px',width:i%2===0?'85%':'100%',marginBottom:'16px'}}></div>)}
    </div>
  </main>
);


const ArticleView = ({ lang, t, allNews }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ads, setAds] = useState(null);

  // SYNCHRONOUS lookup - zero delay if data already loaded
  const [article, setArticle] = useState(() => {
    if (allNews && allNews.length > 0) {
      return allNews.find(n => n.id === id) || null;
    }
    return null;
  });
  const [loading, setLoading] = useState(!article); // Only true if not found instantly

  useEffect(() => {
    // Load ads from adarshapaper.in settings (non-blocking)
    axios.get('https://adarshapaper.in/settings.json', { timeout: 8000 }).then(res => setAds(res.data.newsAds)).catch(() => {});
  }, []);

  useEffect(() => {
    // If article was found synchronously, just scroll
    if (article) {
      window.scrollTo(0, 0);
      setLoading(false);
      return;
    }

    // Fallback: fetch from GitHub (e.g. direct URL entry or page refresh)
    setLoading(true);
    axios.get(`${NEWS_DATA_URL}?t=${Date.now()}`, { timeout: 12000 })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        const found = data.find(n => n.id === id);
        if (found) {
          setArticle(found);
          window.scrollTo(0, 0);
        }
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, [id]);

  const sanitizedHtml = useMemo(() => sanitizeArticleHtml(article?.articleContent || ''), [article?.articleContent]);

  if (loading) return <SkeletonArticle />;
  if (!article) return (
    <main className="container article-container">
      <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft size={18} /> వెనక్కి వెళ్ళండి</button>
      <div style={{padding:'60px 20px',textAlign:'center',gridColumn:'1/-1',background:'#fff',borderRadius:'10px'}}>
        <div style={{fontSize:'3rem',marginBottom:'16px'}}>📭</div>
        <p style={{fontSize:'1.1rem',color:'#666'}}>వార్త కనుగొనబడలేదు.</p>
      </div>
    </main>
  );

  return (
    <main className="container article-container">
      <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft size={18} /> వెనక్కి వెళ్ళండి</button>
      <article className="full-article">
        <header className="article-header">
          <span className="category-tag">{t[article.category?.toLowerCase()] || article.category}</span>
          <h1>{article.title}</h1>
          <div className="article-meta">
            <span className="source-label">{t.editorial}</span>
            <span className="dot"></span>
            <span className="timestamp"><Clock size={14}/> {new Date(article.pubDate).toLocaleString(lang === 'te' ? 'te-IN' : 'en-US')}</span>
          </div>
          <div className="article-share-bar">
            <button><MessageSquare size={18} /> WhatsApp</button>
            <button><Share2 size={18} /> {t.share}</button>
          </div>
        </header>
        <img src={article.imageUrl} alt={article.title} className="article-main-image" />
        <div className="article-content" dangerouslySetInnerHTML={{ __html: sanitizedHtml }}></div>
      </article>
      <aside className="article-sidebar">
        {ads?.sidebar?.imageUrl ? (
          <a href={ads.sidebar.linkUrl || '#'} target="_blank" rel="noopener noreferrer">
            <img src={ads.sidebar.imageUrl.startsWith('http') ? ads.sidebar.imageUrl : `https://adarshapaper.in${ads.sidebar.imageUrl}`} alt="Advertisement" style={{ width: '100%', borderRadius: '8px' }} />
          </a>
        ) : (
          <div className="sidebar-ad">Advertisement</div>
        )}
      </aside>
    </main>
  );
};

function App() {
  const [lang, setLang] = useState('te');
  const [latestNews, setLatestNews] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [categoryNews, setCategoryNews] = useState({});
  const [activeCategory, setActiveCategory] = useState('Latest');
  const [ads, setAds] = useState(null);
  const [settings, setSettings] = useState(null);
  const t = translations[lang];

  useEffect(() => {
    axios.get(`https://adarshapaper.in/settings.json?t=${Date.now()}`, { timeout: 10000 }).then(res => {
      setSettings(res.data);
      setAds(res.data.newsAds);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    // 1. Try to load from Cache first for INSTANT startup
    const cachedNews = localStorage.getItem('adarsha_news_cache');
    if (cachedNews) {
      try {
        const data = JSON.parse(cachedNews);
        setAllNews(data);
        setLatestNews(data.slice(0, 10));
        const categories = {};
        data.forEach(item => {
          const cat = item.category || 'Latest';
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(item);
        });
        setCategoryNews(categories);
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }

    const fetchNews = async () => {
      try {
        const res = await axios.get(`${NEWS_DATA_URL}?v=${Date.now()}`, { timeout: 15000 });
        const data = Array.isArray(res.data) ? res.data : [];
        if (data.length > 0) {
          setAllNews(data);
          setLatestNews(data.slice(0, 10));
          
          const categories = {};
          data.forEach(item => {
            const cat = item.category || 'Latest';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(item);
          });
          setCategoryNews(categories);
          
          // Save to cache for next time
          localStorage.setItem('adarsha_news_cache', JSON.stringify(data));
        }
      } catch (err) {
        console.error("Fetch error", err);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    let filtered;
    if (activeCategory === 'Latest') {
      filtered = allNews.slice(0, 24);
    } else {
      filtered = allNews.filter(n => n.category === activeCategory).slice(0, 24);
    }
    setCategoryNews(prev => ({ ...prev, [activeCategory]: filtered }));
  }, [activeCategory, allNews, lang]);

  return (
    <div className="app">
      <header className="header-top">
        <div className="container">
          <div className="header-date"><Clock size={14} style={{ marginRight: '5px' }} />{new Date().toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div className="breaking-news-ticker">
             <span className="ticker-label"><Zap size={12} style={{ display: 'inline', marginBottom: '-2px' }}/> {t.liveNews}</span>
             <div className="ticker-content">{latestNews.map((news) => (<span key={news.id}><strong>•</strong> {news.title}</span>))}</div>
          </div>
          <div className="lang-toggle" onClick={() => setLang(l => l === 'te' ? 'en' : 'te')}><Globe size={14} />{lang === 'te' ? t.english : t.telugu}</div>
        </div>
      </header>
      <header className="header-main">
        <div className="container">
          <Link to="/" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#000', letterSpacing: '-1px' }}>
                ADARSHA <span style={{ color: 'var(--primary-color)' }}>NEWS</span>
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#666', marginTop: '2px', letterSpacing: '1px' }}>
                ఆదర్శ వార్తలు
              </span>
            </div>
          </Link>
          {ads?.banner?.imageUrl ? (
            <a href={ads.banner.linkUrl || '#'} target="_blank" rel="noopener noreferrer" className="header-ad" style={{ padding: 0, background: 'transparent', border: 'none' }}>
              <img src={ads.banner.imageUrl.startsWith('http') ? ads.banner.imageUrl : `https://adarshapaper.in${ads.banner.imageUrl}`} alt="Advertisement" style={{ maxHeight: '90px', borderRadius: '4px' }} />
            </a>
          ) : (
            <div className="header-ad">Advertisement Space</div>
          )}
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Home lang={lang} t={t} latestNews={latestNews} allNews={allNews} activeCategory={activeCategory} setActiveCategory={setActiveCategory} categoryNews={categoryNews} />} />
        <Route path="/article/:id" element={<ArticleView lang={lang} t={t} allNews={allNews} />} />
      </Routes>
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
               <div className="logo" style={{ marginBottom: '15px' }}>
                 <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', letterSpacing: '-1px' }}>
                        ADARSHA <span style={{ color: 'var(--primary-color)' }}>NEWS</span>
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#888', marginTop: '2px', letterSpacing: '1px' }}>
                        ఆదర్శ వార్తలు
                      </span>
                    </div>
                 </Link>
               </div>
               <p>Your trusted source for the latest news in Telugu. 100% original, fast, and unbiased updates.</p>
            </div>
            <div className="footer-links"><h3>{t.aboutUs}</h3><ul><li><Link to="/">Privacy Policy</Link></li><li><Link to="/">Terms of Service</Link></li><li><Link to="/">Disclaimer</Link></li></ul></div>
            <div className="footer-contact"><h3>{t.contact}</h3><p>Email: adarshapaper@gmail.com</p><p>Phone: +91 9948754788</p></div>
          </div>
          <div className="footer-bottom">&copy; {new Date().getFullYear()} Adarsha News. {t.rights}</div>
        </div>
      </footer>
    </div>
  );
}

export default App;
