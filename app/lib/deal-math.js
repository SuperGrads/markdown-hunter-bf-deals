// Numbers derived from a deal's two prices and its signal: discount, savings, and the deal score used for sorting.

export const SIGNALS = {
  low: { label: 'All-Time Low', short: 'Record low', weight: 34, blurb: 'The cited source tracks this as the lowest price it has seen.' },
  strong: { label: 'Strong Deal', short: 'Strong', weight: 18, blurb: 'A deep cut (about 30%+) with no record-low claim behind it.' },
  fair: { label: 'Fair Price', short: 'Fair', weight: 6, blurb: 'A modest but real cut: fine if you need it now.' },
  routine: { label: 'Routine / Inflated', short: 'Routine', weight: -14, blurb: 'The usual street price, a cut of cents, or a "was" price that oversells it.' },
};

export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
export const savings = (d) => Math.round((d.was - d.price) * 100) / 100;

// 0–100: mostly the discount, lifted by how trustworthy the signal is and, gently, by the dollars saved.
export function dealScore(d) {
  const raw = percentOff(d) * 0.9 + SIGNALS[d.signal].weight + Math.min(14, Math.log2(1 + savings(d)) * 1.6);
  return Math.max(1, Math.min(99, Math.round(raw)));
}

// The other stores carrying the same product, cheapest first.
export function sameProduct(deals, d) {
  return deals.filter((o) => o.group === d.group && o.id !== d.id).sort((a, b) => a.price - b.price);
}

export function bestInGroup(deals, d) {
  return deals.filter((o) => o.group === d.group).every((o) => o.price >= d.price);
}
