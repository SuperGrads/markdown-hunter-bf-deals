// #/compare: the same product side by side at every store that carries it, then how each category and each store
// stacks up (deals, average discount, record lows, its best pick).

import { SIGNALS, dealScore, percentOff } from '../lib/deal-math.js';
import { esc, usd } from '../lib/format.js';
import { icons } from './icons.js';
import { storeSlug, verdictBadge } from './deal-card.js';

function groupsAcrossStores(deals) {
  const byGroup = new Map();
  for (const d of deals) byGroup.set(d.group, [...(byGroup.get(d.group) ?? []), d]);
  return [...byGroup.values()].filter((g) => g.length > 1).map((g) => g.sort((a, b) => a.price - b.price));
}

function matchup(group) {
  const max = Math.max(...group.map((d) => d.price));
  const spread = group[group.length - 1].price - group[0].price;
  return `<article class="match">
  <header><h3>${esc(group[0].product)}</h3><p>${spread > 0 ? `Save ${usd(spread)} by picking ${esc(group[0].store)}` : 'Same price everywhere: pick your store'}</p></header>
  <ul class="vs">${group
    .map(
      (d, i) => `<li><a class="vs-store" href="#/compare?deal=${encodeURIComponent(d.id)}"><i class="dot st-${storeSlug(d.store)}"></i>${esc(d.store)}</a><span class="vs-bar"><span style="width:${Math.round((d.price / max) * 100)}%"></span></span><b>${usd(d.price)}</b>${i === 0 || d.price === group[0].price ? '<em>Lowest</em>' : `<small>+${usd(d.price - group[0].price)}</small>`}<span class="mini">${verdictBadge(d.signal)}</span></li>`,
    )
    .join('')}</ul>
</article>`;
}

function breakdown(deals, key, title) {
  const rows = [...new Set(deals.map((d) => d[key]))].map((value) => {
    const set = deals.filter((d) => d[key] === value);
    const top = [...set].sort((a, b) => dealScore(b) - dealScore(a))[0];
    return { value, n: set.length, avg: Math.round(set.reduce((s, d) => s + percentOff(d), 0) / set.length), lows: set.filter((d) => d.signal === 'low').length, top };
  }).sort((a, b) => b.n - a.n);
  const widest = Math.max(...rows.map((r) => r.avg));
  return `<section class="table-card"><h3>${icons.bars}${title}</h3><table>
<thead><tr><th>${key === 'store' ? 'Store' : 'Category'}</th><th>Deals</th><th>Avg. off</th><th>Record lows</th><th>Top pick</th></tr></thead>
<tbody>${rows
    .map(
      (r) => `<tr><td><a href="#/?${key === 'store' ? 'store' : 'cat'}=${encodeURIComponent(r.value)}">${key === 'store' ? `<i class="dot st-${storeSlug(r.value)}"></i>` : ''}${esc(r.value)}</a></td><td>${r.n}</td><td><span class="avg"><span style="width:${Math.round((r.avg / widest) * 100)}%"></span></span>${r.avg}%</td><td>${r.lows}</td><td><a href="#/compare?deal=${encodeURIComponent(r.top.id)}">${esc(r.top.product)}</a> <b>${usd(r.top.price)}</b></td></tr>`,
    )
    .join('')}</tbody></table></section>`;
}

export function compareView(deals) {
  const groups = groupsAcrossStores(deals);
  const legend = Object.entries(SIGNALS).map(([k, v]) => `<li>${verdictBadge(k)}<span>${esc(v.blurb)}</span></li>`).join('');
  return `<div class="compare">
  <section class="intro"><h2>Same product, different stores</h2><p>${groups.length} products we found at more than one store, cheapest first. The verdict beside each store says whether its price is a real low.</p></section>
  <div class="matches">${groups.map(matchup).join('')}</div>
  <div class="tables">${breakdown(deals, 'category', 'By category')}${breakdown(deals, 'store', 'By store')}</div>
  <section class="table-card legend"><h3>${icons.shield}How we call a verdict</h3><ul>${legend}</ul></section>
</div>`;
}
