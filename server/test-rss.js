const axios = require('axios');
async function test() {
    try {
        const res = await axios.get('https://www.sakshi.com/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const m = res.data.match(/href="([^"]+rss[^"]+)"/g);
        console.log(m ? m : 'No RSS links found');
        
        // Also check if the RSS URL itself returns HTML or XML
        const rssRes = await axios.get('https://www.sakshi.com/rss/home.xml', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        console.log('RSS Content Start:', rssRes.data.substring(0, 200));
    } catch (e) {
        console.error(e.message);
    }
}
test();
