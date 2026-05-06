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
require('dotenv').config();

if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️  GEMINI_API_KEY is missing! AI rewriting will be skipped.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
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

// Path to the output JSON file (inside the project's public folder)
const OUTPUT_PATH = path.resolve(__dirname, '..', 'public', 'news-data.json');

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
    suffixes.forEach(pattern => { cleaned = cleaned.replace(pattern, ""); });
    return cleaned.trim();
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
        const metaTags = document.getElementsByTagName('meta');
        for (let i = 0; i < metaTags.length; i++) {
            const property = metaTags[i].getAttribute('property') || metaTags[i].getAttribute('name');
            if (property === 'og:image' || property === 'twitter:image') {
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
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

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
            const fetchedData = await parser.parseURL(feed.url);
            const topItems = fetchedData.items.slice(0, 5);

            for (const item of topItems) {
                if (existingLinks.has(item.link)) continue;

                console.log(`Processing: ${item.title}`);
                const scraped = await scrapeArticle(item.link);

                let imageUrl = scraped.image || "";
                if (!imageUrl && scraped.htmlContent) {
                    const imgMatch = scraped.htmlContent.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch) imageUrl = imgMatch[1];
                }
                if (!imageUrl && item.enclosure?.url) imageUrl = item.enclosure.url;
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
        // Merge new articles at the top, keep only last 500 to avoid huge files
        const allNews = [...newArticles, ...existingNews].slice(0, 500);

        // Make sure the public directory exists
        const publicDir = path.dirname(OUTPUT_PATH);
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allNews, null, 2), 'utf-8');
        console.log(`✅ ${addedCount} new articles added. Total: ${allNews.length}. Saved to news-data.json`);
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
