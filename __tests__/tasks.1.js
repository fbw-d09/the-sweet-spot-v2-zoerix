const puppeteer = require("puppeteer");
const path = require('path');

const browserOptions = {
    headless: true,
    ignoreHTTPSErrors: true,
    defaultViewport: null,
    devtools: false,
}
let browser;
let page;

beforeAll(async () => {
    browser = await puppeteer.launch(browserOptions);
    page = await browser.newPage();
    await page.goto('file://' + path.resolve('./index.html'));
}, 30000);

afterAll((done) => {
    try {
        this.puppeteer.close();
    } catch (e) { }
    done();
});

describe("HTML basics", () => {
    it("`index.html` should have appropriate meta tags", async () => {
        const metaTags = await page.$$('meta');
        expect(metaTags.length).toBeGreaterThan(1);
    });
    it("`index.html` should have a title tag", async () => {
        const title = await page.$eval('title', el => el.innerHTML);
        expect(title).toBeTruthy()
    });
    it("Images should be used", async () => {
        const images = await page.$$('img');
        expect(images.length).toBeGreaterThan(1);
        expect(images).toBeTruthy();
    });
})
describe("Header", () => {
    it("Homepage Should use header image", async () => {
        //the image main-header.jpg should be at the top of the page
        const headerImage = await page.evaluate(() => {
            const img = Array.from(document.querySelectorAll('img')).find(img => img.src.includes('header'));
            // it should be at the top pf the page
            const rect = img.getBoundingClientRect();
            return rect.top;
        });
        expect(headerImage).toBeLessThan(30); // 30px from the top of the page is fine for the header image to be at the top of the page 
    });
})
describe("Our Treats", () => {
    it("Lollipop Image should be floated left of the text", async () => {
        // get the image containing lollipop.png on src attribute
        const float = await page.$eval('img[src*="lollipop.jpg"]', el => getComputedStyle(el).float);
        expect(float).toBe('left');
    });
    it("Lollipop Image should have a border", async () => {
        // get the image containing lollipop.png on src attribute
        const border = await page.$eval('img[src*="lollipop.jpg"]', el => getComputedStyle(el).border);
        expect(parseInt(border.split('px ')[0])).toBeGreaterThan(1);
    });
    it("Lollipop Image should have border-radius set", async () => {
        // get the image containing lollipop.png on src attribute
        const borderRadius = await page.$eval('img[src*="lollipop.jpg"]', el => getComputedStyle(el).borderRadius);
        expect(borderRadius).not.toBe('0px');
    });
    it("Multiple background colors should be used", async () => {
        // get all elements background color
        const backgroundColors = await page.$$eval('*', el => el.map(e => getComputedStyle(e).backgroundColor));
        // delete the repeated background colors
        const uniqueBackgroundColors = [...new Set(backgroundColors)];
        expect(uniqueBackgroundColors.length).toBeGreaterThan(2);
    }),
        it("Candy-floss Image should be floated right of the text", async () => {
            const float = await page.$eval('img[src*="candy-floss.jpg"]', el => getComputedStyle(el).float);
            expect(float).toBe('right');
        });
    it("Candy-floss Image should have a border", async () => {
        const border = await page.$eval('img[src*="candy-floss.jpg"]', el => getComputedStyle(el).border);
        expect(parseInt(border.split(' ')[0])).toBeGreaterThan(1);
    });
    it("Candy-floss Image should have border-radius set", async () => {
        const borderRadius = await page.$eval('img[src*="candy-floss.jpg"]', el => getComputedStyle(el).borderRadius);
        expect(borderRadius).not.toBe('0%');
    });

    it("Jelly Bean Image should be floated alongside the text and have border & border-radius set", async () => {
        const border = await page.$eval('img[src*="jellybeans.jpg"]', el => getComputedStyle(el).border);
        const float = await page.$eval('img[src*="jellybeans.jpg"]', el => getComputedStyle(el).float);
        const borderRadius = await page.$eval('img[src*="jellybeans.jpg"]', el => getComputedStyle(el).borderRadius);
        expect(borderRadius).toBe('50%');
        expect(float).toBe('left');
        expect(parseInt(border.split(' ')[0])).toBeGreaterThan(1);
    });
    it("Images should be linked to their respective wikipedia pages", async () => {
        // get all a tags in the page that have an image as a child
        const links = await page.$$eval('a > img', el => el.filter(e => e.parentElement.href.includes('wikipedia')));
        // each link should contain the word 'wikipedia' in it
        expect(links.length).toBeGreaterThan(2);
    });
});
describe("Contact Page", () => {
    it("The 'Drop me a line' link Should redirect to `contact.html` page", async () => {
        const targetBlank = await page.$eval('a[href="contact.html"]', el => el.hasAttribute('target'));
        if (targetBlank === true) {
            const [newPage] = await Promise.all([
                new Promise(x => browser.once('targetcreated', target => x(target.page()))),
                page.click('a[href="contact.html"]'),
            ]);
            const url = await newPage.url();
            expect(url).toMatch(/contact.html/);
        } else {
            const [samePage] = await Promise.all([
                page.waitForNavigation(),
                page.click('a[href="contact.html"]'),
            ]);
            const url = await samePage.url();
            expect(url).toMatch(/contact.html/);
        }
    });
    it("Contact Page Should contain a 'go back' link to index.html", async () => {
        await page.goto('file://' + path.resolve('./contact.html'));
        const targetBlank = await page.$eval('a[href$="index.html"]', el => el.hasAttribute('target'));
        if (targetBlank === true) {
            const [newPage] = await Promise.all([
                new Promise(x => browser.once('targetcreated', target => x(target.page()))),
                page.click('a[href="index.html"]'),
            ]);
            const url = await newPage.url();
            expect(url).toMatch(/index.html/);
        } else {
            const [samePage] = await Promise.all([
                page.waitForNavigation(),
                page.click('a[href="index.html"]'),
            ]);
            const url = await samePage.url();
            expect(url).toMatch(/index.html/);
        }
    });
    it("Contact page exists", async () => {
        await page.goto('file://' + path.resolve('./contact.html'));
        expect(page.url()).toBe('file://' + path.resolve('./contact.html'));
        const body = await page.$eval('body', el => el.innerHTML);
        expect(body).toBeTruthy();
    });
})
