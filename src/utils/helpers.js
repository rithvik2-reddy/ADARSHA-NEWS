import { FALLBACK_IMAGE } from './constants';

const BRANDED = ['sakshi','s3fs-public','stickey','logo-white','logo-black','app-store','google-play'];
export const isBranded = (url) => !url || BRANDED.some(k => url.toLowerCase().includes(k));
export const safeImg = (url) => isBranded(url) ? FALLBACK_IMAGE : (url || FALLBACK_IMAGE);

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
