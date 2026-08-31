const PAGE_SIZE = 24;

export function normalize(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function searchableText(company) {
  return normalize([company.name, company.legalName, company.country, company.locality, company.primaryType, company.secondaryType, company.summary, company.description, ...(company.sectors || []), ...(company.markets || []), ...(company.products || []).flatMap((p) => [p.name, p.sector])].join(' '));
}

export function filterCompanies(companies, filters = {}) {
  const query = normalize(filters.query);
  return companies.filter((company) => {
    if (query && !searchableText(company).includes(query)) return false;
    if (filters.type && company.primaryType !== filters.type) return false;
    if (filters.country && company.country !== filters.country) return false;
    if (filters.sector && !(company.sectors || []).includes(filters.sector)) return false;
    return true;
  });
}

export function sortCompanies(companies, sort = 'name') {
  const result = [...companies];
  if (sort === 'country') return result.sort((a, b) => (a.country || '').localeCompare(b.country || '') || a.name.localeCompare(b.name));
  if (sort === 'completeness') return result.sort((a, b) => (b.quality?.completeness || 0) - (a.quality?.completeness || 0) || a.name.localeCompare(b.name));
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export function uniqueValues(companies, accessor) {
  return [...new Set(companies.flatMap(accessor).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]);
const safeUrl = (value) => { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
const formatMoney = (amount, currency) => amount == null ? null : new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency || 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(amount);
const locationLabel = (company) => [company.locality, company.country].filter(Boolean).join(', ') || 'Location not published';

function optionMarkup(values) { return values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join(''); }

export function cardMarkup(company) {
  const tags = (company.sectors || []).slice(0, 3).map((sector) => `<span class="tag">${escapeHtml(sector)}</span>`).join('');
  return `<article class="company-card"><div class="card-meta">${escapeHtml(company.primaryType || 'Marine company')}</div><h2>${escapeHtml(company.name)}</h2><div class="location">${escapeHtml(locationLabel(company))}</div><p class="card-summary">${escapeHtml(company.description || company.summary || 'No company description published.')}</p><div class="tags">${tags}</div><button class="view-button" data-company-id="${escapeHtml(company.id)}" type="button">View company →</button></article>`;
}

export function detailMarkup(company) {
  const website = safeUrl(company.website);
  const source = safeUrl(company.sourceUrl);
  const financial = formatMoney(company.financials?.revenue, company.financials?.currency);
  const products = (company.products || []).slice(0, 12).map((item) => item.name).join(', ');
  const people = (company.people || []).map((person) => `${person.name}${person.role ? ` — ${person.role}` : ''}`).join('; ');
  const blocks = [
    ['Sectors', (company.sectors || []).join(', ')], ['Products & brands', products], ['Markets served', (company.markets || []).join(', ')],
    ['Ownership', [company.ownership, company.parentGroup].filter(Boolean).join(' · ')], ['Latest published revenue', financial ? `${financial}${company.financials?.year ? ` (${company.financials.year})` : ''}` : null],
    ['Published scale', company.scale], ['Key people', people], ['Contact', [company.contact?.email, company.contact?.phone].filter(Boolean).join(' · ')], ['Last verified', company.lastVerified]
  ].filter(([, value]) => value);
  return `<p class="detail-eyebrow">${escapeHtml(company.primaryType || 'Marine company')}</p><h2 class="detail-title">${escapeHtml(company.name)}</h2><p class="detail-location">${escapeHtml(locationLabel(company))}</p><p class="detail-description">${escapeHtml(company.description || company.summary || '')}</p><div class="detail-grid">${blocks.map(([title, value]) => `<section class="detail-block"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(value)}</p></section>`).join('')}</div>${website ? `<a class="detail-link" href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer">Company website ↗</a>` : ''}${source && source !== website ? `<a class="detail-link" href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">Primary source ↗</a>` : ''}`;
}

async function init() {
  const results = document.querySelector('#results');
  try {
    const response = await fetch('data/companies.json');
    if (!response.ok) throw new Error(`Data request failed (${response.status})`);
    const payload = await response.json();
    const companies = payload.companies || [];
    const elements = Object.fromEntries(['search', 'type', 'sector', 'country', 'sort', 'result-count', 'company-count', 'active-filters', 'page-status', 'previous', 'next', 'company-dialog', 'dialog-content'].map((id) => [id, document.getElementById(id)]));
    elements.type.insertAdjacentHTML('beforeend', optionMarkup(uniqueValues(companies, (company) => [company.primaryType])));
    elements.sector.insertAdjacentHTML('beforeend', optionMarkup(uniqueValues(companies, (company) => company.sectors || [])));
    elements.country.insertAdjacentHTML('beforeend', optionMarkup(uniqueValues(companies, (company) => [company.country])));
    elements['company-count'].textContent = companies.length.toLocaleString('en-GB');
    let page = 1;
    const render = () => {
      const filters = { query: elements.search.value, type: elements.type.value, sector: elements.sector.value, country: elements.country.value };
      const filtered = sortCompanies(filterCompanies(companies, filters), elements.sort.value);
      const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)); page = Math.min(page, pages);
      const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
      results.innerHTML = visible.length ? visible.map(cardMarkup).join('') : '<div class="empty"><h2>No companies found</h2><p>Try broadening your search or clearing a filter.</p></div>';
      elements['result-count'].textContent = `${filtered.length.toLocaleString('en-GB')} ${filtered.length === 1 ? 'company' : 'companies'} found`;
      elements['page-status'].textContent = `Page ${page} of ${pages}`; elements.previous.disabled = page === 1; elements.next.disabled = page === pages;
      elements['active-filters'].innerHTML = Object.values(filters).filter(Boolean).map((value) => `<span class="chip">${escapeHtml(value)}</span>`).join('');
    };
    document.querySelector('#filters').addEventListener('input', () => { page = 1; render(); });
    document.querySelector('#filters').addEventListener('reset', () => setTimeout(() => { page = 1; render(); }));
    elements.sort.addEventListener('change', () => { page = 1; render(); });
    elements.previous.addEventListener('click', () => { page--; render(); scrollTo({ top: document.querySelector('.finder').offsetTop, behavior: 'smooth' }); });
    elements.next.addEventListener('click', () => { page++; render(); scrollTo({ top: document.querySelector('.finder').offsetTop, behavior: 'smooth' }); });
    results.addEventListener('click', (event) => { const button = event.target.closest('[data-company-id]'); if (!button) return; const company = companies.find((item) => item.id === button.dataset.companyId); elements['dialog-content'].innerHTML = detailMarkup(company); elements['company-dialog'].showModal(); });
    document.querySelector('.dialog-close').addEventListener('click', () => elements['company-dialog'].close());
    elements['company-dialog'].addEventListener('click', (event) => { if (event.target === elements['company-dialog']) elements['company-dialog'].close(); });
    render();
  } catch (error) {
    results.innerHTML = `<div class="empty"><h2>Company data is unavailable</h2><p>${escapeHtml(error.message)}</p></div>`;
  }
}

if (typeof document !== 'undefined') init();
