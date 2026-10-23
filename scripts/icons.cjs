const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
(async () => {
  for (const size of [16, 32, 48, 128]) {
    await sharp(path.join(root, 'assets/icon.svg')).resize(size, size).png()
      .toFile(path.join(root, `extension/icons/icon-${size}.png`));
  }
  console.log('Generated extension icons from assets/icon.svg');
})().catch(error => {console.error(error); process.exitCode = 1;});
