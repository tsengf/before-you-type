(() => {
  'use strict';
  const rules = globalThis.BeforeYouTypeCore;
  const approved = new WeakSet();
  let warning = null;
  let host = null;
  let clearTimer = null;

  function editable(event) {
    for (const node of event.composedPath()) {
      if (!(node instanceof HTMLElement)) continue;
      if (node instanceof HTMLInputElement) {
        if (!['button', 'submit', 'reset', 'checkbox', 'radio', 'range', 'color', 'file', 'hidden', 'image'].includes(node.type)) return node;
      }
      if (node instanceof HTMLTextAreaElement) return node;
      if (node.isContentEditable) return node.closest('[contenteditable]') || node;
    }
    return null;
  }
  function hint(node) {
    const parts = ['name', 'id', 'placeholder', 'aria-label', 'title'].map(key => node.getAttribute(key) || '');
    for (const label of node.labels || []) parts.push(label.textContent || '');
    for (const key of ['aria-labelledby', 'aria-describedby']) {
      for (const id of (node.getAttribute(key) || '').split(/\s+/)) {
        parts.push(node.getRootNode().getElementById?.(id)?.textContent || '');
      }
    }
    // Recognize split SSNs in explicitly labelled groups, without scanning a whole form.
    const group = node.closest('fieldset, [role="group"]');
    if (group) {
      parts.push(group.querySelector(':scope > legend')?.textContent || '', group.getAttribute('aria-label') || '');
      for (const id of (group.getAttribute('aria-labelledby') || '').split(/\s+/)) {
        parts.push(document.getElementById(id)?.textContent || '');
      }
    }
    return rules.sensitiveHint(parts.join(' '));
  }
  function valueOf(node) {
    return node.isContentEditable ? node.textContent || '' : node.value || '';
  }
  function candidate(node, inserted) {
    if (!node.isContentEditable && typeof node.selectionStart === 'number') {
      return rules.replaceSelection(valueOf(node), node.selectionStart, node.selectionEnd, inserted);
    }
    if (node.isContentEditable) {
      const selection = node.getRootNode().getSelection?.() || window.getSelection();
      if (selection?.rangeCount && node.contains(selection.anchorNode) && node.contains(selection.focusNode)) {
        const range = selection.getRangeAt(0);
        const before = range.cloneRange();
        before.selectNodeContents(node);
        before.setEnd(range.startContainer, range.startOffset);
        const after = range.cloneRange();
        after.selectNodeContents(node);
        after.setStart(range.endContainer, range.endOffset);
        return before.toString() + inserted + after.toString();
      }
    }
    return valueOf(node) + inserted;
  }
  function stop(event) {
    if (event.cancelable) event.preventDefault();
    event.stopImmediatePropagation();
  }
  function closeWarning(allow) {
    if (!warning) return;
    const target = warning.target;
    if (allow && target.isConnected) approved.add(target);
    clearTimeout(clearTimer);
    warning.dialog.close();
    host.remove();
    warning = null;
    host = null;
    // A dialog opened during focusin can leave Chrome's editing focus stale.
    // Explicitly leave the field before restoring it after permission.
    target.blur();
    if (allow && target.isConnected) target.focus();
  }
  function showWarning(target, late = false) {
    if (warning || !document.documentElement) return;
    host = document.createElement('div');
    const shadow = host.attachShadow({mode: 'closed'});
    const style = document.createElement('style');
    style.textContent = `
      :host { all: initial; }
      dialog { box-sizing:border-box; width:min(480px, calc(100vw - 32px)); max-height:90vh; overflow:auto;
        background:#fff; color:#182330; border:2px solid #a65a00; border-radius:16px;
        padding:28px; font:17px/1.5 system-ui,sans-serif; box-shadow:0 16px 64px #0005; }
      dialog::backdrop { background:#101d32b8; }
      h1 {font-size:25px; line-height:1.2; margin:0 0 16px; color:#713c00;}
      p {margin:12px 0;} .site {display:block; overflow-wrap:anywhere; font-weight:700;}
      .detail {font-size:14px; color:#475569;} .actions {display:flex; gap:12px; flex-wrap:wrap; margin-top:24px;}
      button {font:inherit; padding:12px 16px; border:2px solid #334155; border-radius:8px; cursor:pointer; background:white; color:#182330;}
      button.primary {background:#173b32; border-color:#173b32; color:white; font-weight:700;}
      button:focus-visible {outline:3px solid #2563eb; outline-offset:3px;} button:disabled {opacity:.45; cursor:wait;}
    `;
    const dialog = document.createElement('dialog');
    dialog.setAttribute('aria-labelledby', 'guard-title');
    dialog.setAttribute('aria-describedby', 'guard-description');
    const title = document.createElement('h1');
    title.id = 'guard-title';
    title.textContent = 'Pause before sharing your SSN';
    const description = document.createElement('p');
    description.id = 'guard-description';
    description.textContent = late ? 'BeforeYouType detected possible sensitive information after it entered this field. The website may already have read it.' : 'This field asks for a Social Security number, or your entry looks like one. Verify this website and why it needs the information.';
    const site = document.createElement('p');
    site.textContent = window === window.top ? 'Website:' : 'Embedded form website (may differ from the address bar):';
    const domain = document.createElement('strong');
    domain.className = 'site';
    domain.textContent = location.host || (location.protocol === 'file:' ? 'Local file' : 'Embedded page — check the address bar');
    site.append(domain);
    const detail = document.createElement('p');
    detail.className = 'detail';
    detail.textContent = 'When unsure, cancel and contact someone you trust. Other nine-digit numbers can trigger this warning. Allowing entry applies only to this field until the page reloads. Type or paste again after allowing.';
    const actions = document.createElement('div');
    actions.className = 'actions';
    const cancel = document.createElement('button');
    cancel.className = 'primary';
    cancel.textContent = 'Cancel entry';
    const allow = document.createElement('button');
    allow.textContent = 'Allow this field';
    allow.disabled = true;
    cancel.addEventListener('click', () => closeWarning(false));
    allow.addEventListener('click', event => { if (event.isTrusted) closeWarning(true); });
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeWarning(false); });
    actions.append(cancel, allow);
    dialog.append(title, description, site, detail, actions);
    shadow.append(style, dialog);
    document.documentElement.append(host);
    warning = {target, dialog};
    dialog.showModal();
    cancel.focus();
    clearTimer = setTimeout(() => { allow.disabled = false; }, 1200);
  }
  function insideWarning(event) {
    return host && event.composedPath().includes(host);
  }
  function protect(event) {
    if (insideWarning(event)) return;
    const node = editable(event);
    if (!node || approved.has(node) || node.readOnly || node.disabled) return;
    if (warning) { stop(event); return; }
    const labelled = hint(node);
    if (event.type === 'focusin') {
      if (labelled) showWarning(node);
      return;
    }
    if (event.type === 'input' || event.type === 'change') {
      if (valueOf(node) && (labelled || rules.looksSensitive(valueOf(node)))) {
        // A late warning cannot undo disclosure. Do not destroy the user's draft.
        event.stopImmediatePropagation();
        showWarning(node, true);
      }
      return;
    }
    let inserted = null;
    if (event.type === 'keydown') {
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) inserted = event.key;
      else return;
    } else if (event.type === 'beforeinput') {
      if (!event.inputType.startsWith('insert')) return;
      inserted = event.data ?? event.dataTransfer?.getData('text/plain') ?? null;
    } else if (event.type === 'paste' || event.type === 'drop') {
      inserted = (event.clipboardData || event.dataTransfer)?.getData('text/plain') ?? null;
    }
    // Drop insertion position is browser-dependent; test both payload and combined text.
    if (labelled || (inserted !== null && (rules.looksSensitive(inserted) || rules.looksSensitive(candidate(node, inserted))))) {
      stop(event);
      showWarning(node, !event.cancelable);
    }
  }
  for (const type of ['focusin', 'keydown', 'beforeinput', 'paste', 'drop', 'input', 'change']) {
    window.addEventListener(type, protect, true);
  }
  chrome.runtime.onMessage.addListener((message, _sender, respond) => {
    if (message?.type === 'BEFORE_YOU_TYPE_STATUS') respond({active: true});
  });
})();
