# Privacy practices: submission notes

Review these against the dashboard's current wording and the shipping code when submitting. Do not treat local processing as a reason to omit sensitive-data handling from the description.

## Single purpose

Help users pause before accidental disclosure of Social Security numbers in supported Chrome webpage fields through local field recognition and input-pattern warnings.

## Host access justification

The extension runs on supported HTTP/HTTPS webpages and matching embedded frames because users can encounter SSN requests on any website. It reads field metadata and editable input locally to warn before likely SSN entry where possible. The file match supports local forms only when the user explicitly enables file access. Broad website access is integral to this warning feature and is not used to record browsing activity or transmit page contents.

## Other permissions

None. The popup queries the active tab's ID and sends a status message using APIs that do not require an additional permission. The extension does not request storage, clipboardRead, debugger, tabs, activeTab or nativeMessaging.

## Remote code

No. All executable extension code is bundled in the submitted ZIP. Playwright and Sharp are developer tools and are excluded from the package.

## Data handling

The extension locally processes possible personal identifiers (including SSNs), editable website contents, field metadata, frame hostnames and input interactions solely for its warning feature. It does not retain inspected information, collect it off-device, transmit it, sell it, or use it for advertising or credit decisions. It has no telemetry or analytics. Paste text is inspected only on paste, with no ongoing clipboard monitoring. Temporary approvals retain field references without their values and reset on reload.

Use this description when reviewing applicable dashboard categories such as personally identifiable information, website content and user activity. Match the dashboard's definitions accurately rather than making a blanket claim that the extension never accesses sensitive information. Any certification must match both the policy and implementation.

Privacy policy: https://github.com/tsengf/before-you-type/blob/main/docs/PRIVACY.md

Official guidance: [Privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy), [User data policy](https://developer.chrome.com/docs/webstore/program-policies/user-data).
