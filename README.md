# BeforeYouType

**Pause before sharing your Social Security number.**

BeforeYouType is a local-only Chrome extension that warns when someone focuses a recognizable SSN field or types/pastes an SSN-like number into an ordinary field. It gives the user a clear Cancel or Allow choice. It does not require enrolling a real SSN, record typing history, or send field contents to a server.

This is an early release and an accidental-disclosure aid. A website may read digits before detection. Some autofill, input methods, custom editors and hostile page behavior can bypass interception. Read the [protection limits](docs/LIMITATIONS.md).

## Install locally

1. Clone this repository or download and extract its source.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the **extension/** directory, which contains `manifest.json`.
4. In Details, allow access on all sites and pin BeforeYouType to the toolbar.
5. Reload open webpages. Repeat for each Chrome profile that needs protection.

Install with the computer user's knowledge. The popup reports whether the guard is loaded on the current top-level page; it is not a security audit of every embedded form. Chrome internal pages and the Web Store are unsupported. Incognito and local files require their respective opt-ins in extension Details.

## Test safely

Use only the deliberately invalid `000-00-0000` or `000000000`.

Run `python3 -m http.server 8765 --bind 127.0.0.1` from this repository and open `http://127.0.0.1:8765/demo/test-page.html`. Stop the server with Ctrl+C when done.

- Focusing a labeled SSN field should show a warning before entry.
- In an ordinary field, typing nine digits should stop at the ninth digit; the first eight are already in the webpage. The formatted prefix `000-00-` warns at the second separator.
- Pasting the dummy number or a sentence containing it should be interrupted.
- Cancel keeps the field protected. Allow becomes available after a short pause and permits only that field until reload. Re-enter the blocked text yourself; the extension does not replay it.
- A fallback warning explicitly says when input may already have been disclosed and leaves the draft intact.

## Development

Requirements: Node.js 22 or newer (24 recommended) and Python 3 for packaging. Runtime extension code has no dependencies. Playwright and Sharp are development-only dependencies pinned in the lockfile.

```sh
npm ci
npx playwright install chromium
npm run check
npm test
npm run test:browser
npm run test:extension
npm run build
```

On Linux, use `npx playwright install --with-deps chromium`. To test against installed Chrome, set `CHROME_PATH` to its executable. The installed-extension smoke test uses a disposable profile and Chrome's `Extensions.loadUnpacked` debugging command; it never modifies your everyday browser profile. The behavior suite uses a Chrome API stub and opens shadow roots for test inspection. The installed-extension suite has no such stubs.

`npm run build` creates **dist/before-you-type-0.1.0.zip**, with the manifest at the archive root, and a SHA-256 checksum. The deterministic allowlist includes only runtime files and icons. Tests verify both the package contents and reproducibility.

To regenerate icons after changing `assets/icon.svg`, run `npm run icons`. To regenerate actual store screenshots, create `docs/store/` if needed and run `SCREENSHOT_DIR=docs/store npm run test:extension`.

## Project layout

| Directory | Purpose |
| --- | --- |
| `extension/` | Installable Manifest V3 extension and PNG icons |
| `demo/` | Manual testing page with dummy data |
| `tests/` | Detection, release-package and browser tests |
| `scripts/` | Validation, packaging and icon generation |
| `docs/` | Privacy policy, limitations and store submission guide |
| `.github/workflows/` | CI checks and downloadable release-package artifact |

## Publishing and support

See the [Chrome Web Store submission guide](docs/PUBLISHING.md), [listing copy](docs/store/LISTING.md), [privacy disclosures](docs/store/PRIVACY-DISCLOSURES.md) and [privacy policy](docs/PRIVACY.md). Store submission requires your publisher account and Google's review; preparing this repository does not publish the extension.

Report non-sensitive bugs in [GitHub Issues](https://github.com/tsengf/before-you-type/issues). Never include real SSNs, passwords or personal form contents. See [SECURITY.md](SECURITY.md) for vulnerability reporting.

No open-source license has been selected. Public repository visibility, if enabled, does not grant a reuse license. The development package is marked `UNLICENSED` until the owner chooses one.
