import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const files = ['public/app.js', 'scripts/import-data.mjs', 'scripts/build.mjs', 'scripts/server.mjs', 'scripts/lint.mjs', 'tests/core.test.mjs', 'e2e/finder.spec.mjs', 'playwright.config.mjs'];
for (const file of files) {
  const source = readFileSync(resolve(root, file), 'utf8');
  if (/\t/.test(source)) throw new Error(`${file}: tabs are not allowed`);
  if (/ +$/m.test(source)) throw new Error(`${file}: trailing whitespace found`);
  const check = spawnSync(process.execPath, ['--check', resolve(root, file)], { encoding: 'utf8' });
  if (check.status) throw new Error(`${file}: ${check.stderr}`);
}
console.log(`Linted ${files.length} JavaScript files`);

