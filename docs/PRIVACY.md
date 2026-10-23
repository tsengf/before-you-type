# BeforeYouType privacy policy

Effective October 23, 2026. Applies to BeforeYouType version 0.1.0.

BeforeYouType helps users pause before sharing a Social Security number. Its checks run on the user's computer. There are no extension accounts, servers, telemetry, advertising, analytics or remotely executed scripts.

## What is processed

To provide warnings, the extension inspects field labels and metadata, text in editable webpage fields, and text involved in typing, pasting and dropping. This can include personal identifiers such as an SSN and other sensitive text, including text in editable password fields. It also reads the current frame's hostname to display where the field is located. It handles input events to detect possible sensitive entry.

Clipboard text is read only as part of a user-initiated paste event, not through continuous clipboard monitoring. Checks run in memory; matching text, typed keys, clipboard contents, visited URLs and field contents are not logged, retained in extension storage, or transmitted by the extension. Temporary input candidates are discarded after checking. The extension keeps only references to user-approved fields in memory until page reload or removal; it does not save their contents or a persistent site allowlist.

## Sharing and purposes

No inspected data is sold, shared with third parties, sent to the developer, or used for advertising, credit decisions or any purpose unrelated to the visible warning feature. BeforeYouType's use of information received from Google APIs adheres to the Chrome Web Store User Data Policy, including its Limited Use requirements.

## Website access and user control

Chrome grants matching website access so the extension can inspect and interrupt entry on supported webpages, including matching embedded frames. There are no additional API permissions. Users can restrict site access, disable or remove the extension, or allow an individual field until page reload. Restricting access also reduces protection. Incognito and file access are optional Chrome settings.

## Limits and outside services

Websites can independently read information entered on their pages, including digits entered before a warning. BeforeYouType cannot retract information already read or sent. Chrome updates, the Web Store, GitHub support pages and websites visited by the user operate under their own policies. Opening an external link intentionally contacts that external service.

## Contact and changes

Contact the maintainer through the [project's issue tracker](https://github.com/tsengf/before-you-type/issues) or [GitHub profile](https://github.com/tsengf). Do not submit real SSNs or sensitive form contents. Changes to data practices will be reflected in this policy and, where applicable, the extension and store disclosures before they take effect.
