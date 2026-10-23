"""Create a deterministic, allowlisted Web Store ZIP with manifest at its root."""
from pathlib import Path
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
FILES = ['manifest.json', 'core.js', 'content.js', 'popup.js', 'popup.html', 'popup.css',
         'icons/icon-16.png', 'icons/icon-32.png', 'icons/icon-48.png', 'icons/icon-128.png']

def build(destination=None):
    version = json.loads((ROOT / 'extension/manifest.json').read_text())['version']
    target = Path(destination) if destination else ROOT / f'dist/before-you-type-{version}.zip'
    target.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for filename in sorted(FILES):
            info = zipfile.ZipInfo(filename, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            archive.writestr(info, (ROOT / 'extension' / filename).read_bytes())
    with zipfile.ZipFile(target) as archive:
        assert archive.testzip() is None
        assert 'manifest.json' in archive.namelist()
    return target

if __name__ == '__main__':
    result = build()
    digest = hashlib.sha256(result.read_bytes()).hexdigest()
    result.with_suffix('.zip.sha256').write_text(f'{digest}  {result.name}\n')
    print(f'Built {result.name} ({result.stat().st_size} bytes); SHA-256 {digest}')
