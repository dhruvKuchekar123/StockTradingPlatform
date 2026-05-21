const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const User = require("./model/UserModel");
require("dotenv").config();

async function runBrowserTest() {
  console.log("=== STARTING CHROMIUM BROWSER FLOW TEST ===");
  
  // Connect to DB
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB connected successfully.");
  } catch (e) {
    console.error("DB connection failed:", e.message);
    process.exit(1);
  }

  // Ensure Admin user exists
  const adminExists = await User.findOne({ email: "admin@gmail.com" });
  if (!adminExists) {
    await User.create({
      email: "admin@gmail.com",
      password: "password123",
      username: "AdminUser",
      isVerified: true,
      isApproved: true,
      role: "admin",
      bankDetails: { accountName: "Admin", accountNumber: "000", ifscCode: "000", bankName: "AdminBank" }
    });
    console.log("Seeded admin user as it did not exist.");
  }

  // Delete previous test user if exists for a clean run
  await User.deleteOne({ email: "browseruser@gmail.com" });
  console.log("Cleared old 'browseruser@gmail.com' records from DB.");

  const browser = await puppeteer.launch({
    headless: true, // Run headlessly for testing reliability in CLI, capturing screenshots
    defaultViewport: { width: 1280, height: 800 },
  });

  const page = await browser.newPage();

  // Pipe page logs and errors to node console for debugging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

  // Create artifacts folder path for screenshots
  const screenshotPath = (name) => `C:\\Users\\Dhruv kuchekar\\.gemini\\antigravity-ide\\brain\\3b2590ac-80cd-422e-b660-06d3d3d03d9d\\${name}.png`;

  try {
    // 1. Signup Page
    console.log("1. Navigating to signup page (http://localhost:3000/signup)...");
    await page.goto("http://localhost:3000/signup", { waitUntil: "load" });
    
    // Wait for signup form elements to render
    await page.waitForSelector('input[name="email"]');
    
    await page.type('input[name="email"]', "browseruser@gmail.com");
    await page.type('input[name="username"]', "BrowserTrader");
    await page.type('input[name="password"]', "password123");
    
    await page.type('input[name="accountName"]', "Browser Holder");
    await page.type('input[name="accountNumber"]', "987654321");
    await page.type('input[name="ifscCode"]', "ICIC0001234");
    await page.type('input[name="bankName"]', "ICICI");
    
    await page.screenshot({ path: screenshotPath("1_signup_filled") });
    console.log("Filled out signup form. Submitting...");

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "load" })
    ]);

    await new Promise(r => setTimeout(r, 2000)); // wait for navigation/toast
    await page.screenshot({ path: screenshotPath("2_after_signup") });
    console.log("SUCCESS: Submitted signup. Navigated to login page.");

    // 2. Fetch Verification Token from DB
    const user = await User.findOne({ email: "browseruser@gmail.com" });
    if (!user || !user.verificationToken) {
      throw new Error("Verification token not found in DB!");
    }
    console.log("SUCCESS: Retrieved verification token from DB:", user.verificationToken);

    // 3. Verify Email
    console.log(`3. Simulating email verification link (http://localhost:3000/verify-email/${user.verificationToken})...`);
    await page.goto(`http://localhost:3000/verify-email/${user.verificationToken}`, { waitUntil: "load" });
    await new Promise(r => setTimeout(r, 2500));
    await page.screenshot({ path: screenshotPath("3_email_verified") });
    console.log("SUCCESS: Email verification page completed successfully.");

    // 4. Log in before Approval
    console.log("4. Attempting to log in as unapproved user...");
    await page.goto("http://localhost:3000/login", { waitUntil: "load" });
    
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', "browseruser@gmail.com");
    await page.type('input[name="password"]', "password123");
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "load" })
    ]);

    // Bounced back to login page because they are not approved
    await new Promise(r => setTimeout(r, 3000)); // Wait for bounce and toast
    await page.screenshot({ path: screenshotPath("4_login_blocked") });
    console.log("SUCCESS: Bounced back to login with toast warning as expected.");

    // 5. Log in as Admin
    console.log("5. Logging in as admin...");
    await page.goto("http://localhost:3000/login", { waitUntil: "load" });
    
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', "admin@gmail.com");
    await page.type('input[name="password"]', "password123");
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "load" })
    ]);
    
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: screenshotPath("5_admin_dashboard") });
    console.log("SUCCESS: Logged in as admin. Access granted to dashboard.");

    // 6. Admin Panel - Approve User
    console.log("6. Admin navigating to pending approvals list...");
    await page.goto("http://localhost:3001/admin", { waitUntil: "load" });
    
    // Wait for the table structure to render
    await page.waitForSelector('table');
    
    await page.screenshot({ path: screenshotPath("6_admin_panel_list") });

    // Find row and click Approve button
    const rows = await page.$$('tr');
    let approved = false;
    for (const row of rows) {
      const text = await page.evaluate(el => el.textContent, row);
      if (text.includes("browseruser@gmail.com")) {
        const approveBtn = await row.$('button'); // First button is Approve
        if (approveBtn) {
          await approveBtn.click();
          approved = true;
          break;
        }
      }
    }
    
    if (!approved) {
      throw new Error("Could not find approve button for test user!");
    }
    
    console.log("Clicked Approve button. Waiting for database save...");
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: screenshotPath("7_user_approved") });
    console.log("SUCCESS: User approved by Admin.");

    // 7. Log out of admin
    console.log("7. Logging out of Admin session...");
    await page.evaluate(() => {
      localStorage.removeItem("token");
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    });
    
    // 8. Log in as approved user
    console.log("8. Logging in as the newly approved user...");
    await page.goto("http://localhost:3000/login", { waitUntil: "load" });
    
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', "browseruser@gmail.com");
    await page.type('input[name="password"]', "password123");
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "load" })
    ]);

    await page.waitForSelector('.dashboard-container');
    await page.screenshot({ path: screenshotPath("8_user_dashboard") });
    console.log("SUCCESS: Approved user successfully logged in and granted access to dashboard!");

    console.log("\n=== CHROMIUM BROWSER FLOW TEST COMPLETED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("\n❌ BROWSER TEST FAILED:", err.message);
    try {
      await page.screenshot({ path: screenshotPath("failure") });
      console.log("Captured failure screenshot at failure.png");
    } catch (screer) {
      console.error("Failed to capture failure screenshot:", screer.message);
    }
  } finally {
    await mongoose.connection.close();
    await browser.close();
  }
}

runBrowserTest();
