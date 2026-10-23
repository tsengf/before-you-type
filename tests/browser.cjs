/* Real-browser behavior tests. Chrome API stub; does not test extension loading. */
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const project = path.resolve(__dirname, '..');
const root = path.join(project, 'extension');
const core = fs.readFileSync(path.join(root, 'core.js'), 'utf8');
const content = fs.readFileSync(path.join(root, 'content.js'), 'utf8');
(async () => {
  const browser = await chromium.launch({headless: true, executablePath: process.env.CHROME_PATH || undefined});
  try {
    const context = await browser.newContext({viewport: {width: 1100, height: 900}});
    await context.addInitScript({content: `
      // Open roots permit test-only inspection of the otherwise closed warning.
      const nativeAttachShadow = Element.prototype.attachShadow;
      Element.prototype.attachShadow = function(options) { return nativeAttachShadow.call(this, {...options, mode:'open'}); };
      globalThis.chrome = {runtime:{onMessage:{addListener(){}}}};
      ${core}\n${content}
    `});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('file://' + path.join(project, 'demo/test-page.html'));
    const warning = page.getByRole('dialog');
    const cancel = page.getByRole('button', {name: 'Cancel entry'});
    const allow = page.getByRole('button', {name: 'Allow this field'});
    async function checkWarning() { await warning.waitFor({state:'visible'}); }
    async function cancelWarning() { await cancel.click(); await warning.waitFor({state:'detached'}); }

    await page.locator('#labelled').focus();
    await checkWarning();
    assert.equal(await page.locator('#labelled').inputValue(), '');
    await cancelWarning();
    await page.locator('#labelled').focus();
    await checkWarning();
    await page.waitForTimeout(1250);
    await allow.click();
    await page.locator('#labelled').pressSequentially('000-00-0000');
    assert.equal(await page.locator('#labelled').inputValue(), '000-00-0000');
    console.log('PASS: labeled-field focus, cancellation, repeat warning and explicit override');

    await page.locator('#ordinary').pressSequentially('000000000');
    await checkWarning();
    assert.equal(await page.locator('#ordinary').inputValue(), '00000000');
    if (process.env.SCREENSHOT_PATH) await page.screenshot({path:process.env.SCREENSHOT_PATH});
    await page.keyboard.press('Escape');
    await warning.waitFor({state:'detached'});
    await page.locator('#ordinary').fill('');
    await page.locator('#ordinary').pressSequentially('000-00-');
    await checkWarning();
    assert.equal(await page.locator('#ordinary').inputValue(), '000-00');
    await cancelWarning();
    console.log('PASS: blocks ninth digit and formatted prefix; Escape cancels');

    await page.locator('#notes').focus();
    const paste = await page.locator('#notes').evaluate(node => {
      const transfer = new DataTransfer();
      transfer.setData('text/plain', 'Dummy: 000-00-0000');
      return node.dispatchEvent(new ClipboardEvent('paste', {bubbles:true, cancelable:true, clipboardData:transfer}));
    });
    assert.equal(paste, false);
    await checkWarning();
    assert.equal(await page.locator('#notes').inputValue(), '');
    await cancelWarning();
    console.log('PASS: complete SSN paste is canceled');

    await page.locator('#ordinary').fill('00000000');
    await page.locator('#ordinary').evaluate(node => node.setSelectionRange(4, 4));
    await page.keyboard.type('0');
    await checkWarning();
    assert.equal(await page.locator('#ordinary').inputValue(), '00000000');
    await cancelWarning();
    await page.locator('#ordinary').fill('00000000');
    await page.locator('#ordinary').selectText();
    await page.keyboard.type('42');
    assert.equal(await page.locator('#ordinary').inputValue(), '42');
    console.log('PASS: detects middle insertion and permits safe selection replacement');

    await page.locator('#editor').click();
    await page.keyboard.type('000000000');
    await checkWarning();
    assert.equal(await page.locator('#editor').textContent(), '00000000');
    await cancelWarning();
    console.log('PASS: contenteditable text is protected');

    for (const id of ['part1', 'part2', 'part3']) {
      await page.locator('#' + id).focus();
      await checkWarning();
      await cancelWarning();
    }
    console.log('PASS: labeled split fields warn separately');
    const frame = page.frameLocator('iframe');
    await frame.locator('#embedded').focus();
    await frame.getByRole('dialog').waitFor({state:'visible'});
    await frame.getByRole('button', {name:'Cancel entry'}).click();
    console.log('PASS: embedded-frame warning');

    await page.locator('#notes').evaluate(node => {
      node.value = '000-00-0000';
      node.dispatchEvent(new InputEvent('input', {bubbles:true, inputType:'insertReplacementText'}));
    });
    await checkWarning();
    assert.match(await warning.textContent(), /website may already have read it/);
    assert.equal(await page.locator('#notes').inputValue(), '000-00-0000');
    await cancelWarning();
    console.log('PASS: fallback warning acknowledges possible prior disclosure and preserves draft');
    await page.reload();
    await page.locator('#labelled').focus();
    await checkWarning();
    await cancelWarning();
    assert.deepEqual(errors, []);
    console.log('PASS: reload resets approvals; no browser JavaScript errors');
    await browser.close();
  } catch (error) {
    await browser.close();
    throw error;
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
