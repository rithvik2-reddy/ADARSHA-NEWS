const Datastore = require('nedb-promises');
const path = require('path');

async function migrate() {
    const dbPath = path.resolve(__dirname, 'news.db');
    console.log(`Migrating database at ${dbPath}...`);
    
    const db = Datastore.create({
        filename: dbPath,
        autoload: true
    });

    const docs = await db.find({});
    console.log(`Found ${docs.length} documents.`);

    let updatedCount = 0;
    for (const doc of docs) {
        if (!doc.createdAt) {
            // Use pubDate if available, otherwise use a default old date or current date
            const createdAt = doc.pubDate ? new Date(doc.pubDate).getTime() : Date.now();
            
            // If the date is invalid (NaN), use current time
            const finalCreatedAt = isNaN(createdAt) ? Date.now() : createdAt;

            await db.update({ _id: doc._id }, { $set: { createdAt: finalCreatedAt } });
            updatedCount++;
        }
    }

    console.log(`Successfully updated ${updatedCount} documents with createdAt timestamps.`);
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
