import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const data = resolve(root, 'public/data/companies.json');
if (!existsSync(data)) {
  const imported = spawnSync(process.execPath, [resolve(root, 'scripts/import-data.mjs'), resolve(root, 'data/IBI_Company_Finder_Database_v3.xlsx')], { stdio: 'inherit' });
  if (imported.status) process.exit(imported.status);
}
const payload = JSON.parse(readFileSync(data, 'utf8'));
if (!Array.isArray(payload.companies) || payload.companies.length === 0) throw new Error('Company data is empty; build stopped.');
const output = resolve(root, 'dist');
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(resolve(root, 'public'), output, { recursive: true });
console.log(`Built ${payload.companies.length} companies to ${output}`);

