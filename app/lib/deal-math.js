// Verdicts, discount and savings, the deal score, store-vs-store standing and each deal's trail of price reads.

export const SIGNALS = {
  low: { label: 'All-Time Low', short: 'Record low', weight: 34 },
  strong: { label: 'Strong Deal', short: 'Strong', weight: 18 },
  fair: { label: 'Fair Price', short: 'Fair', weight: 4 },
  routine: { label: 'Skip', short: 'Skip', weight: -22 },
};

export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
export const savings = (d) => Math.round((d.was - d.price) * 100) / 100;
const cents = (n) => Math.round(n * 100) / 100;

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
  return { stores: all.length, best: d.price <= all[0].price, gap: cents(d.price - all[0].price), cheapest: all[0] };
}

/** Our reads of a deal's price: how many, whether every read saw today's price, and the first one. */
export function readTrail(d) {
  const first = d.reads[0];
  return { count: d.reads.length, held: d.reads.every((r) => r.price === d.price), first };
}
