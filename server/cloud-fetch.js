/**
 * cloud-fetch.js
 * Runs on GitHub Actions every 30 minutes.
 * Fetches latest news and writes them to public/news-data.json
 * so the website can read it directly from GitHub (no server needed!).
 */

const Parser = require('rss-parser');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️  GEMINI_API_KEY is missing! AI rewriting will be skipped.");
} else {
    console.log("✅ GEMINI_API_KEY found. AI features enabled.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const parser = new Parser({
    customFields: {
        item: ['media:content', 'enclosure', 'description', 'content:encoded']
    }
});

const RSS_FEEDS = [
    // Politics & Home
    { url: 'https://www.sakshi.com/rss/home.xml', category: 'Politics' },
    { url: 'https://telugu.samayam.com/rssfeeds/2122866.cms', category: 'Politics' },
    { url: 'https://telugu.abplive.com/news/politics/feed', category: 'Politics' },
    { url: 'https://tv9telugu.com/politics/feed', category: 'Politics' },
    { url: 'https://ntvtelugu.com/category/politics/feed', category: 'Politics' },
    
    // Latest & Top Stories
    { url: 'https://www.sakshi.com/rss/latest-news.xml', category: 'Latest' },
    { url: 'https://www.sakshi.com/rss/top-stories.xml', category: 'Latest' },
    { url: 'https://telugu.samayam.com/rssfeeds/2122863.cms', category: 'Latest' },
    { url: 'https://tv9telugu.com/feed', category: 'Latest' },
    { url: 'https://ntvtelugu.com/feed', category: 'Latest' },
    { url: 'https://www.v6velugu.com/feed', category: 'Latest' },
    
    // Andhra Pradesh
    { url: 'https://www.sakshi.com/rss/andhra-pradesh.xml', category: 'AndhraPradesh' },
    { url: 'https://telugu.samayam.com/andhra-pradesh/articlelist/2122822.cms', category: 'AndhraPradesh' },
    { url: 'https://telugu.abplive.com/andhra-pradesh/feed', category: 'AndhraPradesh' },
    { url: 'https://tv9telugu.com/andhra-pradesh/feed', category: 'AndhraPradesh' },
    { url: 'https://ntvtelugu.com/category/andhra-pradesh/feed', category: 'AndhraPradesh' },
    
    // Telangana
    { url: 'https://www.sakshi.com/rss/telangana.xml', category: 'Telangana' },
    { url: 'https://telugu.samayam.com/telangana/articlelist/2122821.cms', category: 'Telangana' },
    { url: 'https://telugu.abplive.com/telangana/feed', category: 'Telangana' },
    { url: 'https://tv9telugu.com/telangana/feed', category: 'Telangana' },
    { url: 'https://ntvtelugu.com/category/telangana/feed', category: 'Telangana' },
    { url: 'https://www.ntnews.com/feed', category: 'Telangana' },
    
    // India & World
    { url: 'https://www.sakshi.com/rss/national.xml', category: 'India' },
    { url: 'https://telugu.abplive.com/news/india/feed', category: 'India' },
    { url: 'https://tv9telugu.com/national/feed', category: 'India' },
    { url: 'https://www.sakshi.com/rss/international.xml', category: 'World' },
    { url: 'https://telugu.abplive.com/news/world/feed', category: 'World' },
    { url: 'https://tv9telugu.com/international/feed', category: 'World' },
    
    // Business & Technology
    { url: 'https://www.sakshi.com/rss/business.xml', category: 'Business' },
    { url: 'https://www.sakshi.com/rss/features/technology.xml', category: 'Technology' },
    { url: 'https://telugu.samayam.com/rssfeeds/2122831.cms', category: 'Technology' },
    { url: 'https://tv9telugu.com/technology/feed', category: 'Technology' },
    
    // Cinema & Sports
    { url: 'https://www.sakshi.com/rss/entertainment.xml', category: 'Cinema' },
    { url: 'https://telugu.samayam.com/rssfeeds/2122824.cms', category: 'Cinema' },
    { url: 'https://telugu.abplive.com/entertainment/feed', category: 'Cinema' },
    { url: 'https://tv9telugu.com/entertainment/feed', category: 'Cinema' },
    { url: 'https://ntvtelugu.com/category/entertainment/feed', category: 'Cinema' },
    { url: 'https://www.sakshi.com/rss/sports.xml', category: 'Sports' },
    { url: 'https://telugu.samayam.com/rssfeeds/2122827.cms', category: 'Sports' },
    { url: 'https://tv9telugu.com/sports/feed', category: 'Sports' },
    { url: 'https://10tv.in/feed', category: 'Latest' },
    { url: 'https://www.andhrajyothy.com/rss/latest-news.xml', category: 'Latest' }
];

