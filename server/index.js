const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const db = require('./database');
const { fetchNews } = require('./fetcher');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check for Render deployment
app.get('/health', (req, res) => res.send('OK'));

// Run fetcher immediately on start
fetchNews();

// Schedule fetcher to run every 20 minutes
cron.schedule('*/20 * * * *', () => {
    console.log('Cron job triggered: Fetching news...');
    fetchNews();
});

// API Routes
app.get('/api/news', (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    
    db.all(`SELECT id, title, link, pubDate, contentSnippet, source, category, imageUrl, language FROM news ORDER BY id DESC LIMIT ? OFFSET ?`, [limit, offset], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows });
    });
});

app.get('/api/news/category/:category', (req, res) => {
    const category = req.params.category;
    const limit = parseInt(req.query.limit) || 20;
    
    db.all(`SELECT id, title, link, pubDate, contentSnippet, source, category, imageUrl, language FROM news WHERE category = ? ORDER BY id DESC LIMIT ?`, [category, limit], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows });
    });
});

app.get('/api/news/latest', (req, res) => {
    db.all(`SELECT id, title, link, pubDate, contentSnippet, source, category, imageUrl, language FROM news ORDER BY id DESC LIMIT 6`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows });
    });
});

// New Endpoint to get full article by ID
app.get('/api/news/article/:id', (req, res) => {
    const id = req.params.id;
    db.get(`SELECT * FROM news WHERE id = ?`, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Article not found" });
        }
        res.json({ data: row });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
