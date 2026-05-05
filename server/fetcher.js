const Parser = require('rss-parser');
const db = require('./database');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const parser = new Parser({
    customFields: {
        item: ['media:content', 'enclosure', 'description', 'content:encoded']
    }
});

const RSS_FEEDS = [
    { url: 'https://www.sakshi.com/rss/home.xml', category: 'Latest' },
    { url: 'https://www.sakshi.com/rss/andhra-pradesh.xml', category: 'National' },
    { url: 'https://www.sakshi.com/rss/international.xml', category: 'World' },
    { url: 'https://www.sakshi.com/rss/business.xml', category: 'Business' },
    { url: 'https://www.sakshi.com/rss/features/technology.xml', category: 'Technology' },
    { url: 'https://www.sakshi.com/rss/entertainment.xml', category: 'Entertainment' },
    { url: 'https://www.sakshi.com/rss/sports.xml', category: 'Sports' }
];

function cleanTitle(title) {
    if (!title) return "";
    const suffixes = [
        / - Sakshi$/i, / - NTV$/i, / - Eenadu$/i, / - Namasthe Telangana$/i, 
        / - Andhrajyothy$/i, / - Samayam Telugu$/i, / - 10TV$/i, / - ABP Desam$/i,
        / - Times Now Telugu$/i, / - Google News$/i, / - BBC News$/i, / - BBC$/i,
        / \| Sakshi$/i, / \| NTV$/i, / \| Eenadu$/i, / \| Samayam$/i, / \| 10TV$/i,
        / \- TV9 Telugu$/i, / \- TV5$/i, / \- V6 News$/i, /Sakshi Post$/i
    ];
    let cleaned = title;
    suffixes.forEach(pattern => {
        cleaned = cleaned.replace(pattern, "");
    });
    return cleaned.trim();
}

async function scrapeArticle(url) {
    try {
        const response = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
            },
            timeout: 10000
        });
        const dom = new JSDOM(response.data, { url });
        const document = dom.window.document;
        
        let image = "";
        const metaTags = document.getElementsByTagName('meta');
        for (let i = 0; i < metaTags.length; i++) {
            const property = metaTags[i].getAttribute('property') || metaTags[i].getAttribute('name');
            if (property === 'og:image' || property === 'twitter:image' || property === 'image') {
                image = metaTags[i].getAttribute('content');
                break;
            }
        }
        
        const reader = new Readability(document);
        const article = reader.parse();

        return {
            content: article ? article.textContent.trim() : "",
            htmlContent: article ? article.content : "",
            image: image || ""
        };
    } catch (e) {
        return { content: "", htmlContent: "", image: "" };
    }
}

async function aiRewrite(title, snippet) {
    try {
        const prompt = `Rewrite this news as a professional Adarsha News original article in Telugu. 
        Headline: ${title}
        Content: ${snippet}
        Return JSON { "newTitle": "...", "newContent": "HTML <p>..." }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
        return null;
    }
}

async function fetchNews() {
    console.log(`[${new Date().toISOString()}] Fetching fresh news...`);
    let addedCount = 0;

    for (const feed of RSS_FEEDS) {
        try {
            const fetchedData = await parser.parseURL(feed.url);
            const topItems = fetchedData.items.slice(0, 5);

            for (const item of topItems) {
                const exists = await new Promise((resolve) => {
                    db.get(`SELECT id FROM news WHERE link = ?`, [item.link], (err, row) => resolve(!!row));
                });
                if (exists) continue;

                console.log(`Processing: ${item.title}`);
                const scraped = await scrapeArticle(item.link);
                
                let imageUrl = scraped.image || "";
                
                // If still no image, try to extract from htmlContent
                if (!imageUrl && scraped.htmlContent) {
                    const imgMatch = scraped.htmlContent.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch) imageUrl = imgMatch[1];
                }

                if (!imageUrl && item.enclosure && item.enclosure.url) imageUrl = item.enclosure.url;
                
                // Default fallback
                if (!imageUrl || imageUrl === "undefined") {
                    imageUrl = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000';
                }

                let finalTitle = cleanTitle(item.title);
                let finalContent = scraped.htmlContent || `<p>${item.contentSnippet || item.title}</p>`;

                const aiResult = await aiRewrite(item.title, scraped.content || item.contentSnippet || item.title);
                if (aiResult) {
                    finalTitle = aiResult.newTitle;
                    finalContent = aiResult.newContent;
                }

                // Ultra-Aggressive Cleaning using JSDOM (Run after AI rewrite to ensure total removal)
                if (finalContent) {
                    const contentDom = new JSDOM(finalContent);
                    const contentDoc = contentDom.window.document;
                    
                    // Remove ALL links
                    contentDoc.querySelectorAll('a').forEach(a => {
                        const span = contentDoc.createElement('span');
                        span.innerHTML = a.innerHTML;
                        a.parentNode.replaceChild(span, a);
                    });

                    const patternsToRemove = ['sakshi', 'ntv', 'eenadu', 'andhrajyothy', 'tv9', 'google', 'app-download', '10tv', 'samayam'];
                    
                    contentDoc.querySelectorAll('img, div, p, span, a').forEach(el => {
                        const content = (el.src || el.href || el.className || el.id || el.textContent || "").toLowerCase();
                        if (patternsToRemove.some(p => content.includes(p))) {
                            el.remove();
                        }
                        if (el.tagName === 'IMG' && (el.src.includes('banner') || el.src.includes('app') || el.src.includes('google-play') || el.src.includes('logo'))) {
                            el.remove();
                        }
                    });

                    finalContent = contentDoc.body.innerHTML;
                }

                db.run(
                    `INSERT OR IGNORE INTO news (title, link, pubDate, contentSnippet, articleContent, source, category, imageUrl, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [finalTitle, item.link, item.pubDate || new Date().toISOString(), item.contentSnippet || "", finalContent, 'Adarsha News Editorial', feed.category, imageUrl, 'te'],
                    function(err) {
                        if (err) console.error('DB Error:', err.message);
                        else if (this.changes > 0) addedCount++;
                    }
                );
            }
        } catch (error) {
            console.error(`Feed Error ${feed.url}:`, error.message);
        }
    }
    console.log(`Update complete. Added ${addedCount} articles.`);
}

module.exports = { fetchNews };
