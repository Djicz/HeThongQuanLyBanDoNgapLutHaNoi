const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
        const html = await page.content();
        console.log("HTML:", html);
        await browser.close();
    } catch (err) {
        console.error(err);
    }
})();
