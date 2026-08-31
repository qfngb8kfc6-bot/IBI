# IBI Company Finder

A responsive, dependency-light directory for exploring IBI's researched marine-industry company database. The static application can run independently or be integrated as a page in an existing IBI website.

## Quick start

Requirements: Node.js 20+ and Python 3 (standard library only for imports).

```sh
npm run import:data -- ./data/IBI_Company_Finder_Database_v3.xlsx
npm run dev
```

Open <http://127.0.0.1:4173>. Search covers company identity, descriptions, sectors, products and markets. Filters cover company type, sector and country.

## Commands

- `npm run import:data -- PATH`: deterministically transform an XLSX workbook into `public/data/companies.json`.
- `npm test`: run unit and generated-data integrity tests.
- `npm run test:e2e`: run the optional Playwright browser test after `npm install`.
- `npm run lint`: check JavaScript syntax and repository style rules.
- `npm run typecheck`: syntax-check the untyped JavaScript entry points.
- `npm run build`: copy the deployable static application to `dist/`.
- `npm run dev`: serve `public/` locally (set `PORT` to override port 4173).

The root workbook is retained as the authoritative repository artifact. The copy under `data/` is the explicit importer input expected by the project workflow.

