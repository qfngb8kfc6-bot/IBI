# QA report

The project validation commands are documented here so results can be reproduced from a clean checkout.

## Coverage

- Workbook import validates expected sheets and joins by stable company IDs.
- Data tests check count consistency, required identity fields, unique IDs and populated related records.
- Unit tests cover normalized search, combined filters, sorting, facets and HTML escaping.
- Playwright covers initial rendering, user search and the details dialog when its optional dependency/browser is installed.
- The build rejects missing or empty generated company data.
- The UI includes labels, live result counts, keyboard focus styles, native dialog behavior and responsive layouts.

## Known constraints

- Locations are broad locality/country labels and country centroids, not exact HQ pins.
- Source completeness varies by what each company publicly reports; blanks remain blank.
- Financial figures remain in their reported currencies and bases.

## Verification result

On 2026-08-31, the required import, 7 unit/data-integrity tests, lint, typecheck, production build, local HTTP response check, and Playwright Chromium end-to-end test all passed. The generated dataset contained 500 companies. Two consecutive imports produced the same SHA-256, and the root/data workbook copies were byte-identical.
