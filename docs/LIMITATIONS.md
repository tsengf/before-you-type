# Protection limits


- Websites can read every keystroke and existing field value. Stopping the ninth digit cannot recover the first eight. Early focus warnings depend on recognizable labels or field metadata. A site listening to earlier or different events may still observe blocked input.
- Autofill, dictation, input methods, browser suggestions, and scripts may bypass cancelable input events. A fallback warning can appear after insertion; it does not claim to undo disclosure and leaves the draft intact.
- Generic detection intentionally flags nine-digit identifiers, some phone numbers and some numeric passwords. It also recognizes invalid SSNs so test data and malformed entries are covered. It does not identify your particular SSN or validate that a number was issued.
- Unknown split fields, custom editors, closed shadow roots, canvas inputs, some drag/drop positions, silent programmatic changes, browser address bars, PDF viewers, Chrome internal pages, the Chrome Web Store and other applications are not reliably covered.
- The content script is isolated, but its warning is displayed in the webpage. A hostile page can interfere with or imitate page UI. Verify the address bar and toolbar; this prototype is an accidental-disclosure aid, not a security boundary against a determined malicious page.
- Embedded frames require matching site access. Sandboxed/opaque-origin frames may be unsupported. The warning displays the frame hostname, which can differ from the top-level site.
- Incognito is unprotected unless explicitly enabled in extension Details. File pages require file access. Other Chrome profiles, browsers, phones, and desktop applications need their own protection.
- Removing/disabling the extension or restricting site access disables its protection. Reload webpages after installation, updates or re-enabling.
