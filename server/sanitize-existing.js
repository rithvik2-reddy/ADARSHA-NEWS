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

    // Remove all <a> tags pointing to Sakshi app pages or Play Store
    doc.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.includes('play.google.com') || href.includes('apple.com/app') ||
          href.includes('sakshi.com/mobile-apps') || href.includes('special.sakshi.com')) {
        // Remove the parent <p> if it only contains this link
        const parent = link.parentElement;
        if (parent && parent.tagName === 'P' && parent.textContent.trim() === link.textContent.trim()) {
          parent.remove();
        } else {
          link.remove();
        }
      }
    });

    // Remove all images from sakshi.com domains or that are app banners
    doc.querySelectorAll('img').forEach(img => {
      const src = (img.getAttribute('src') || '').toLowerCase();
      const alt = (img.getAttribute('alt') || '').toLowerCase();
      if (src.includes('sakshi.com/s3fs') || src.includes('Sakshi-Mobile') ||
          alt.includes('sakshi') || src.includes('mobile-apps-stickey') ||
          src.includes('playstore') || src.includes('appstore')) {
        const parent = img.parentElement;
        if (parent && parent.tagName === 'P' && parent.children.length === 1) {
          parent.remove();
        } else {
          img.remove();
        }
      }
    });

    // Remove script and style elements
    doc.querySelectorAll('script, style, iframe').forEach(el => el.remove());

    // Text node walk — replace competitor brand names in text
    const replacements = [
      [/సాక్షి/g, 'ఆదర్శ న్యూస్'],
      [/Sakshi(?!\.com)/gi, 'Adarsha News'],
    ];

    function walkTextNodes(node) {
      if (node.nodeType === 3) {
        let text = node.textContent;
        replacements.forEach(([pattern, replacement]) => {
          text = text.replace(pattern, replacement);
        });
        node.textContent = text;
      } else {
        node.childNodes.forEach(walkTextNodes);
      }
    }
    walkTextNodes(doc.body);

    // Remove intro lines like "సాక్షి, నెల్లూరు:" at start of paragraphs
    doc.querySelectorAll('p').forEach(p => {
      if (/^(సాక్షి|Sakshi)[,\s]/.test(p.textContent.trim())) {
        // Strip the prefix up to the colon
        const text = p.textContent;
        const colonIdx = text.indexOf(':');
        if (colonIdx > 0 && colonIdx < 40) {
          p.textContent = text.substring(colonIdx + 1).trim();
        }
      }
    });

    return doc.body.innerHTML.trim();
  } catch (e) {
    // Fallback: regex-only cleanup
    return html
      .replace(/<a[^>]+(?:sakshi\.com\/mobile-apps|play\.google\.com|special\.sakshi)[^>]*>[\s\S]*?<\/a>/gi, '')
      .replace(/<img[^>]+Sakshi-Mobile[^>]*\/?>/gi, '')
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
