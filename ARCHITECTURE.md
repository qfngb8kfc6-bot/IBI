# Architecture

The system has two deliberately separate layers:

1. `scripts/xlsx_importer.py` reads Office Open XML using only Python's standard library. It validates required sheets, joins normalized records by Company ID, converts Excel dates, preserves blanks, and writes stable ID-sorted JSON.
2. `public/` is a static, framework-free browser application. It fetches the generated JSON and performs search, faceting, sorting, pagination and detail rendering locally.

`scripts/import-data.mjs` provides the npm interface. `scripts/build.mjs` validates that data is populated and copies the deployable files into `dist/`. No database server, geocoder, analytics SDK or paid third-party API is required.

Broad location fields and workbook-provided country centroids are retained; exact street addresses are intentionally not exposed in application data.

