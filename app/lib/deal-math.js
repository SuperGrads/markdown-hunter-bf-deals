// Verdicts and the numbers behind them: discount, dollars saved, the deal score used for ranking, and how a price
// compares with the same product at other stores.

export const SIGNALS = {
  low: { label: 'All-Time Low', short: 'Record', weight: 34, blurb: 'The source tracks this as the lowest price ever, or since release.' },
  strong: { label: 'Strong Deal', short: 'Strong', weight: 18, blurb: 'A deep cut (about 30%+) or the lowest in months, with no record claim.' },
  fair: { label: 'Fair Price', short: 'Fair', weight: 6, blurb: 'A real but modest cut, or another store has the same thing for less.' },
  routine: { label: 'Routine · Skip', short: 'Skip', weight: -14, blurb: 'A repeat of an earlier sale, a "was" price nobody charges, or a cut too small to matter.' },
};

export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
export const savings = (d) => Math.round((d.was - d.price) * 100) / 100;

// 1–99: mostly the discount, lifted or sunk by the verdict and, gently, by the dollars saved.
export function dealScore(d) {
  const raw = percentOff(d) * 0.9 + SIGNALS[d.signal].weight + Math.min(14, Math.log2(1 + savings(d)) * 1.6);
  return Math.max(1, Math.min(99, Math.round(raw)));
}

/** Every store's listing of this deal's product, cheapest first (the deal itself included). */
export function storesFor(deals, d) {
  return deals.filter((o) => o.group === d.group).sort((a, b) => a.price - b.price);
}

/** Where this price sits against the same product elsewhere; null when only one store has it. */
export function storeStanding(deals, d) {
  const all = storesFor(deals, d);
  if (all.length < 2) return null;
  const cheapest = all[0];
  return { stores: all.length, lowest: d.price <= cheapest.price, cheapest, gap: Math.round((d.price - cheapest.price) * 100) / 100 };
}
