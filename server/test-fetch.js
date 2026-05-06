const { fetchNews } = require('./fetcher');
const db = require('./database');

async function test() {
    console.log("Starting test fetch...");
    try {
        await fetchNews();
        const count = await db.count({});
        console.log(`Total articles in DB: ${count}`);
        const latest = await db.find({}).sort({ _id: -1 }).limit(1);
        console.log("Latest article:", JSON.stringify(latest, null, 2));
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
