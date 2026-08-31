# Repository guidance

- Treat `IBI_Company_Finder_Database_v3.xlsx` as the authoritative source and preserve it.
- Keep `data/IBI_Company_Finder_Database_v3.xlsx` synchronized with the root workbook before importing.
- Do not manually edit `public/data/companies.json`; regenerate it with `npm run import:data -- ./data/IBI_Company_Finder_Database_v3.xlsx`.
- Do not infer or fabricate blank company data.
- Prefer browser-native HTML, CSS and JavaScript; avoid adding runtime services or paid APIs.
- Run import, test, lint, typecheck and build before committing data or application changes.

