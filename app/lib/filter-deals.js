// Search, facet filters and sort orders over the deal list.

import { dealScore, percentOff, savings } from './deal-math.js';

const SORTS = {
  score: (a, b) => dealScore(b) - dealScore(a),
  percent: (a, b) => percentOff(b) - percentOff(a),
  price: (a, b) => a.price - b.price,
  saved: (a, b) => savings(b) - savings(a),
};

export const SORT_LABELS = { score: 'Best deal score', percent: 'Biggest % off', saved: 'Biggest $ saved', price: 'Lowest price' };

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
    .sort((a, b) => (SORTS[s.sort] ?? SORTS.score)(a, b) || a.price - b.price);
}

// How many deals each option of a facet would show, given every other active filter.
export function facetCounts(deals, s, key, values) {
  const counts = {};
  for (const v of values) counts[v] = filterDeals(deals, { ...s, [key]: v }).length;
  return counts;
}

export const unique = (deals, key) => [...new Set(deals.map((d) => d[key]))];
