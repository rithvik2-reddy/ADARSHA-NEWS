const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'public', 'news-data.json');
if (fs.existsSync(dataPath)) {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const cleaned = data.map(article => {
        if (article.imageUrl && (article.imageUrl.includes('Sakshi-Mobile-Apps') || article.imageUrl.includes('stickey'))) {
            article.imageUrl = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000';
        }
        if (article.articleContent) {
            // Very basic string cleaning for existing content
            article.articleContent = article.articleContent
                .replace(/సాక్షి/g, 'ఆదర్శ')
                .replace(/Sakshi/g, 'Adarsha');
        }
        return article;
    });
    fs.writeFileSync(dataPath, JSON.stringify(cleaned, null, 2));
    console.log('Cleaned existing news data.');
}
