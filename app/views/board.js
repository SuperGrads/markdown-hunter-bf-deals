// The page around the deal grid: the top band (brand, the board's vital numbers, navigation), the search and filter
// bar with a live count on every option, and the line that says how many deals the filters leave.

import { SIGNALS, percentOff } from '../lib/deal-math.js';
import { MINIMUMS, SORT_LABELS, facetCounts, unique } from '../lib/filter-deals.js';
import { checkedAt, esc } from '../lib/format.js';
import { icons, verdictBadge } from './deal-card.js';

export function boardStats(deals) {
  const times = deals.map((d) => d.checked).sort();
  return {
    count: deals.length,
    stores: new Set(deals.map((d) => d.store)).size,
    lows: deals.filter((d) => d.signal === 'low').length,
    skips: deals.filter((d) => d.signal === 'routine').length,
    avg: Math.round(deals.reduce((sum, d) => sum + percentOff(d), 0) / deals.length),
    from: checkedAt(times[0]),
    to: checkedAt(times[times.length - 1]).split(', ')[1],
  };
}

export function boardHeader(deals, state, savedCount) {
  const s = boardStats(deals);
  const tab = (view, label, href) => `<a href="${href}" class="tab ${state.view === view ? 'on' : ''}">${label}</a>`;
  const stat = (label, value, cls = '') => `<div class="${cls}"><dt>${label}</dt><dd>${value}</dd></div>`;
  return `<div class="masthead">
  <a class="brand" href="#/"><span class="logo">${icons.tag}</span><span><b>Markdown Hunter</b><small>Black Friday 2026 · every price checked, every verdict explained</small></span></a>
  <nav class="tabs">${tab('deals', 'Deals', '#/')}${tab('compare', `${icons.scale}Compare stores`, '#/compare')}<button class="tab" data-list="toggle">${icons.star}Shortlist<span class="pill">${savedCount}</span></button></nav>
</div>
<dl class="stats">
  ${stat('Verified deals', s.count)}${stat('Stores', s.stores)}${stat('All-time lows', s.lows, 'gold')}${stat('Avg. off', s.avg + '%')}${stat('Flagged “skip”', s.skips, 'red')}
  ${stat(`${icons.clock}Prices checked`, `${esc(s.from.replace(/,.*/, ''))}, ${esc(s.from.split(', ')[1].replace(' UTC', ''))}–${esc(s.to)}`, 'when')}
</dl>`;
}

export function filterBar(deals, s) {
  const cats = unique(deals, 'category');
  const stores = unique(deals, 'store').sort();
  const catCount = facetCounts(deals, s, 'cat', ['', ...cats]);
  const sigCount = facetCounts(deals, s, 'sig', ['', ...Object.keys(SIGNALS)]);
  const storeCount = facetCounts(deals, s, 'store', ['', ...stores]);
  const chip = (key, value, label, n, extra = '') =>
    `<button class="chip ${extra} ${s[key] === value ? 'on' : ''}" data-set="${key}" data-value="${esc(value)}" ${n === 0 ? 'disabled' : ''}>${label}<span>${n}</span></button>`;
  const option = (v, label, on) => `<option value="${esc(v)}" ${on ? 'selected' : ''}>${label}</option>`;

  return `<div class="bar-row">
  <label class="search">${icons.search}<input type="search" id="q" value="${esc(s.q)}" placeholder="Search 'OLED', 'Dyson'…" aria-label="Search deals" autocomplete="off"></label>
  <label class="select"><span>Store</span><select data-field="store">${['', ...stores].map((v) => option(v, `${esc(v || 'All stores')} (${storeCount[v]})`, s.store === v)).join('')}</select></label>
  <label class="select"><span>Sort</span><select data-field="sort">${Object.entries(SORT_LABELS).map(([v, l]) => option(v, l, s.sort === v)).join('')}</select></label>
  <div class="seg" role="group" aria-label="Minimum discount"><span>Min. off</span>${MINIMUMS.map((m) => `<button data-set="min" data-value="${m}" class="${s.min === m ? 'on' : ''}">${m ? m + '%+' : 'Any'}</button>`).join('')}</div>
</div>
<div class="chips" role="group" aria-label="Category"><span class="lbl">Category</span>${chip('cat', '', 'All', catCount[''])}${cats.map((c) => chip('cat', c, esc(c), catCount[c])).join('')}</div>
<div class="chips" role="group" aria-label="Verdict"><span class="lbl">Verdict</span>${chip('sig', '', 'Any', sigCount[''])}${Object.keys(SIGNALS).map((k) => chip('sig', k, verdictBadge(k), sigCount[k], 'v')).join('')}</div>`;
}

export function resultLine(shown, total, s) {
  const active = [s.q && `“${esc(s.q)}”`, s.cat && esc(s.cat), s.store && esc(s.store), s.min && `${s.min}%+ off`, s.sig && SIGNALS[s.sig].label].filter(Boolean);
  return `<p class="result-line"><b>${shown}</b> of ${total} deals${active.length ? ` · ${active.map((a) => `<span class="pill-f">${a}</span>`).join('')} <a href="#/" data-clear>Clear</a>` : ''}<span class="sorted">Sorted by ${SORT_LABELS[s.sort] ?? SORT_LABELS.score}</span></p>`;
}
