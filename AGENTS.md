# Project instructions

Use conventional commits with imperative subjects under 72 characters. Keep coherent changes and their tests together. Split unrelated changes into focused commits; preserve individual commits when pushing. Commit and push only when explicitly requested.

The extension must process data locally: do not add analytics, remote scripts, network calls, retained field contents, or real SSNs in tests. Use dummy `000-00-0000` only. Keep privacy disclosures consistent with implementation. Package only extension runtime files, never tests, docs, dependencies, or credentials. Run `npm run check`, `npm test`, `npm run test:browser`, `npm run test:extension`, and `npm run build` before release.
