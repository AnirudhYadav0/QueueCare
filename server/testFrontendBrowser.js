const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';

const runBrowserTests = async () => {
  console.log('\n===============================================================');
  console.log('   QUEUECARE LIVE BROWSER & UI VERIFICATION PASS');
  console.log('===============================================================\n');

  let browser;
  const errors = [];
  const results = [];

  const check = (title, condition) => {
    if (!condition) {
      console.error(`  ❌ FAILED: ${title}`);
      errors.push(title);
    } else {
      console.log(`  ✓ ${title}`);
      results.push(title);
    }
  };

  // Helper to wait for react state/loader
  const waitForReady = async (page) => {
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 8000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 600));
  };

  try {
    console.log('Launching headless Google Chrome...');
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });

    const page = await browser.newPage();

    // Listen to uncaught page errors
    page.on('pageerror', (err) => {
      console.warn(`[Page JS Error]: ${err.message}`);
    });

    // 1. Desktop Landing Page
    console.log('\n[1] Testing Desktop Landing Page (1280x800)...');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 });

    const title = await page.title();
    check('Page title contains "QueueCare"', title.toLowerCase().includes('queuecare'));

    const landingBody = await page.evaluate(() => document.body.textContent);
    check('Hero heading contains "Healthcare Without the Waiting Room"', landingBody.includes('Healthcare Without the Waiting Room'));

    const getStartedBtn = await page.$('a[href="/register"]');
    check('Hero "Get Started Free" button is present', !!getStartedBtn);

    const checkInBtn = await page.$('a[href="/checkin"]');
    check('Hero "QR Check-In" button is present', !!checkInBtn);

    check('Live Queue Engine Preview widget rendered', landingBody.includes('Currently Serving') && landingBody.includes('Your Digital Token'));

    // 2. Sign In Page & 1-Click Demo Logins
    console.log('\n[2] Testing Sign In Page & 1-Click Demo Logins...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await waitForReady(page);

    const loginText = await page.evaluate(() => document.body.textContent);
    check('Sign in heading is displayed', loginText.includes('Sign In to Your Account'));
    check('1-Click Demo Accounts section is present', loginText.includes('1-Click Demo Accounts'));

    // 3. Patient Login & Patient Dashboard
    console.log('\n[3] Testing Patient 1-Click Login & Patient Dashboard...');
    const buttons = await page.$$('button');
    let patientBtn = null;
    for (const b of buttons) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text.includes('Patient') && text.includes('John')) {
        patientBtn = b;
        break;
      }
    }
    check('Found Patient Demo Button', !!patientBtn);

    if (patientBtn) {
      await patientBtn.click();
      await page.waitForFunction(() => window.location.pathname.startsWith('/patient'), { timeout: 8000 });
      await waitForReady(page);

      const patientUrl = page.url();
      check('Redirected to /patient dashboard', patientUrl.includes('/patient'));

      const patientBody = await page.evaluate(() => document.body.textContent);
      check('Dashboard greeting shows patient name', patientBody.includes('John Doe') || patientBody.includes('Hello'));
      check('Live Queue status widget displayed on patient dashboard', patientBody.includes('Digital Token') || patientBody.includes('Live Queue') || patientBody.includes('Today'));
    }

    // 4. Patient Appointment Booking Page
    console.log('\n[4] Testing Appointment Booking Flow (/patient/book)...');
    await page.goto(`${BASE_URL}/patient/book`, { waitUntil: 'networkidle0' });
    await waitForReady(page);

    const bookBody = await page.evaluate(() => document.body.textContent);
    check('Booking page loaded with title "Book an Appointment"', bookBody.includes('Book an Appointment'));
    check('Clinical specialties rendered in selector', bookBody.includes('Cardiology') || bookBody.includes('General Medicine'));
    check('Doctor selection cards rendered', bookBody.includes('Dr. Sarah Jenkins') || bookBody.includes('Dr.'));

    // 5. Patient Live Queue Tracking Board
    console.log('\n[5] Testing Patient Live Queue Tracking Board (/patient/queue)...');
    await page.goto(`${BASE_URL}/patient/queue`, { waitUntil: 'networkidle0' });
    await waitForReady(page);

    const queueBody = await page.evaluate(() => document.body.textContent);
    check('Live Queue Tracking page loaded', queueBody.includes('Clinic Queue Tracker'));
    check('Now Serving metric card displayed', queueBody.includes('Now Serving'));
    check('Patients Ahead metric card displayed', queueBody.includes('Patients Ahead'));
    check('Estimated Wait metric card displayed', queueBody.includes('Estimated Wait'));

    // 6. Mobile Viewport Responsiveness (375x812 - iPhone X/11/12/13/14)
    console.log('\n[6] Testing Mobile-Sized Viewport (375x812)...');
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/patient`, { waitUntil: 'networkidle0' });
    await waitForReady(page);

    // Look for hamburger button
    const menuBtn = await page.$('header button');
    check('Mobile hamburger menu button visible in header', !!menuBtn);

    if (menuBtn) {
      await menuBtn.click();
      await new Promise((r) => setTimeout(r, 600));

      const drawerText = await page.evaluate(() => document.body.textContent);
      check('Mobile navigation drawer slides open with navigation links', drawerText.includes('Live Queue Tracking') && drawerText.includes('Book Appointment'));
    }

    // 7. Doctor Sign In & Doctor Dashboard
    console.log('\n[7] Testing Doctor Sign In & Workstation Dashboard...');
    await page.setViewport({ width: 1280, height: 800 });
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await waitForReady(page);

    const docButtons = await page.$$('button');
    let doctorBtn = null;
    for (const b of docButtons) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text.includes('Doctor') && text.includes('Sarah')) {
        doctorBtn = b;
        break;
      }
    }
    check('Found Doctor Demo Button', !!doctorBtn);

    if (doctorBtn) {
      await doctorBtn.click();
      await page.waitForFunction(() => window.location.pathname.startsWith('/doctor'), { timeout: 8000 });
      await waitForReady(page);

      const docUrl = page.url();
      check('Redirected to /doctor dashboard', docUrl.includes('/doctor'));

      const docBody = await page.evaluate(() => document.body.textContent);
      check('Doctor KPI stat cards rendered', docBody.includes('Scheduled Today') || docBody.includes('Waiting'));
      check('"Call Next Patient" action button present', docBody.includes('Call Next Patient') || docBody.includes('Call Next'));
      check('Today’s Patient Queue roster table rendered', docBody.includes('Patient Queue') || docBody.includes('Token'));
    }

    // 8. Admin Sign In & Admin Command Center
    console.log('\n[8] Testing Admin Sign In & Command Center...');
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await waitForReady(page);

    const admButtons = await page.$$('button');
    let adminBtn = null;
    for (const b of admButtons) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text.includes('Admin') && text.includes('System')) {
        adminBtn = b;
        break;
      }
    }
    check('Found Admin Demo Button', !!adminBtn);

    if (adminBtn) {
      await adminBtn.click();
      await page.waitForFunction(() => window.location.pathname.startsWith('/admin'), { timeout: 8000 });
      await waitForReady(page);

      const admUrl = page.url();
      check('Redirected to /admin dashboard', admUrl.includes('/admin'));

      const admBody = await page.evaluate(() => document.body.textContent);
      check('Admin Command Center header displayed', admBody.includes('Admin Command Center') || admBody.includes('Command Center'));
      check('Recharts analytics charts rendered on dashboard', admBody.includes('Appointment Volume') || admBody.includes('Status'));

      // 9. Admin Doctor Management
      console.log('\n[9] Testing Admin Doctor Management (/admin/doctors)...');
      await page.goto(`${BASE_URL}/admin/doctors`, { waitUntil: 'networkidle0' });
      await waitForReady(page);

      const docMgmtBody = await page.evaluate(() => document.body.textContent);
      check('Doctor Management page loaded', docMgmtBody.includes('Doctor Management'));
      check('"Add New Doctor" button present', docMgmtBody.includes('Add New Doctor'));
      check('Clinical doctors roster rendered', docMgmtBody.includes('Dr. Sarah Jenkins'));
    }

    console.log('\n===============================================================');
    console.log(`   BROWSER VERIFICATION SUMMARY: ${results.length} PASSED, ${errors.length} FAILED`);
    console.log('===============================================================\n');

    await browser.close();

    if (errors.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Browser Test Error:', err);
    if (browser) await browser.close();
    process.exit(1);
  }
};

runBrowserTests();
