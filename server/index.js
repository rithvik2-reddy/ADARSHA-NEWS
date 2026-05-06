const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const db = require('./database');
const { fetchNews } = require('./fetcher');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check for Render
app.get('/health', (req, res) => res.send('OK'));

// Route to manually trigger fetcher (for external crons)
app.get('/api/cron-fetch', async (req, res) => {
    console.log('External cron trigger received.');
    fetchNews();
    res.send('Fetcher triggered.');
});

// Run fetcher immediately on start
fetchNews();

// Schedule fetcher to run every 20 minutes
cron.schedule('*/20 * * * *', () => {
    console.log('Cron job triggered: Fetching news...');
    fetchNews();
});

// API Routes
app.get('/api/news', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const rows = await db.find({}).sort({ createdAt: -1 }).skip(offset).limit(limit);
        const mapped = rows.map(r => ({ ...r, id: r._id }));
        res.json({ data: mapped });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/news/latest', async (req, res) => {
    try {
        const rows = await db.find({}).sort({ createdAt: -1 }).limit(6);
        const mapped = rows.map(r => ({ ...r, id: r._id }));
        res.json({ data: mapped });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/news/category/:category', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const rows = await db.find({ category: req.params.category }).sort({ createdAt: -1 }).limit(limit);
        const mapped = rows.map(r => ({ ...r, id: r._id }));
        res.json({ data: mapped });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/news/article/:id', async (req, res) => {
    try {
        const row = await db.findOne({ _id: req.params.id });
        if (!row) return res.status(404).json({ error: 'Article not found' });
        res.json({ data: { ...row, id: row._id } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
