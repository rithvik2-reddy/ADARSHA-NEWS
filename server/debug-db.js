const db = require('./database');

db.all("SELECT * FROM news LIMIT 3", (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    rows.forEach(row => {
        console.log(`ID: ${row.id}`);
        console.log(`TITLE: ${row.title}`);
        console.log(`IMAGE: ${row.imageUrl}`);
        console.log(`SOURCE: ${row.source}`);
        console.log(`CONTENT LENGTH: ${row.articleContent ? row.articleContent.length : 0}`);
        console.log('---');
    });
    process.exit();
});
