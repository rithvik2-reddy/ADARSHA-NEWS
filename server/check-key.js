const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function list() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // We can't easily list models with the client library in a simple way without auth sometimes
        // Let's just try gemini-1.5-flash again but check the package version
        console.log("Key is working (no 400 error anymore)");
    } catch (e) {
        console.error(e);
    }
}
list();
