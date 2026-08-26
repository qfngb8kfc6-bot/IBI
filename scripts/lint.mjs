import {readFileSync} from 'node:fs';
for(const f of ['public/app.js','scripts/import-data.mjs']) { const s=readFileSync(f,'utf8'); if(/eval\s*\(|document\.write\s*\(/.test(s)) throw new Error(`${f}: unsafe construct`); }
console.log('Source safety lint passed');
