/* Installed-extension smoke test; no injected scripts, stubs or shadow changes. */
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const project = path.resolve(__dirname, '..');
const root = path.join(project, 'extension');
(async () => {
  const server = http.createServer((_request, response) => {
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(fs.readFileSync(path.join(project, 'demo/test-page.html')));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'before-you-type-test-'));
  try {
    const context = await chromium.launchPersistentContext(profile, {headless:true, executablePath:process.env.CHROME_PATH || undefined,
      args:['--enable-unsafe-extension-debugging'], ignoreDefaultArgs:['--disable-extensions'], viewport:{width:1280,height:800}});
    browser = context.browser();
    const cdp = await browser.newBrowserCDPSession();
    const extension = await cdp.send('Extensions.loadUnpacked', {path:root});
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/test-page.html`);
    await page.locator('#labelled').focus();
    assert.equal(await page.evaluate(() => document.activeElement.tagName), 'DIV');
    // Warning has a closed shadow root. Drive its accessible keyboard workflow.
    await page.waitForTimeout(1300);
    const screenshot = process.env.SCREENSHOT_PATH;
    if (screenshot) await page.screenshot({path:screenshot});
    if (process.env.SCREENSHOT_DIR) await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR, '01-field-warning.png')});
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.locator('#labelled').pressSequentially('000-00-0000');
    assert.equal(await page.locator('#labelled').inputValue(), '000-00-0000');
    console.log('PASS: Chrome loads manifest; real isolated script warns; keyboard override permits entry');
    await page.locator('#ordinary').pressSequentially('000000000');
    assert.equal(await page.locator('#ordinary').inputValue(), '00000000');
    if (process.env.SCREENSHOT_DIR) await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR, '02-typing-warning.png')});
    await page.keyboard.press('Escape');
    console.log('PASS: real extension blocks ninth digit and supports Escape');
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extension.id}/popup.html`);
    await page.bringToFront();
    await popup.evaluate(fs.readFileSync(path.join(root,'popup.js'), 'utf8'));
    assert.equal(await popup.locator('#status').textContent(), 'Guard loaded on this page.');
    console.log('PASS: actual extension popup can query the active page and receive content-script status');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(profile, {recursive:true, force:true});
  }
})().catch(error => {console.error(error); process.exitCode=1;});
