// Search, facet filters, sort orders, and the live count each filter option shows.

import { dealScore, percentOff, savings } from './deal-math.js';

const SORTS = {
  score: (a, b) => dealScore(b) - dealScore(a),
  percent: (a, b) => percentOff(b) - percentOff(a),
  saved: (a, b) => savings(b) - savings(a),
  price: (a, b) => a.price - b.price,
};

export const SORT_LABELS = { score: 'Best deal score', percent: 'Biggest % off', saved: 'Most $ saved', price: 'Lowest price' };
export const MINIMUMS = [0, 20, 30, 40, 50];

function matchesQuery(d, q) {
  if (!q) return true;
  const hay = `${d.product} ${d.store} ${d.category}`.toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((word) => hay.includes(word));
}

export function filterDeals(deals, s) {
  return deals
    .filter((d) => matchesQuery(d, s.q.trim()))
    .filter((d) => !s.cat || d.category === s.cat)
    .filter((d) => !s.store || d.store === s.store)
    .filter((d) => percentOff(d) >= s.min)
    .filter((d) => !s.sig || d.signal === s.sig)
    .sort((a, b) => (SORTS[s.sort] ?? SORTS.score)(a, b) || savings(b) - savings(a) || a.price - b.price);
}

export function facetCounts(deals, s, key, values) {
  return Object.fromEntries(values.map((v) => [v, filterDeals(deals, { ...s, [key]: v }).length]));
}

export const unique = (deals, key) => [...new Set(deals.map((d) => d[key]))];