// Path to the output JSON file (inside the project's public folder)
const OUTPUT_PATH = path.resolve(__dirname, '..', 'public', 'news-data.json');

function cleanTitle(title) {
    if (!title) return "";
    const suffixes = [
        / - Sakshi$/i, / - NTV$/i, / - Eenadu$/i, / - Namasthe Telangana$/i,
        / - Andhrajyothy$/i, / - Samayam Telugu$/i, / - 10TV$/i, / - ABP Desam$/i,
        / - Times Now Telugu$/i, / - Google News$/i, / - BBC News$/i, / - BBC$/i,
        / \| Sakshi$/i, / \| NTV$/i, / \| Eenadu$/i, / \| Samayam$/i, / \| 10TV$/i,
        / \- TV9 Telugu$/i, / \- TV5$/i, / \- V6 News$/i, /Sakshi Post$/i,
        / - TV9$/i, / - V6 Velugu$/i, / - NT News$/i, / - ABP News$/i
    ];
    let cleaned = title;
    suffixes.forEach(pattern => { cleaned = cleaned.replace(pattern, ""); });
    return cleaned.trim();
}

function cleanContent(html) {
    if (!html) return "";
    
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const sanitizationLog = [];
    const logRemoval = (reason, sample = "") => {
        sanitizationLog.push({ reason, sample: String(sample || "").slice(0, 120) });
    };

    // 1. Remove specific known branding/ad selectors
    const selectorsToRemove = [
        '.app-download-banner', '.footer-credits', '.source-branding',
        '.sakshi-play-store', '.social-share-strip', 'script', 'style', 'iframe',
        '.ad-container', '.sponsored-content', 'button', '.newsletter-signup',
        '.download-app', '.google-play-link', '.appstore-link', '.sakshi-mobile-apps',
        '.tv9-app-banner', '.ntv-app-link', '.samayam-download', '.abp-app-link'
    ];
    selectorsToRemove.forEach(sel => {
        doc.querySelectorAll(sel).forEach(el => {
            logRemoval(`selector:${sel}`, el.textContent);
            el.remove();
        });
    });

    // 2. Remove all external app links and competitor links
    const links = doc.querySelectorAll('a');
    links.forEach(link => {
        const href = link.getAttribute('href') || '';
        const text = (link.textContent || '').toLowerCase();
        if (
            href.includes('sakshi.com') ||
            href.includes('tv9telugu.com') ||
            href.includes('ntvtelugu.com') ||
            href.includes('eenadu.net') ||
            href.includes('v6velugu.com') ||
            href.includes('ntnews.com') ||
            href.includes('play.google.com') ||
            href.includes('apps.apple.com') ||
            href.includes('apple.com/app-store') ||
            text.includes('play store') ||
            text.includes('download app') ||
            text.includes('సాక్షి') ||
            text.includes('ఈనాడు') ||
            text.includes('నమస్తే తెలంగాణ')
        ) {
            logRemoval('branding-link', href || text);
            link.remove();
        }
    });

    // 3. Remove all images that look like app banners or competitor logos
    const imgs = doc.querySelectorAll('img');
    imgs.forEach(img => {
        const alt = (img.getAttribute('alt') || '').toLowerCase();
        const src = (img.getAttribute('src') || '').toLowerCase();
        if (alt.includes('download') || alt.includes('app') || alt.includes('sakshi') || 
            alt.includes('tv9') || alt.includes('ntv') || alt.includes('eenadu') ||
            src.includes('playstore') || src.includes('appstore') || src.includes('banner') ||
            src.includes('sakshi-mobile-apps') || src.includes('stickey') ||
            src.includes('logo')) {
            logRemoval('promo-image', src || alt);
            img.remove();
        }
    });

    // 4. Remove intro/footer branding blocks
    const introOrFooterPatterns = [
        /^సాక్షి[,:\s-]/i,
        /^sakshi[,:\s-]/i,
        /^సాక్షి ప్రతినిధి/i,
        /^sakshi representative/i,
        /^టీవీ9[,:\s-]/i,
        /^tv9[,:\s-]/i,
        /^ఎన్‌టీవీ[,:\s-]/i,
        /^ntv[,:\s-]/i,
        /download.*app/i,
        /google play/i,
        /app store/i
    ];
    doc.querySelectorAll('p, div, span, strong').forEach((el) => {
        if (el.children.length > 0) return;
        const text = (el.textContent || '').trim();
        if (!text) return;
        const shouldRemove = introOrFooterPatterns.some((pattern) => pattern.test(text));
        if (shouldRemove) {
            logRemoval('intro-footer-branding', text);
            el.remove();
        }
    });

    // Convert all remaining <a> tags to plain text (prevents links to other sites)
    doc.querySelectorAll('a').forEach(a => {
        const text = a.textContent;
        a.replaceWith(text);
    });

    // Remove script, style, iframe, etc.
    doc.querySelectorAll('script, style, iframe, button, ins').forEach(el => el.remove());

    let finalHtml = doc.body.innerHTML;
    
    // Patterns for phone numbers and contact info
    finalHtml = finalHtml.replace(/\d{10}/g, ""); // Basic 10-digit removal
    finalHtml = finalHtml.replace(/\d{5}[-\s]\d{5}/g, ""); // Spaced/hyphenated
    
    const BLACKLIST = [
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
    BLACKLIST.forEach(([pattern, replacement]) => {
        finalHtml = finalHtml.replace(pattern, replacement);
    });
    
    // Remove common reporter signatures
    finalHtml = finalHtml.replace(/వై\.వెంకటసుబ్బారెడ్డి/g, "");

    return finalHtml.trim();
}

async function scrapeArticle(url) {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 10000
        });
        const dom = new JSDOM(response.data, { url });
        const document = dom.window.document;

        let image = "";
        const metaTags = document.querySelectorAll('meta');
        metaTags.forEach(meta => {
            const prop = meta.getAttribute('property') || meta.getAttribute('name');
            const content = meta.getAttribute('content');
            if (content && ['og:image', 'twitter:image', 'image', 'thumbnail', 'image_src'].includes(prop)) {
                if (!image) image = content;
            }
        });
        
        // Check link tags
        if (!image) {
            const linkTag = document.querySelector('link[rel="image_src"]');
            if (linkTag) image = linkTag.getAttribute('href');
        }

        // If meta failed, try first high-res image in body, checking for lazy attributes
        if (!image) {
            const bodyImgs = Array.from(document.querySelectorAll('img')).filter(img => {
                const src = img.getAttribute('data-src') || img.getAttribute('data-original') || img.getAttribute('src') || '';
                return src.startsWith('http') && !src.includes('ads') && !src.includes('icon') && !src.includes('pixel');
            });
            if (bodyImgs.length > 0) {
                const bestImg = bodyImgs[0];
                image = bestImg.getAttribute('data-src') || bestImg.getAttribute('data-original') || bestImg.getAttribute('src');
            }
        }
        
        // Readability parse
        const reader = new Readability(document);
        const article = reader.parse();
        
        // If readability found an image that we didn't, use it
        if (!image && article && article.featured_image) {
            image = article.featured_image;
        }

        // Sanitize the content right after scraping
        const sanitizedHtml = cleanContent(article ? article.content : "");
        const sanitizedText = article ? article.textContent.trim() : "";

        return {
            title: article ? article.title : "",
            content: sanitizedText,
            htmlContent: sanitizedHtml,
            image: image || ""
        };
    } catch (e) {
        return { content: "", htmlContent: "", image: "" };
    }
}

