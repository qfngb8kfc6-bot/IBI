import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { cardMarkup, detailMarkup, filterCompanies, normalize, sortCompanies, uniqueValues } from '../public/app.js';

const fixtures = [
  { id: '1', name: 'Ångström Marine', country: 'Sweden', primaryType: 'Boatbuilder', sectors: ['Boatbuilder'], products: [{ name: 'Wave 1', sector: 'Boatbuilder' }], quality: { completeness: 0.8 } },
  { id: '2', name: 'Beta Systems', country: 'France', primaryType: 'Equipment manufacturer', sectors: ['Electronics'], products: [], quality: { completeness: 1 } }
];

test('normalizes accents and case', () => assert.equal(normalize(' ÅNGSTRÖM '), 'angstrom'));
test('searches joined company fields', () => assert.deepEqual(filterCompanies(fixtures, { query: 'wave' }).map((item) => item.id), ['1']));
test('applies exact filters together', () => assert.equal(filterCompanies(fixtures, { country: 'France', sector: 'Electronics' }).length, 1));
test('sorts without mutating input', () => { const sorted = sortCompanies(fixtures, 'country'); assert.equal(sorted[0].country, 'France'); assert.equal(fixtures[0].country, 'Sweden'); });
test('returns sorted distinct facet values', () => assert.deepEqual(uniqueValues(fixtures, (item) => item.sectors), ['Boatbuilder', 'Electronics']));
test('escapes content in card and detail markup', () => { const company = { ...fixtures[0], name: '<script>', description: 'A & B' }; assert.match(cardMarkup(company), /&lt;script&gt;/); assert.doesNotMatch(detailMarkup(company), /<script>/); });
test('generated database is populated and internally valid', async () => {
  const payload = JSON.parse(await readFile(new URL('../public/data/companies.json', import.meta.url), 'utf8'));
  assert.equal(payload.meta.companyCount, payload.companies.length);
  assert.ok(payload.companies.length >= 500);
  assert.ok(payload.companies.every((company) => company.id && company.name));
  assert.equal(new Set(payload.companies.map((company) => company.id)).size, payload.companies.length);
  assert.ok(payload.companies.some((company) => company.products.length > 0));
});

