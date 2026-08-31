import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const input = resolve(process.cwd(), process.argv[2] || 'data/IBI_Company_Finder_Database_v3.xlsx');
const output = resolve(root, 'public/data/companies.json');
mkdirSync(dirname(output), { recursive: true });
const result = spawnSync('python3', [resolve(root, 'scripts/xlsx_importer.py'), input, output], {
  stdio: 'inherit'
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;

