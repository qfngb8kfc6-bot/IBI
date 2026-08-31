# Deployment

Run the verified production pipeline:

```sh
npm run import:data -- ./data/IBI_Company_Finder_Database_v3.xlsx
npm test
npm run lint
npm run typecheck
npm run build
```

Deploy the contents of `dist/` to any static host or copy them beneath an existing website route. The server must serve `index.html`, `app.js`, `styles.css`, and `data/companies.json` at the same route level. No environment variables or backend are required. For a subdirectory integration, keep these files together so relative URLs continue to work.

