import { FALLBACK_IMAGE } from './constants';

const BRANDED = ['sakshi','eenadu','ntv','tv9','s3fs-public','stickey','logo-white','logo-black','app-store','google-play','v6velugu','namasthetelangana'];
export const isBranded = (url) => !url || BRANDED.some(k => url.toLowerCase().includes(k));

const FALLBACKS = {
  Politics: [
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
    'https://images.unsplash.com/photo-1541872703-74c5e443d1fe?w=800&q=80',
    'https://images.unsplash.com/photo-1575320181282-9afab399332c?w=800&q=80'
  ],
  Telangana: [
    'https://images.unsplash.com/photo-1548013146-72479768bbaa?w=800&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',
    'https://images.unsplash.com/photo-1623382672783-8a321d551ad2?w=800&q=80'
  ],
  AndhraPradesh: [
    'https://images.unsplash.com/photo-1600100397608-f010e623ec28?w=800&q=80',
    'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&q=80'
  ],
  India: [
    'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&q=80',
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80'
  ],
  World: [
    'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'
  ],
  Cinema: [
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80'
  ],
  Sports: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=80'
  ]
};

export const safeImg = (url, cat) => {
  if (isBranded(url)) {
    const list = FALLBACKS[cat] || [FALLBACK_IMAGE];
    return list[Math.floor(Math.random() * list.length)];
  }
  return url || FALLBACK_IMAGE;
};

const SOURCE_PATTERNS = [/^సాక్షి[,:\s-]/i, /^sakshi[,:\s-]/i, /^ఈనాడు[,:\s-]/i, /^eenadu[,:\s-]/i];

export function sanitizeHtml(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,iframe,[class*="sakshi"],[class*="eenadu"]').forEach(el => el.remove());
  doc.querySelectorAll('a').forEach(a => {
    const h = (a.getAttribute('href') || '').toLowerCase();
    if (h.includes('sakshi.com') || h.includes('eenadu.net') || h.includes('play.google.com') || h.includes('apps.apple.com')) a.remove();
  });
  doc.querySelectorAll('img').forEach(img => {
    if (isBranded(img.getAttribute('src'))) img.remove();
  });
  doc.querySelectorAll('p,span,div,strong').forEach(el => {
    if (!el.children.length && SOURCE_PATTERNS.some(p => p.test((el.textContent||'').trim()))) el.remove();
  });
  let clean = doc.body.innerHTML;
  clean = clean.replace(/సాక్షి/g, 'ఆదర్శ').replace(/Sakshi/g, 'Adarsha').replace(/ఈనాడు/g, 'ఆదర్శ');
  return clean.trim();
}

export function formatDate(dateStr, lang = 'te') {
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-US', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export function readingTime(html) {
  const words = (html || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function getCategoryColor(cat) {
  const map = {
    Politics:'#7C3AED', Telangana:'#059669', AndhraPradesh:'#0284C7',
    India:'#D97706', World:'#DB2777', Sports:'#16A34A', Cinema:'#EA580C',
    Business:'#0891B2', Technology:'#6366F1', Viral:'#E11D48',
    Education:'#7C3AED', Health:'#10B981', Lifestyle:'#F59E0B',
  };
  return map[cat] || '#DC2626';
}
