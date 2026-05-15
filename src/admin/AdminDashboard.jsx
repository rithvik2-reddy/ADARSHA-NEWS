import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../context/providers.jsx';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { CATEGORIES } from '../utils/constants.js';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'Politics', imageUrl: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) fetchNews();
    });
    return unsub;
  }, []);

  const fetchNews = async () => {
    if (!db) return;
    const q = query(collection(db, 'news'), orderBy('pubDate', 'desc'));
    const snap = await getDocs(q);
    setNews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !storage) return;
    setUploading(true);
    try {
      const sRef = ref(storage, `news/${Date.now()}_${file.name}`);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      setForm({ ...form, imageUrl: url });
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db) return;
    try {
      const data = { ...form, pubDate: new Date().toISOString() };
      if (editing) {
        await updateDoc(doc(db, 'news', editing), data);
      } else {
        await addDoc(collection(db, 'news'), data);
      }
      setForm({ title: '', content: '', category: 'Politics', imageUrl: '' });
      setEditing(null);
      fetchNews();
      alert("Saved successfully!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this article?")) return;
    try {
      await deleteDoc(doc(db, 'news', id));
      fetchNews();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading Admin...</div>;

  if (!user) {
    return (
      <div className="flex-center" style={{ height: '100vh', background: 'var(--bg)' }}>
        <form onSubmit={handleLogin} style={{ width: 320, padding: 32, background: 'var(--surface)', borderRadius: 16, boxShadow: 'var(--shadow-lg)' }}>
          <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Admin Login</h2>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required />
          <button type="submit" style={{ width: '100%', background: 'var(--primary)', color: '#fff', padding: 12, border: 'none', borderRadius: 8, fontWeight: 700 }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* SIDEBAR */}
      <aside className="admin-sidebar" style={{ 
        width: 280, background: 'var(--nav-bg)', color: '#fff', 
        padding: '32px 20px', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh'
      }}>
        <div style={{ marginBottom: 40, padding: '0 12px' }}>
          <h2 style={{ letterSpacing: '-1px' }}>ADARSHA <span style={{ color: 'var(--primary)' }}>CMS</span></h2>
          <p style={{ fontSize: '.7rem', opacity: .6, marginTop: 4 }}>Enterprise Dashboard</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <button onClick={() => setEditing(null)} style={activeSidebarBtn(editing === null)}>📝 News Editor</button>
          <button style={sidebarBtnStyle}>📰 E-Paper Management</button>
          <button style={sidebarBtnStyle}>📊 Analytics</button>
          <button style={sidebarBtnStyle}>⚙️ Site Settings</button>
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '0 12px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem' }}>
              {user.email[0].toUpperCase()}
            </div>
            <span style={{ fontSize: '.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
          </div>
          <button onClick={() => signOut(auth)} style={{ ...sidebarBtnStyle, background: '#ef4444', color: '#fff' }}>🚪 Logout</button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="admin-mobile-header" style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, height: 60, 
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        display: 'none', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', zIndex: 100
      }}>
        <h3 style={{ fontSize: '1.1rem' }}>ADARSHA CMS</h3>
        <button onClick={() => signOut(auth)} style={{ background: 'none', border: 'none', fontSize: '1.2rem' }}>🚪</button>
      </div>

      <main style={{ flex: 1, padding: '40px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }} className="admin-main">
        <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>{editing ? 'Update Article' : 'New Publication'}</h1>
            <p style={{ color: 'var(--muted)', marginTop: 4 }}>Manage your news content in real-time.</p>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }} className="admin-grid">
          {/* EDITOR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <section style={{ background: 'var(--surface)', padding: 32, borderRadius: 20, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
              <input 
                type="text" placeholder="Headline" 
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} 
                style={{ ...inputStyle, fontSize: '1.5rem', fontWeight: 800, border: 'none', background: 'none', padding: 0, marginBottom: 24 }} 
                required 
              />
              
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: 12, fontSize: '.9rem' }}>Content Body</label>
                <textarea 
                  placeholder="Tell your story..." 
                  value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} 
                  style={{ ...inputStyle, height: 450, fontSize: '1.1rem', lineHeight: 1.6 }} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <button onClick={handleSubmit} style={{ 
                  flex: 2, background: 'var(--primary-gradient)', color: '#fff', 
                  padding: '16px', border: 'none', borderRadius: 12, fontWeight: 800,
                  fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(211,47,47,0.3)'
                }}>
                  {editing ? 'Update Now' : 'Publish to Live'}
                </button>
                {editing && (
                  <button onClick={() => { setEditing(null); setForm({ title: '', content: '', category: 'Politics', imageUrl: '' }); }} style={{ 
                    flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 12, fontWeight: 700, cursor: 'pointer'
                  }}>Cancel</button>
                )}
              </div>
            </section>
          </div>

          {/* SETTINGS SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <section style={{ background: 'var(--surface)', padding: 24, borderRadius: 20, border: '1px solid var(--border)' }}>
              <h4 style={{ marginBottom: 20 }}>Article Meta</h4>
              
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.te} ({c.key})</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Cover Image</label>
                <div style={{ 
                  width: '100%', aspectRatio: '16/9', background: 'var(--surface2)', 
                  borderRadius: 12, border: '2px dashed var(--border)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', cursor: 'pointer', position: 'relative'
                }} onClick={() => document.getElementById('imgUpload').click()}>
                  {form.imageUrl ? (
                    <img src={form.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '2rem' }}>📸</span>
                      <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 8 }}>Click to upload</p>
                    </div>
                  )}
                  {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Uploading...</div>}
                </div>
                <input type="file" id="imgUpload" onChange={handleUpload} style={{ display: 'none' }} />
              </div>
            </section>

            <section style={{ background: 'var(--surface)', padding: 24, borderRadius: 20, border: '1px solid var(--border)', maxHeight: 500, overflowY: 'auto' }}>
              <h4 style={{ marginBottom: 20 }}>Recent Posts</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {news.map(n => (
                  <div key={n.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8, borderRadius: 8, transition: '.2s' }} className="admin-list-item">
                    <img src={n.imageUrl} style={{ width: 50, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h5 style={{ fontSize: '.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</h5>
                      <div style={{ display: 'flex', gap: 8, fontSize: '.7rem', color: 'var(--muted)' }}>
                        <button onClick={() => { setEditing(n.id); setForm(n); window.scrollTo(0,0); }} style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 700 }}>Edit</button>
                        <button onClick={() => handleDelete(n.id)} style={{ color: '#ef4444', background: 'none', border: 'none' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <style>{`
        .admin-sidebar { transition: transform 0.3s ease; }
        .admin-list-item:hover { background: var(--surface2); }
        @media(max-width:1024px) {
          .admin-grid { grid-template-columns: 1fr; }
        }
        @media(max-width:768px) {
          .admin-sidebar { display: none; }
          .admin-mobile-header { display: flex; }
          .admin-main { padding: 80px 16px 40px; }
          .admin-grid { gap: 20px; }
        }
      `}</style>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'var(--surface2)',
  color: 'var(--text)',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color .2s'
};

const labelStyle = {
  display: 'block',
  fontSize: '.8rem',
  fontWeight: 700,
  color: 'var(--muted)',
  marginBottom: 8,
  textTransform: 'uppercase',
  letterSpacing: '.5px'
};

const sidebarBtnStyle = {
  width: '100%',
  textAlign: 'left',
  padding: '14px 16px',
  background: 'none',
  border: 'none',
  borderRadius: 12,
  color: 'rgba(255,255,255,0.6)',
  fontWeight: 600,
  fontSize: '.9rem',
  cursor: 'pointer',
  transition: 'all .2s'
};

const activeSidebarBtn = (active) => ({
  ...sidebarBtnStyle,
  background: active ? 'rgba(255,255,255,0.1)' : 'none',
  color: active ? '#fff' : 'rgba(255,255,255,0.6)',
  boxShadow: active ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
});
