const puppeteer = require("puppeteer");

async function run() {
  console.log("Launching diagnostic browser...");
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
  });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log('PAGE LOG:', msg.text());
  });
  
  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.toString());
  });

  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      console.log('=== MAIN FRAME NAVIGATED TO:', frame.url());
    }
  });

  try {
    console.log("Navigating to http://localhost:3000/signup...");
    await page.goto("http://localhost:3000/signup", { waitUntil: "load" });
    
    console.log("Waiting 5 seconds...");
    await new Promise(r => setTimeout(r, 5000));
    
    console.log("Final URL:", page.url());
    console.log("Title:", await page.title());
  } catch (err) {
    console.error("Diagnostic error:", err.message);
  } finally {
    await browser.close();
  }
}

run();
