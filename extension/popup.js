(async () => {
  const status = document.getElementById('status');
  try {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const result = await chrome.tabs.sendMessage(tab.id, {type: 'BEFORE_YOU_TYPE_STATUS'}, {frameId: 0});
    status.textContent = result?.active ? 'Guard loaded on this page.' : 'Guard unavailable on this page.';
  } catch {
    status.textContent = 'Guard unavailable. Reload this page and check extension site access. Chrome internal pages and the Web Store are unsupported.';
  }
})();
