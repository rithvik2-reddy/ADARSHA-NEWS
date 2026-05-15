/**
 * sanitize-existing.js
 * One-time cleanup of all existing articles in news-data.json
 * Removes Sakshi branding, Play Store links, and app banners
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.resolve(__dirname, '..', 'public', 'news-data.json');

function cleanContent(html) {
  if (!html) return "";
  
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Remove all <a> tags pointing to competitor app pages or Play Store
    doc.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.includes('play.google.com') || href.includes('apple.com/app') ||
          href.includes('sakshi.com') || href.includes('tv9telugu.com') ||
          href.includes('ntvtelugu.com') || href.includes('eenadu.net') ||
          href.includes('v6velugu.com') || href.includes('ntnews.com')) {
        // Remove the parent <p> if it only contains this link
        const parent = link.parentElement;
        if (parent && parent.tagName === 'P' && parent.textContent.trim() === link.textContent.trim()) {
          parent.remove();
        } else {
          link.remove();
        }
      }
    });

    // Remove all images from competitor domains or that are app banners
    doc.querySelectorAll('img').forEach(img => {
      const src = (img.getAttribute('src') || '').toLowerCase();
      const alt = (img.getAttribute('alt') || '').toLowerCase();
      if (src.includes('sakshi.com') || src.includes('Sakshi-Mobile') ||
          src.includes('tv9') || src.includes('ntv') ||
          alt.includes('sakshi') || alt.includes('tv9') || alt.includes('ntv') ||
          src.includes('mobile-apps-stickey') ||
          src.includes('playstore') || src.includes('appstore') ||
          src.includes('logo')) {
        const parent = img.parentElement;
        if (parent && parent.tagName === 'P' && parent.children.length === 1) {
          parent.remove();
        } else {
          img.remove();
        }
      }
    });

    // Strip all links, keep text
    doc.querySelectorAll('a').forEach(link => {
      const text = link.textContent;
      link.replaceWith(text);
    });

    // Remove script and style elements
    doc.querySelectorAll('script, style, iframe').forEach(el => el.remove());

    let clean = doc.body.innerHTML;
    // Phone numbers and signatures
    clean = clean.replace(/\d{10}/g, "");
    clean = clean.replace(/\d{5}[-\s]\d{5}/g, "");
    clean = clean.replace(/వై\.వెంకటసుబ్బారెడ్డి/g, "");

    const replacements = [
        [/సాక్షి/g, "ఆదర్శ వార్తలు"], [/Sakshi/g, "Adarsha News"], 
        [/ఈనాడు/g, "ఆదర్శ వార్తలు"], [/Eenadu/g, "Adarsha News"],
        [/నమస్తే తెలంగాణ/g, "ఆదర్శ వార్తలు"], [/Namasthe Telangana/g, "Adarsha News"],
        [/ఆంధ్రజ్యోతి/g, "ఆదర్శ వార్తలు"], [/Andhrajyothy/g, "Adarsha News"], 
        [/సమయం/g, "ఆదర్శ వార్తలు"], [/Samayam/g, "Adarsha News"], 
        [/10TV/g, "ఆదర్శ వార్తలు"], [/ABP Desam/g, "ఆదర్శ వార్తలు"], 
        [/ABP/g, "ఆదర్శ వార్తలు"], [/TV9/g, "ఆదర్శ వార్తలు"], 
        [/V6 News/g, "ఆదర్శ వార్తలు"], [/NTV/g, "ఆదర్శ వార్తలు"], 
        [/TV5/g, "ఆదర్శ వార్తలు"], [/Way2News/g, "ఆదర్శ వార్తలు"], 
        [/Inshorts/g, "ఆదర్శ వార్తలు"], [/వెలుగు/g, "ఆదర్శ వార్తలు"], [/Velugu/g, "Adarsha News"],
        [/ABN/g, "ఆదర్శ వార్తలు"], [/Andhra Jyothy/g, "Adarsha News"]
    ];

    replacements.forEach(([pattern, replacement]) => {
      clean = clean.replace(pattern, replacement);
    });

    return clean.trim();

    // Remove intro lines like "సాక్షి, నెల్లూరు:" at start of paragraphs
    doc.querySelectorAll('p').forEach(p => {
      const text = p.textContent.trim();
      if (/^(సాక్షి|Sakshi|టీవీ9|TV9|ఎన్‌టీవీ|NTV)[,\s]/.test(text)) {
        // Strip the prefix up to the colon
        const colonIdx = text.indexOf(':');
        if (colonIdx > 0 && colonIdx < 50) {
          p.textContent = text.substring(colonIdx + 1).trim();
        }
      }
    });

    return doc.body.innerHTML.trim();
  } catch (e) {
    // Fallback: regex-only cleanup
    return html
      .replace(/<a[^>]+(?:sakshi\.com|play\.google\.com|tv9telugu\.com)[^>]*>[\s\S]*?<\/a>/gi, '')
      .replace(/<img[^>]+(?:Sakshi-Mobile|logo|tv9|ntv)[^>]*\/?>/gi, '')
      .replace(/<p>\s*<\/p>/gi, '');
  }
}

console.log('🧹 Starting one-time sanitization of existing articles...');

const raw = fs.readFileSync(DATA_PATH, 'utf-8');
const articles = JSON.parse(raw);

console.log(`Loaded ${articles.length} articles to clean.`);

let cleanedCount = 0;
const cleaned = articles.map(article => {
  const originalLen = (article.articleContent || '').length;
  const newContent = cleanContent(article.articleContent || '');
  if (newContent.length !== originalLen) cleanedCount++;
  return { ...article, articleContent: newContent };
});

fs.writeFileSync(DATA_PATH, JSON.stringify(cleaned, null, 2), 'utf-8');
console.log(`✅ Done. Cleaned content in ${cleanedCount} / ${articles.length} articles.`);
console.log('📁 Saved to news-data.json');
