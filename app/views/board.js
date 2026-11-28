// The board around the deals: masthead and tabs, the count tiles, the filter bar, the price-gap row (same product,
// cheapest vs dearest store), the result line and the one-line Skip banner.

import { SIGNALS } from '../lib/deal-math.js';
import { MINIMUMS, SORT_LABELS, facetCounts, unique } from '../lib/filter-deals.js';
import { checkedAt, esc, usd } from '../lib/format.js';
import { icons } from './deal-card.js';

/** f: the counts from lib/board-stats.js boardFacts. */
export function boardHeader(f, state, savedCount) {
  const tab = (view, label, href) => `<a href="${href}" class="tab ${state.view === view ? 'on' : ''}">${label}</a>`;
  // A tile that filters the board says so with data-set; the others are plain counts.
  const tile = (n, label, cls = '', sig = '') =>
    `<${sig ? `button data-set="sig" data-value="${sig}" aria-pressed="${state.sig === sig}"` : 'div'} class="tile ${cls} ${sig && state.sig === sig ? 'on' : ''}"><b>${n}</b><span>${label}</span></${sig ? 'button' : 'div'}>`;
  const [d1, m1, from] = checkedAt(f.first).split(' ');
  const to = checkedAt(f.last).split(' ')[2];
  return `<div class="masthead">
  <a class="brand" href="#/"><span class="logo">${icons.tag}</span><span><b>Markdown Hunter</b><small>Black Friday deals, re-read today, each with a verdict and its evidence</small></span></a>
  <nav class="tabs">${tab('deals', 'Deals', '#/')}${tab('compare', `${icons.scale}Compare stores`, '#/compare')}<button class="tab" data-list="toggle">${icons.star}Shortlist<span class="pill">${savedCount}</span></button></nav>
</div>
<div class="tiles">
  ${tile(f.deals, `deals at <b>${f.stores}</b> stores`)}
  ${tile(f.lows, 'at a record low', 't-low', 'low')}
  ${tile(`${f.weak}<small>/${f.deals}</small>`, 'only Fair or Skip', 't-weak')}
  ${tile(f.onPage, 'read on the store page', 't-page')}
  ${tile(f.held, 'same price every read', 't-held')}
  <div class="tile t-when"><span>all re-read ${d1} ${m1}</span><b>${from}–${to}</b><span>UTC</span></div>
</div>`;
}

export function filterBar(deals, s) {
  const cats = unique(deals, 'category');
  const stores = unique(deals, 'store').sort();
  const catCount = facetCounts(deals, s, 'cat', ['', ...cats]);
  const storeCount = facetCounts(deals, s, 'store', ['', ...stores]);
  const sigCount = facetCounts(deals, s, 'sig', ['', ...Object.keys(SIGNALS)]);
  const chip = (value, label, n) =>
    `<button class="chip ${s.cat === value ? 'on' : ''}" data-set="cat" data-value="${esc(value)}" ${n === 0 ? 'disabled' : ''}>${label}<span>${n}</span></button>`;
  const option = (v, label, on) => `<option value="${esc(v)}" ${on ? 'selected' : ''}>${label}</option>`;

  return `<div class="bar-row">
  <label class="search">${icons.search}<input type="search" id="q" value="${esc(s.q)}" placeholder="Search deals" aria-label="Search deals" autocomplete="off"></label>
  <label class="select ${s.store ? 'set' : ''}"><span>Store</span><select data-field="store">${['', ...stores].map((v) => option(v, `${esc(v || 'All stores')} (${storeCount[v]})`, s.store === v)).join('')}</select></label>
  <label class="select ${s.sig ? 'set' : ''}"><span>Verdict</span><select data-field="sig">${['', ...Object.keys(SIGNALS)].map((v) => option(v, `${v ? SIGNALS[v].label : 'Any'} (${sigCount[v]})`, s.sig === v)).join('')}</select></label>
  <label class="select"><span>Sort</span><select data-field="sort">${Object.entries(SORT_LABELS).map(([v, l]) => option(v, l, s.sort === v)).join('')}</select></label>
  <div class="seg" role="group" aria-label="Minimum discount"><span>Min. off</span>${MINIMUMS.map((m) => `<button data-set="min" data-value="${m}" class="${s.min === m ? 'on' : ''}">${m ? m + '%+' : 'Any'}</button>`).join('')}</div>
</div>
<div class="chips" role="group" aria-label="Category">${chip('', 'All', catCount[''])}${cats.map((c) => chip(c, esc(c), catCount[c])).join('')}${isHome(s) ? `<span class="count"><b>${deals.length}</b> deals · best first</span>` : ''}</div>`;
}

export const isHome = (s) => !s.q && !s.cat && !s.store && !s.min && !s.sig && s.sort === 'score';

/** A product's name up to its first bracket or comma, less trailing lowercase words ("waterproof speaker"). */
const shortName = (p) => p.split(/ \(|, /)[0].replace(/( [a-z][a-z-]*)+$/, '');

/** spreads: the widest price gaps from lib/board-stats.js priceSpreads. */
export function spreadRow(spreads) {
  const cell = ({ low, high, gap }) => `<a class="gap fit" href="#/compare" title="${esc(low.product)}"><b>${esc(shortName(low.product))}</b><span>${esc(low.store)} <strong>${usd(low.price)}</strong> vs ${esc(high.store)} ${usd(high.price)} · <em>save ${usd(gap)}</em></span></a>`;
  return `<section class="gaps" aria-label="Same product, different price"><h2>${icons.scale}Same product, <br>different price</h2>${spreads.map(cell).join('')}</section>`;
}

export function skipBanner(f) {
  return `<button class="skips" data-set="sig" data-value="routine">${icons.alert}<b>${f.skips} flagged Skip</b><span>another store is far cheaper, or the "sale" repeats an earlier price</span><u>Show them</u></button>`;
}

export function resultLine(shown, total, s) {
  const active = [s.q && `“${esc(s.q)}”`, s.cat && esc(s.cat), s.store && esc(s.store), s.min && `${s.min}%+ off`, s.sig && SIGNALS[s.sig].label].filter(Boolean);
  return `<p class="result-line"><b>${shown}</b> of ${total} deals${active.length ? ` · ${active.map((a) => `<span class="pill-f">${a}</span>`).join('')} <a href="#/" data-clear>Clear</a>` : ''}<span class="sorted">Sorted by ${SORT_LABELS[s.sort] ?? SORT_LABELS.score}</span></p>`;
}