async function aiRewrite(title, snippet) {
    try {
        const prompt = `Rewrite this news as a professional Adarsha News original article in Telugu. 
        IMPORTANT: Remove ALL mentions of the source brand (Sakshi, etc.), app download links, or external publisher metadata. 
        The article must feel like 100% original Adarsha News content.
        Headline: ${title}
        Content: ${snippet}
        Return JSON { "newTitle": "...", "newContent": "HTML <p>..." }`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
        return null;
    }
}

async function run() {
    console.log(`[${new Date().toISOString()}] ☁️  GitHub Actions Cloud Fetch Starting...`);

    const publicDir = path.dirname(OUTPUT_PATH);
    console.log(`Targeting output path: ${OUTPUT_PATH}`);
    if (!fs.existsSync(publicDir)) {
        console.log(`Creating public directory: ${publicDir}`);
        fs.mkdirSync(publicDir, { recursive: true });
    }

    // Load existing news to avoid duplicates
    let existingNews = [];
    try {
        if (fs.existsSync(OUTPUT_PATH)) {
            const raw = fs.readFileSync(OUTPUT_PATH, 'utf-8');
            existingNews = raw ? JSON.parse(raw) : [];
            console.log(`Loaded ${existingNews.length} existing articles.`);
        }
    } catch (e) {
        console.log('Error reading existing news file, starting fresh.');
        existingNews = [];
    }

    const existingLinks = new Set(existingNews.map(n => n.link));
    let newArticles = [];
    let addedCount = 0;

    for (const feed of RSS_FEEDS) {
        try {
            let fetchedData;
            try {
                fetchedData = await parser.parseURL(feed.url);
            } catch (rssErr) {
                console.log(`[RSS Fallback] ${feed.url} failed, trying HTML scraping...`);
                // Fallback: Fetch as HTML and extract links
                const res = await axios.get(feed.url, { 
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                    timeout: 10000 
                });
                const html = res.data;
                const linkRegex = /href="([^"]+\/telugu-news\/[^"]+-\d+)"/g;
                const matches = [...html.matchAll(linkRegex)];
                const links = [...new Set(matches.map(m => m[1]))];
                
                fetchedData = {
                    items: links.map(link => ({
                        link,
                        title: "News Update", // Will be updated by scrapeArticle
                        pubDate: new Date().toISOString()
                    }))
                };
            }

            const topItems = fetchedData.items.slice(0, 15);

            for (const item of topItems) {
                if (existingLinks.has(item.link)) continue;

                console.log(`Processing: ${item.title}`);
                const scraped = await scrapeArticle(item.link);

                let imageUrl = scraped.image || "";
                
                // Final safety for image selection: remove ads or branded placeholders
                const BRANDING_KEYWORDS = ['Sakshi-Mobile-Apps', 'stickey', 'app-download', 'google-play', 'app-store', 'branding', 's3fs-public'];
                if (BRANDING_KEYWORDS.some(kw => imageUrl.includes(kw))) {
                    imageUrl = "";
                }

                if (!imageUrl && scraped.htmlContent) {
                    const imgMatch = scraped.htmlContent.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch && !imgMatch[1].includes('Sakshi-Mobile-Apps')) imageUrl = imgMatch[1];
                }
                if (!imageUrl && item.enclosure?.url) imageUrl = item.enclosure.url;
                
                if (!imageUrl || imageUrl === "undefined") {
                    const fallbacks = [
                        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000',
                        'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1000',
                        'https://images.unsplash.com/photo-1585829365234-78d955d29511?q=80&w=1000',
                        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1000',
                        'https://images.unsplash.com/photo-1503694978374-8a2fa686963a?q=80&w=1000'
                    ];
                    imageUrl = fallbacks[Math.floor(Math.random() * fallbacks.length)];
                }

                let finalTitle = cleanTitle(scraped.title || item.title);
                let finalContent = scraped.htmlContent || `<p>${item.contentSnippet || item.title}</p>`;

                try {
                    const aiResult = await aiRewrite(item.title, scraped.content || item.contentSnippet || item.title);
                    if (aiResult) {
                        finalTitle = aiResult.newTitle;
                        finalContent = aiResult.newContent;
                        console.log(`   ✨ AI Rewrote: ${finalTitle}`);
                    } else {
                        console.log(`   ⏩ AI Skip (Using Original): ${finalTitle}`);
                    }
                } catch (aiErr) {
                    console.warn(`   ⚠️ AI Error for "${item.title}":`, aiErr.message);
                }
                
                // Final safety sanitization for content
                finalContent = cleanContent(finalContent);

                const article = {
                    id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    title: finalTitle,
                    link: item.link,
                    pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
                    createdAt: Date.now(),
                    contentSnippet: item.contentSnippet || "",
                    articleContent: finalContent,
                    source: 'Adarsha News Editorial',
                    category: feed.category,
                    imageUrl,
                    language: 'te'
                };

                newArticles.push(article);
                existingLinks.add(item.link);
                addedCount++;
            }
        } catch (error) {
            console.error(`Feed Error ${feed.url}:`, error.message);
        }
    }

    if (addedCount > 0) {
        // Keep only latest 100 articles to maintain high speed
        const updatedNews = [
            ...newArticles,
            ...existingNews.filter(old => !existingLinks.has(old.link))
        ].slice(0, 500);

        // Make sure the public directory exists
        const publicDir = path.dirname(OUTPUT_PATH);
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(updatedNews, null, 2), 'utf-8');
        console.log(`✅ ${addedCount} new articles added. Total: ${updatedNews.length}. Saved to news-data.json`);
    } else {
        console.log('No new articles found.');
    }

    console.log('☁️  Cloud Fetch Complete.');
    process.exit(0);
}

run().catch(e => {
    console.error('Fatal Error:', e);
    process.exit(1);
});
