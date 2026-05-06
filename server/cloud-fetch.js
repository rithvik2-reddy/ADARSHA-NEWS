const { fetchNews } = require('./fetcher');
const db = require('./database');

async function run() {
    console.log("Starting Cloud News Fetch...");
    try {
        await fetchNews();
        console.log("Cloud News Fetch Complete.");
        process.exit(0);
    } catch (e) {
        console.error("Cloud News Fetch Failed:", e);
        process.exit(1);
    }
}

run();
