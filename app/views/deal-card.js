// One deal as a card in the grid: verdict and score, product, store, sale and usual price, discount, the evidence
// behind the verdict, the shopper's terms, how it compares at other stores, when and where the price was read, and
// the two actions (go to the store, save to the shortlist). Also the inline SVG icons every view shares.

import { SIGNALS, dealScore, percentOff, storeStanding } from '../lib/deal-math.js';
import { checkedAt, esc, usd } from '../lib/format.js';

const svg = (body) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const STAR = 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z';

export const icons = {
  tag: svg('<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  check: svg('<path d="M20 6 9 17l-5-5"/>'),
  shield: svg('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
  out: svg('<path d="M14 4h6v6M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'),
  star: svg(`<path d="${STAR}"/>`),
  starFill: svg(`<path fill="currentColor" d="${STAR}"/>`),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  trophy: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'),
  store: svg('<path d="M4 9h16l-1-5H5z"/><path d="M5 9v11h14V9"/><path d="M10 20v-6h4v6"/>'),
  alert: svg('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>'),
  scale: svg('<path d="M12 3v18M7 21h10M5 7h14"/><path d="m5 7-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>'),
};

const SIGNAL_ICON = { low: icons.trophy, strong: icons.check, fair: icons.tag, routine: icons.alert };

export const storeSlug = (store) => store.toLowerCase().replace(/[^a-z]+/g, '');

export const verdictBadge = (signal, short = false) =>
  `<span class="badge sig-${signal}" title="${SIGNALS[signal].label}">${SIGNAL_ICON[signal]}${short ? SIGNALS[signal].short : SIGNALS[signal].label}</span>`;

/** "Lowest of 3" or "Amazon $10 less", for products more than one store sells. */
export function standingChip(deals, d) {
  const s = storeStanding(deals, d);
  if (!s) return '';
  return s.lowest
    ? `<span class="chip-s best" title="Cheapest of the ${s.stores} stores we checked">${icons.scale}Lowest of ${s.stores}</span>`
    : `<span class="chip-s worse" title="The same product costs less at ${esc(s.cheapest.store)}">${icons.scale}${esc(s.cheapest.store)} ${usd(s.gap)} less</span>`;
}

export function dealCard(d, deals, saved) {
  const isSaved = saved.has(d.id);
  const verb = d.signal === 'routine' ? 'See at' : 'Buy at';
  return `<article class="card sig-${d.signal}">
  <div class="card-top">${verdictBadge(d.signal)}<span class="score" title="Deal score out of 99">${dealScore(d)}</span></div>
  <h3><a href="#/?deal=${encodeURIComponent(d.id)}" data-open="${esc(d.id)}">${esc(d.product)}</a></h3>
  <p class="where"><i class="dot st-${storeSlug(d.store)}"></i><b>${esc(d.store)}</b> · ${esc(d.category)}</p>
  <div class="prices"><strong>${usd(d.price)}</strong><s>${usd(d.was)}</s><em>−${percentOff(d)}%</em></div>
  <p class="why">${esc(d.evidence)}</p>
  <div class="tags"><span class="chip-s terms">${icons.tag}${esc(d.terms || 'No code needed')}</span>${standingChip(deals, d)}</div>
  <p class="meta">${icons.clock}${checkedAt(d.checked)} · ${esc(d.source)}</p>
  <div class="actions">
    <a class="go" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer"><span>${verb} ${esc(d.store)}</span>${icons.out}</a>
    <button class="save-btn ${isSaved ? 'on' : ''}" data-save="${esc(d.id)}" aria-pressed="${isSaved}" aria-label="${isSaved ? 'Remove from' : 'Add to'} shortlist">${isSaved ? icons.starFill : icons.star}</button>
  </div>
</article>`;
}
