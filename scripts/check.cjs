const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const extension = path.join(root, 'extension');
const manifest = JSON.parse(fs.readFileSync(path.join(extension, 'manifest.json')));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
assert.equal(manifest.manifest_version, 3);
assert.equal(manifest.version, pkg.version, 'Package and manifest versions must match');
assert.ok(manifest.description.length <= 132);
assert.equal(manifest.permissions?.length || 0, 0, 'No extra API permissions are needed');
for (const group of manifest.content_scripts) {
  assert.equal(group.run_at, 'document_start');
  for (const file of group.js) {
    execFileSync(process.execPath, ['--check', path.join(extension, file)]);
  }
}
for (const file of ['core.js', 'content.js', 'popup.js', 'popup.html', 'popup.css',
  manifest.action.default_popup, ...Object.values(manifest.icons)]) {
  assert.ok(fs.statSync(path.join(extension, file)).isFile(), file);
}
for (const [size, file] of Object.entries(manifest.icons)) {
  const png = fs.readFileSync(path.join(extension, file));
  assert.equal(png.readUInt32BE(16), Number(size));
  assert.equal(png.readUInt32BE(20), Number(size));
}
execFileSync(process.execPath, ['--check', path.join(extension, 'popup.js')]);
console.log('Manifest, versions, JavaScript syntax and PNG icon dimensions verified');
