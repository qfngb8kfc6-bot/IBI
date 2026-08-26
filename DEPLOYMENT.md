# Deployment and integration

## Build and update
Use Node 20+ and Python 3.11+. Change into the repository root (the directory
containing `package.json`) before running any npm command. Run
`npm run import:data -- ./data/IBI_Company_Finder_Database_v3.xlsx`, all checks,
then `npm run build`. Upload `dist/` under
`https://www.ibinews.com/company-finder/` and rewrite unknown routes under that
prefix to `/company-finder/index.html`.

Preferred hosting is the IBI site path. Alternatively, serve the same directory on an IBI-controlled subdomain and reverse-proxy the path. As fallback, embed that URL in a responsive iframe with a descriptive title and an agreed height/message-resize policy.

Serve hashed/immutable assets with long caching after adding a deployment hash; serve `index.html` with short caching. Enable Brotli/Gzip and HTTPS. A CSP can use `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors` with IBI's approved origins. No external runtime service is required.

IBI can wrap the app in its site chrome or replace the text masthead and CSS theme tokens. A future auth/paywall gate can protect the route or wrap the repository adapter. Approved analytics can implement search, filter, country-select, profile-view and compare-view events without changing UI flows.

IBI's technical team must confirm final route/base path, SPA rewrite syntax, frame ancestors, header/footer ownership, cache busting, paywall policy, approved analytics vendor/event schema, and supplied brand assets. No credentials are currently required.
