const {test} = require('node:test');
const assert = require('node:assert/strict');
const rules = require('../extension/core.js');
test('recognizes formats, pasted sentences, unicode and invalid dummy SSNs', () => {
  for (const value of ['000000000', '000-00-0000', '000 00 0000', 'value: 000-00-0000.', '０００００００００', '000–00–0000', '000-00-', '000 00 ']) {
    assert.equal(rules.looksSensitive(value), true, value);
  }
});
test('ordinary prose, dates, short numbers and unrelated labels remain usable', () => {
  for (const value of ['Hello family', '2026-10-23', '00000000', '000-00', '42']) assert.equal(rules.looksSensitive(value), false, value);
  for (const label of ['Name', 'Message', 'session', 'Password', 'Reference number']) assert.equal(rules.sensitiveHint(label), false, label);
});
test('recognizes labels and common machine-readable SSN names', () => {
  for (const value of ['Social Security number', 'social_security_number', 'ssn', 'person_ssn_last4', 'ssnInput', 'txtSSN', 'SSNLastFour', 'ssn1']) {
    assert.equal(rules.sensitiveHint(value), true, value);
  }
});
test('insertion and selection replacement catch edits in the middle', () => {
  assert.equal(rules.replaceSelection('00000000', 4, 4, '0'), '000000000');
  assert.equal(rules.looksSensitive(rules.replaceSelection('hello VALUE world', 6, 11, '000-00-0000')), true);
  assert.equal(rules.replaceSelection('000000000', 0, 9, 'hello'), 'hello');
});
