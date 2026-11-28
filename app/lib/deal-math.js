// Verdicts, discount and savings, the deal score, store-vs-store standing and the Today's best picks.

export const SIGNALS = {
  low: { label: 'All-Time Low', short: 'Record low', weight: 34 },
  strong: { label: 'Strong Deal', short: 'Strong', weight: 18 },
  fair: { label: 'Fair Price', short: 'Fair', weight: 4 },
  routine: { label: 'Skip', short: 'Skip', weight: -22 },
};

export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
export const savings = (d) => Math.round((d.was - d.price) * 100) / 100;

export function dealScore(d) {
  const raw = Math.min(percentOff(d), 50) * 0.6 + SIGNALS[d.signal].weight + Math.min(30, Math.log2(1 + savings(d)) * 3);
  return Math.max(1, Math.min(99, Math.round(raw)));
}

export function storesFor(deals, d) {
  return deals.filter((o) => o.group === d.group).sort((a, b) => a.price - b.price || a.store.localeCompare(b.store));
}

export function storeStanding(deals, d) {
  const all = storesFor(deals, d);
  if (all.length < 2) return null;
  const others = all.filter((o) => o.id !== d.id);
  return { stores: all.length, best: d.price <= all[0].price, others };
}

export function todaysBest(deals, categories = ['TVs', 'Audio', 'Home']) {
  const cheapest = (d) => storeStanding(deals, d)?.best ?? true;
  const top = categories.map((cat) => deals
    .filter((d) => d.category === cat && (d.signal === 'low' || d.signal === 'strong') && cheapest(d))
    .sort((a, b) => dealScore(b) - dealScore(a) || b.was - a.was)
    .slice(0, 6));
  let best = { score: -1, picks: [] };
  const walk = (i, picks, score) => {
    if (i === top.length) { if (score > best.score) best = { score, picks }; return; }
    for (const d of top[i]) if (!picks.some((p) => p.store === d.store)) walk(i + 1, [...picks, d], score + dealScore(d) + percentOff(d));
  };
  walk(0, [], 0);
  return best.picks;
}
