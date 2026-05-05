import React, { useState, useEffect } from 'react';
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
const API_BASE = "https://adarsha-news-1.onrender.com/api";

const Home = ({ lang, t, setLatestNews, latestNews }) => {
  const [categoryNews, setCategoryNews] = useState({});
  const [activeCategory, setActiveCategory] = useState('Latest');

  useEffect(() => {
    axios.get(`${API_BASE}/news/latest`).then(res => setLatestNews(res.data.data)).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const endpoint = activeCategory === 'Latest' ? `${API_BASE}/news?limit=24` : `${API_BASE}/news/category/${activeCategory}?limit=24`;
    axios.get(endpoint).then(res => setCategoryNews(prev => ({ ...prev, [activeCategory]: res.data.data }))).catch(err => console.error(err));
  }, [activeCategory]);

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
              <Link to={`/article/${news.id}`} key={news.id} className="news-card">
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

const ArticleView = ({ lang, t }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE}/news/article/${id}`).then(res => { setArticle(res.data.data); setLoading(false); window.scrollTo(0, 0); }).catch(err => { console.error(err); setLoading(false); });
  }, [id]);

  if (loading) return <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>వార్తలు లోడ్ అవుతున్నాయి...</div>;
  if (!article) return <div className="container">వార్త కనుగొనబడలేదు.</div>;

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
        <div className="article-content" dangerouslySetInnerHTML={{ __html: article.articleContent }}></div>
      </article>
      <aside className="article-sidebar">
        <div className="sidebar-ad">Advertisement</div>
      </aside>
    </main>
  );
};

function App() {
  const [lang, setLang] = useState('te');
  const [latestNews, setLatestNews] = useState([]);
  const t = translations[lang];

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
          <Link to="/" className="logo">ADARSHA<span>NEWS</span></Link>
          <div className="header-ad">Advertisement Space</div>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Home lang={lang} t={t} setLatestNews={setLatestNews} latestNews={latestNews} />} />
        <Route path="/article/:id" element={<ArticleView lang={lang} t={t} />} />
      </Routes>
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
               <div className="logo" style={{ color: '#fff', marginBottom: '15px' }}>ADARSHA<span>NEWS</span></div>
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
