// What the board works out once the deal data has arrived (loaded with it by import()): the "best deal score" rank
// of every deal, the counts the top tiles show, and the products with the widest price gap between stores.

import { dealScore } from './deal-math.js';

/**
 * Sets d.rank. Each product's cheapest store comes first (the same item elsewhere follows later), and among those
 * the next pick is the best score after a small penalty per pick already taken from its category and its store, so
 * the top rows mix TVs, audio, kitchen and the rest, at several stores, instead of nine TVs at one.
 */
export function rankDeals(deals) {
  const sorted = [...deals].sort((a, b) => dealScore(b) - dealScore(a) || a.price - b.price || a.store.localeCompare(b.store));
  const seen = new Set();
  const leaders = [];
  const rest = [];
  for (const d of sorted) (seen.has(d.group) ? rest : leaders).push(d), seen.add(d.group);
  const taken = new Map();
  const count = (key) => taken.get(key) ?? 0;
  const order = [];
  while (leaders.length) {
    let at = 0;
    let top = -Infinity;
    leaders.forEach((d, i) => {
      const v = dealScore(d) - 7 * count(d.category) - 4 * count(`@${d.store}`);
      if (v > top) [top, at] = [v, i];
    });
    const [d] = leaders.splice(at, 1);
    for (const key of [d.category, `@${d.store}`]) taken.set(key, count(key) + 1);
    order.push(d);
  }
  [...order, ...rest].forEach((d, i) => { d.rank = i; });
}

/** The counts the top tiles show, all computed from the deal data. */
export function boardFacts(deals) {
  const count = (f) => deals.filter(f).length;
  const times = deals.map((d) => d.checked).sort();
  return {
    deals: deals.length,
    stores: new Set(deals.map((d) => d.store)).size,
    lows: count((d) => d.signal === 'low'),
    weak: count((d) => d.signal === 'fair' || d.signal === 'routine'),
    skips: count((d) => d.signal === 'routine'),
    onPage: count((d) => d.readAt === 'store page'),
    held: count((d) => d.reads.length > 1 && d.reads.every((r) => r.price === d.price)),
    first: times[0],
    last: times.at(-1),
  };
}

/** Products sold at 2+ stores, the widest gap between the cheapest and the dearest store first. */
export function priceSpreads(deals) {
  const groups = new Map();
  for (const d of deals) groups.set(d.group, [...(groups.get(d.group) ?? []), d]);
  return [...groups.values()]
    .filter((g) => g.length > 1)
    .map((g) => {
      const sorted = [...g].sort((a, b) => a.price - b.price);
      return { low: sorted[0], high: sorted.at(-1), gap: Math.round((sorted.at(-1).price - sorted[0].price) * 100) / 100 };
    })
    .filter((s) => s.gap > 0)
    .sort((a, b) => b.gap - a.gap);
}
