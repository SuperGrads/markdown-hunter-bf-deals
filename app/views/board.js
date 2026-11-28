// The board around the deals: top band with facts and verdict legend, filter bar, Today's best, the Skip rail.

import { SIGNALS, todaysBest } from '../lib/deal-math.js';
import { MINIMUMS, SORT_LABELS, facetCounts, unique } from '../lib/filter-deals.js';
import { clockOf, dayOf, esc, usd } from '../lib/format.js';
import { dealCard, icons, verdictBadge } from './deal-card.js';

export function boardFacts(deals) {
  const times = deals.map((d) => d.checked).sort();
  return {
    count: deals.length,
    stores: new Set(deals.map((d) => d.store)).size,
    onPage: deals.filter((d) => d.readAt === 'store page').length,
    day: dayOf(times[0]),
    window: `${clockOf(times[0])}–${clockOf(times.at(-1))} UTC`,
  };
}

export function boardHeader(deals, state, savedCount) {
  const f = boardFacts(deals);
  const tab = (view, label, href) => `<a href="${href}" class="tab ${state.view === view ? 'on' : ''}">${label}</a>`;
  const counts = facetCounts(deals, { ...state, q: '', cat: '', store: '', min: 0 }, 'sig', Object.keys(SIGNALS));
  const legend = Object.keys(SIGNALS).map((k) =>
    `<button class="key sig-${k} ${state.sig === k ? 'on' : ''}" data-set="sig" data-value="${k}" aria-pressed="${state.sig === k}"><i></i>${SIGNALS[k].label}<b>${counts[k]}</b></button>`).join('');
  return `<div class="masthead">
  <a class="brand" href="#/"><span class="logo">${icons.tag}</span><span><b>Markdown Hunter</b><small>Black Friday deals, re-checked today, each with a verdict and its evidence</small></span></a>
  <nav class="tabs">${tab('deals', 'Deals', '#/')}${tab('compare', `${icons.scale}Compare stores`, '#/compare')}<button class="tab" data-list="toggle">${icons.star}Shortlist<span class="pill">${savedCount}</span></button></nav>
</div>
<div class="facts-row">
  <p class="facts-line"><b>${f.count}</b> deals · <b>${f.stores}</b> stores · re-checked <b class="gold">${f.day} ${f.window}</b></p>
  <div class="legend" role="group" aria-label="Verdict">${legend}</div>
</div>`;
}

export function filterBar(deals, s) {
  const cats = unique(deals, 'category');
  const stores = unique(deals, 'store').sort();
  const catCount = facetCounts(deals, s, 'cat', ['', ...cats]);
  const storeCount = facetCounts(deals, s, 'store', ['', ...stores]);
  const chip = (value, label, n) =>
    `<button class="chip ${s.cat === value ? 'on' : ''}" data-set="cat" data-value="${esc(value)}" ${n === 0 ? 'disabled' : ''}>${label}<span>${n}</span></button>`;
  const option = (v, label, on) => `<option value="${esc(v)}" ${on ? 'selected' : ''}>${label}</option>`;

  return `<div class="bar-row">
  <label class="search">${icons.search}<input type="search" id="q" value="${esc(s.q)}" placeholder="Search 'OLED', 'Dyson'…" aria-label="Search deals" autocomplete="off"></label>
  <label class="select ${s.store ? 'set' : ''}"><span>Store</span><select data-field="store">${['', ...stores].map((v) => option(v, `${esc(v || 'All stores')} (${storeCount[v]})`, s.store === v)).join('')}</select></label>
  <label class="select"><span>Sort</span><select data-field="sort">${Object.entries(SORT_LABELS).map(([v, l]) => option(v, l, s.sort === v)).join('')}</select></label>
  <div class="seg" role="group" aria-label="Minimum discount"><span>Min. off</span>${MINIMUMS.map((m) => `<button data-set="min" data-value="${m}" class="${s.min === m ? 'on' : ''}">${m ? m + '%+' : 'Any'}</button>`).join('')}</div>
</div>
<div class="chips" role="group" aria-label="Category"><span class="lbl">Category</span>${chip('', 'All', catCount[''])}${cats.map((c) => chip(c, esc(c), catCount[c])).join('')}</div>`;
}

export const isHome = (s) => !s.q && !s.cat && !s.store && !s.min && !s.sig && s.sort === 'score';

export function bestStrip(deals, saved) {
  const picks = todaysBest(deals);
  return `<section class="strip" aria-label="Today's best">
  <h2>${icons.trophy}Today's best <small>top TV, audio and home deal, each at its cheapest store</small><span class="count">${deals.filter((d) => d.readAt === 'store page').length} read on the store page, the rest in a source dated today</span></h2>
  <div class="strip-cards">${picks.map((d) => dealCard(d, deals, saved, 'pick')).join('')}</div>
</section>`;
}

export function skipRail(deals) {
  const skips = deals.filter((d) => d.signal === 'routine');
  const item = (d) => `<li><a href="#/?deal=${encodeURIComponent(d.id)}" data-open="${esc(d.id)}">${verdictBadge('routine')}<b>${esc(d.product)}</b><span class="rail-price">${esc(d.store)} · <strong>${usd(d.price)}</strong></span><small>${esc(d.evidence)}</small></a></li>`;
  return `<aside class="rail" aria-label="Deals flagged Skip">
  <h2>${icons.alert}Flagged: skip these <span>${skips.length}</span></h2>
  <ul>${skips.map(item).join('')}</ul>
</aside>`;
}

export function resultLine(shown, total, s) {
  const active = [s.q && `“${esc(s.q)}”`, s.cat && esc(s.cat), s.store && esc(s.store), s.min && `${s.min}%+ off`, s.sig && SIGNALS[s.sig].label].filter(Boolean);
  return `<p class="result-line"><b>${shown}</b> of ${total} deals${active.length ? ` · ${active.map((a) => `<span class="pill-f">${a}</span>`).join('')} <a href="#/" data-clear>Clear</a>` : ''}<span class="sorted">Sorted by ${SORT_LABELS[s.sort] ?? SORT_LABELS.score}</span></p>`;
}
