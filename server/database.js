const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'news.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Added articleContent column
        db.run(`CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            link TEXT UNIQUE NOT NULL,
            pubDate TEXT,
            contentSnippet TEXT,
            articleContent TEXT,
            source TEXT,
            category TEXT,
            imageUrl TEXT,
            language TEXT DEFAULT 'te'
        )`, (err) => {
            if (err) {
                console.error("Table creation error:", err.message);
            } else {
                // If the table already exists but without articleContent, we should alter it.
                // Catch error if column already exists.
                db.run(`ALTER TABLE news ADD COLUMN articleContent TEXT`, (alterErr) => {
                    if(alterErr && !alterErr.message.includes('duplicate column name')) {
                        console.error('Error altering table:', alterErr.message);
                    }
                });
            }
        });
    }
});

module.exports = db;
