// The search box and facet controls: category chips, store, minimum discount, verdict and sort, each showing how
// many deals it would leave.

import { SIGNALS } from '../lib/deal-math.js';
import { SORT_LABELS, facetCounts, filterDeals, unique } from '../lib/filter-deals.js';
import { esc } from '../lib/format.js';
import { icons, signalIcon } from './icons.js';

const MINIMUMS = [0, 20, 30, 40, 50];

export function filterBar(deals, s) {
  const cats = unique(deals, 'category');
  const stores = unique(deals, 'store').sort();
  const catCount = facetCounts(deals, s, 'cat', ['', ...cats]);
  const sigCount = facetCounts(deals, s, 'sig', ['', ...Object.keys(SIGNALS)]);
  const storeCount = facetCounts(deals, s, 'store', ['', ...stores]);
  const chip = (key, value, label, n, extra = '') =>
    `<button class="chip ${extra} ${s[key] === value ? 'on' : ''}" data-set="${key}" data-value="${esc(value)}" ${n === 0 ? 'disabled' : ''}>${label}<span>${n}</span></button>`;

  return `<div class="search-row">
  <label class="search">${icons.search}<input type="search" id="q" value="${esc(s.q)}" placeholder="Search products, stores, categories…" aria-label="Search deals" autocomplete="off"></label>
  <label class="select"><span>Store</span><select data-field="store">${['', ...stores].map((v) => `<option value="${esc(v)}" ${s.store === v ? 'selected' : ''}>${v || 'All stores'} (${storeCount[v]})</option>`).join('')}</select></label>
  <label class="select"><span>Sort</span><select data-field="sort">${Object.entries(SORT_LABELS).map(([v, l]) => `<option value="${v}" ${s.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
</div>
<div class="chips" role="group" aria-label="Category">${chip('cat', '', 'All categories', catCount[''])}${cats.map((c) => chip('cat', c, esc(c), catCount[c])).join('')}</div>
<div class="chips-row">
  <div class="chips" role="group" aria-label="Verdict">${chip('sig', '', 'Any verdict', sigCount[''])}${Object.entries(SIGNALS).map(([k, v]) => chip('sig', k, signalIcon[k] + v.label, sigCount[k], 'v-' + k)).join('')}</div>
  <div class="seg" role="group" aria-label="Minimum discount"><span>Min. off</span>${MINIMUMS.map((m) => `<button data-set="min" data-value="${m}" class="${s.min === m ? 'on' : ''}">${m ? m + '%+' : 'Any'}</button>`).join('')}</div>
</div>`;
}

export function resultLine(shown, total, s) {
  const active = s.q || s.cat || s.store || s.min || s.sig;
  return `<p class="result-line"><b>${shown}</b> of ${total} verified deals${active ? ' match' : ''}${active ? ' · <a href="#/" data-clear>Clear filters</a>' : ''}</p>`;
}

export { filterDeals };
