const db = require('./database');

async function test() {
    try {
        console.log('Testing DB...');
        const count = await db.count({});
        console.log('Total articles:', count);
        const latest = await db.find({}).sort({ _id: -1 }).limit(1);
        console.log('Latest article:', latest[0] ? latest[0].title : 'None');
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

test();
