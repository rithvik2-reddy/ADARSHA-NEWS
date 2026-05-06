const mongoose = require('mongoose');
const Datastore = require('nedb-promises');
const path = require('path');
require('dotenv').config();

let db;

if (process.env.MONGODB_URI) {
    console.log('Using MongoDB Atlas for database.');
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB Atlas.'))
        .catch(err => console.error('MongoDB Connection Error:', err));

    // Define Schema for MongoDB
    const NewsSchema = new mongoose.Schema({
        title: String,
        link: { type: String, unique: true },
        pubDate: String,
        contentSnippet: String,
        articleContent: String,
        source: String,
        category: String,
        imageUrl: String,
        language: String
    });

    const NewsModel = mongoose.model('News', NewsSchema);

    // Wrapper to keep compatibility with NeDB methods
    db = {
        insert: (data) => NewsModel.create(data),
        find: (query) => ({
            sort: (sort) => ({
                skip: (skip) => ({
                    limit: (limit) => NewsModel.find(query).sort(sort).skip(skip).limit(limit)
                }),
                limit: (limit) => NewsModel.find(query).sort(sort).limit(limit)
            }),
            limit: (limit) => NewsModel.find(query).limit(limit)
        }),
        findOne: (query) => NewsModel.findOne(query),
        count: (query) => NewsModel.countDocuments(query),
        ensureIndex: () => {} // Not needed for Mongoose if defined in schema
    };
} else {
    console.log('Using Local NeDB (news.db) for database.');
    const nedb = Datastore.create({
        filename: path.resolve(__dirname, 'news.db'),
        autoload: true
    });
    nedb.ensureIndex({ fieldName: 'link', unique: true });
    db = nedb;
}

module.exports = db;
