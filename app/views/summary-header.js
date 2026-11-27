// The top band: brand, the board's vital numbers (verified deals, average discount, stores, record lows, when the
// prices were checked) and the navigation between the deal grid and the store comparison.

import { percentOff } from '../lib/deal-math.js';
import { checkedAt, esc } from '../lib/format.js';
import { icons } from './icons.js';

export function boardStats(deals) {
  const times = deals.map((d) => d.checked).sort();
  return {
    count: deals.length,
    avg: Math.round(deals.reduce((sum, d) => sum + percentOff(d), 0) / deals.length),
    stores: new Set(deals.map((d) => d.store)).size,
    lows: deals.filter((d) => d.signal === 'low').length,
    from: times[0],
    to: times[times.length - 1],
  };
}

export function summaryHeader(deals, state, savedCount) {
  const s = boardStats(deals);
  const tab = (view, label, href) => `<a href="${href}" class="tab ${state.view === view ? 'on' : ''}">${label}</a>`;
  return `<div class="masthead">
  <div class="brand"><span class="logo">${icons.tag}</span><div><b>Markdown Hunter</b><small>Black Friday &amp; Cyber Monday 2026 · prices checked, not copied</small></div></div>
  <nav class="tabs">
    ${tab('deals', 'Deals', '#/')}
    ${tab('compare', 'Compare stores', '#/compare')}
    <button class="tab list-tab" data-list="toggle">${icons.star}Shortlist <span class="pill">${savedCount}</span></button>
  </nav>
</div>
<dl class="stats">
  <div><dt>${icons.shield}Verified deals</dt><dd>${s.count}</dd></div>
  <div><dt>Average discount</dt><dd>${s.avg}%</dd></div>
  <div><dt>Stores covered</dt><dd>${s.stores}</dd></div>
  <div><dt>All-time lows</dt><dd>${s.lows}</dd></div>
  <div class="when"><dt>${icons.clock}Prices checked</dt><dd>${esc(checkedAt(s.from).replace(' UTC', ''))}–${esc(checkedAt(s.to).split(', ')[1])}</dd></div>
</dl>`;
}
