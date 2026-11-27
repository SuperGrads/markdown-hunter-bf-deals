// #/compare: every product we found at more than one store, side by side with the cheapest marked, biggest price gap
// first; beside them, which store wins most matchups and the shopper's shortlist; below, how each category stacks up.

import { dealScore, percentOff, savings } from '../lib/deal-math.js';
import { esc, usd } from '../lib/format.js';
import { icons, storeSlug, verdictBadge } from './deal-card.js';

const cents = (n) => Math.round(n * 100) / 100;

export function matchups(deals) {
  const byGroup = new Map();
  for (const d of deals) byGroup.set(d.group, [...(byGroup.get(d.group) ?? []), d]);
  return [...byGroup.values()]
    .filter((g) => g.length > 1)
    .map((g) => g.sort((a, b) => a.price - b.price))
    .sort((a, b) => b.at(-1).price - b[0].price - (a.at(-1).price - a[0].price));
}

function matchupCard(group) {
  const max = group.at(-1).price;
  const spread = cents(max - group[0].price);
  const row = (d) => `<li><a class="vs-store" href="#/compare?deal=${encodeURIComponent(d.id)}" data-open="${esc(d.id)}"><i class="dot st-${storeSlug(d.store)}"></i>${esc(d.store)}</a><span class="vs-bar"><span style="width:${Math.round((d.price / max) * 100)}%"></span></span><b>${usd(d.price)}</b>${d.price === group[0].price ? '<em>Lowest</em>' : `<small>+${usd(cents(d.price - group[0].price))}</small>`}${verdictBadge(d.signal, true)}</li>`;
  return `<article class="match">
  <header><h3>${esc(group[0].product)}</h3><p>${spread > 0 ? `Pick <b>${esc(group[0].store)}</b>, save ${usd(spread)}` : 'Same price at every store'}</p></header>
  <ul class="vs">${group.map(row).join('')}</ul>
</article>`;
}

function storeWins(groups) {
  const wins = new Map();
  for (const g of groups) for (const d of g) if (d.price === g[0].price) wins.set(d.store, (wins.get(d.store) ?? 0) + 1);
  const rows = [...wins].sort((a, b) => b[1] - a[1]).slice(0, 6);
  return `<section class="side-card"><h3>${icons.store}Cheapest most often</h3><ol class="wins">${rows.map(([s, n]) => `<li><i class="dot st-${storeSlug(s)}"></i>${esc(s)}<b>${n} of ${groups.length}</b></li>`).join('')}</ol></section>`;
}

function shortlistSummary(deals, saved) {
  const picks = deals.filter((d) => saved.has(d.id));
  if (!picks.length) return `<section class="side-card"><h3>${icons.star}Your shortlist</h3><p class="muted">Star a deal to total it up here.</p></section>`;
  const total = cents(picks.reduce((s, d) => s + d.price, 0));
  const saving = cents(picks.reduce((s, d) => s + savings(d), 0));
  return `<section class="side-card"><h3>${icons.starFill}Your shortlist</h3><ul class="mini-picks">${picks.map((d) => `<li><span>${esc(d.product)}<small>${esc(d.store)}</small></span><b>${usd(d.price)}</b></li>`).join('')}</ul>
  <div class="totals"><div><span>${picks.length} items</span><b>${usd(total)}</b></div><div><span>You save</span><b class="green">${usd(saving)}</b></div></div>
  <button class="go" data-list="toggle">Open shortlist</button></section>`;
}

function categoryTable(deals) {
  const rows = [...new Set(deals.map((d) => d.category))].map((cat) => {
    const set = deals.filter((d) => d.category === cat);
    const top = [...set].sort((a, b) => dealScore(b) - dealScore(a))[0];
    return { cat, n: set.length, avg: Math.round(set.reduce((s, d) => s + percentOff(d), 0) / set.length), lows: set.filter((d) => d.signal === 'low').length, top };
  });
  return `<section class="table-card"><h3>By category</h3><table><thead><tr><th>Category</th><th>Deals</th><th>Avg. off</th><th>Record lows</th><th>Best pick</th></tr></thead><tbody>${rows
    .map((r) => `<tr><td><a href="#/?cat=${encodeURIComponent(r.cat)}">${esc(r.cat)}</a></td><td>${r.n}</td><td>${r.avg}%</td><td>${r.lows}</td><td><a href="#/compare?deal=${encodeURIComponent(r.top.id)}" data-open="${esc(r.top.id)}">${esc(r.top.product)}</a> · ${esc(r.top.store)} <b>${usd(r.top.price)}</b></td></tr>`)
    .join('')}</tbody></table></section>`;
}

export function compareView(deals, saved) {
  const groups = matchups(deals);
  return `<div class="compare">
  <section class="intro"><h2>${icons.scale}Same product, different stores</h2><p><b>${groups.length} products</b> sold at 2–3 stores, biggest price gap first. Green marks the cheapest; the verdict says whether that price is a real low.</p></section>
  <div class="compare-cols">
    <div class="matches">${groups.map(matchupCard).join('')}</div>
    <aside class="side">${shortlistSummary(deals, saved)}${storeWins(groups)}</aside>
  </div>
  ${categoryTable(deals)}
</div>`;
}
