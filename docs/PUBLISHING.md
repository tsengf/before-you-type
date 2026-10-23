# Publish BeforeYouType

## Prepare a release

1. Update versions in both `package.json` and `extension/manifest.json`, update the policy date/version if relevant, then run `npm install --package-lock-only`.
2. Run `npm ci`, `npm run check`, `npm test`, `npm run test:browser` and `npm run test:extension`. Run manual dummy-data checks on sites/editors representative of your users, including paste, autofill and split fields. Automated checks cover only the included cases.
3. Run `npm run build`. The Web Store ZIP is `dist/before-you-type-VERSION.zip`. Its manifest is at the ZIP root. Do not upload the repository/source ZIP or the earlier SSN Guard prototype archive.
4. If UI changes, regenerate actual screenshots with `SCREENSHOT_DIR=docs/store npm run test:extension`. Use the provided 1280 × 800 PNG files and `extension/icons/icon-128.png` for the listing.
5. Review [privacy disclosures](store/PRIVACY-DISCLOSURES.md), [listing copy](store/LISTING.md), the [privacy policy](PRIVACY.md) and [limitations](LIMITATIONS.md) against the release.

## Submit through your publisher account

1. Register/sign in at the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole). Complete Google's current developer-account setup and any required registration, verification or account security steps. Those account actions are not performed by this repository.
2. Add a new item and upload the generated runtime ZIP.
3. Enter the listing copy, icon and screenshots. Select the category that best matches the warning feature.
4. Enter the single purpose, justify website access, declare no remote code and accurately describe local handling of sensitive field data using the included disclosure notes.
5. Supply a publicly accessible privacy-policy URL and support link. The GitHub policy URL works only if the repository is public. Test the links while signed out; if private, publish the policy on a separate public website before submission.
6. Choose distribution and visibility, verify the displayed listing and submit for Google's review. Approval is Google's decision; the files in this repository are not proof of acceptance. Consider an unlisted initial release for family testing.

The repository's CI builds a downloadable ZIP artifact after checks pass. It does not automatically submit to the Web Store, publish a GitHub release or use publisher credentials. GitHub Actions runs are visible in the repository's Actions tab when enabled.

Official references: [Publishing](https://developer.chrome.com/docs/webstore/publish), [Image requirements](https://developer.chrome.com/docs/webstore/images), [Privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy).
