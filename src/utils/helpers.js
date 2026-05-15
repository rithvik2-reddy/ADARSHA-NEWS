import { FALLBACK_IMAGE } from './constants';

const BRANDED = ['sakshi','eenadu','ntv','tv9','s3fs-public','stickey','logo-white','logo-black','app-store','google-play'];
export const isBranded = (url) => !url || BRANDED.some(k => url.toLowerCase().includes(k));

const CAT_FALLBACKS = {
  Politics: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
  Telangana: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?w=800&q=80',
  AndhraPradesh: 'https://images.unsplash.com/photo-1600100397608-f010e623ec28?w=800&q=80',
  India: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&q=80',
  World: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&q=80',
  Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
  Cinema: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
  Business: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  Technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  Viral: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
};

export const safeImg = (url, cat) => {
  if (isBranded(url)) return CAT_FALLBACKS[cat] || FALLBACK_IMAGE;
  return url || CAT_FALLBACKS[cat] || FALLBACK_IMAGE;
};

const SOURCE_PATTERNS = [/^సాక్షి[,:\s-]/i, /^sakshi[,:\s-]/i];

export function sanitizeHtml(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,iframe,[class*="sakshi"]').forEach(el => el.remove());
  doc.querySelectorAll('a').forEach(a => {
    const h = (a.getAttribute('href') || '').toLowerCase();
    if (h.includes('sakshi.com') || h.includes('play.google.com') || h.includes('apps.apple.com')) a.remove();
  });
  doc.querySelectorAll('img').forEach(img => {
    if (isBranded(img.getAttribute('src'))) img.remove();
  });
  doc.querySelectorAll('p,span,div,strong').forEach(el => {
    if (!el.children.length && SOURCE_PATTERNS.some(p => p.test((el.textContent||'').trim()))) el.remove();
  });
  return doc.body.innerHTML.replace(/సాక్షి/g, 'ఆదర్శ').trim();
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
