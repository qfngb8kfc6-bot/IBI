import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const workbook = resolve(process.argv[2] || 'data/IBI_Company_Finder_Database_v3.xlsx');
const result = spawnSync('python', ['scripts/xlsx_importer.py', workbook], { stdio: 'inherit' });
process.exit(result.status ?? 1);
