/* Shared pure detection rules. No SSNs, keystrokes, or matches are saved. */
(function (root) {
  'use strict';
  function normalize(text) {
    return String(text).normalize('NFKC').replace(/[\u2010-\u2015\u2212]/g, '-');
  }
  function sensitiveHint(text) {
    const words = String(text).replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ');
    return /social\s*security|\bssn\b|socialsecuritynumber|\bssn(?:number|last|first|part|[0-9])/i.test(words);
  }
  function looksSensitive(text) {
    // Deliberately includes invalid SSNs: this is a guard, not an SSN validator.
    // Nine-digit identifiers and phone numbers can also trigger this rule.
    const value = normalize(text);
    return /\d{3}[ -]?\d{2}[ -]?\d{4}/.test(value) || /\d{3}[ -]\d{2}[ -]$/.test(value);
  }
  function replaceSelection(value, start, end, inserted) {
    return value.slice(0, start) + inserted + value.slice(end);
  }
  const api = Object.freeze({normalize, sensitiveHint, looksSensitive, replaceSelection});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.defineProperty(root, 'BeforeYouTypeCore', {value: api});
})(globalThis);
