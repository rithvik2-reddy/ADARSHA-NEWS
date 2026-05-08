const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, 'public/news-data.json');

async function fixData() {
    try {
        if (!fs.existsSync(OUTPUT_PATH)) {
            console.log("No file to fix.");
            return;
        }
        const data = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
        console.log(`Fixing ${data.length} articles...`);
        
        // Clean up any corrupted text (just in case)
        const cleanData = data.map(item => ({
            ...item,
            title: item.title.replace(/[^\x00-\x7F\u0C00-\u0C7F\s.,!?-]/g, ''), // Keep ASCII + Telugu + basic punctuation
        }));

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(cleanData, null, 2), 'utf-8');
        console.log("✅ Fixed news-data.json");
    } catch (e) {
        console.error(e);
    }
}

fixData();
