const Datastore = require('nedb-promises');
const path = require('path');

const db = Datastore.create({
    filename: path.resolve(__dirname, 'news.db'),
    autoload: true
});

// Ensure unique index on link field
db.ensureIndex({ fieldName: 'link', unique: true });

console.log('Connected to NeDB database.');

module.exports = db;
