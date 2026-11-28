// One deal as a compact card: verdict, % off, product, prices, Buy link, the store and its rank among stores, why
// the verdict, and where, when and how often we read the price. Each line fits (tools/audit-fit.mjs measures it).

import { SIGNALS, dealScore, percentOff, readTrail, storeStanding } from '../lib/deal-math.js';
import { checkedAt, esc, usd } from '../lib/format.js';

export const svg = (body) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const STAR = 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z';

export const icons = {
  tag: svg('<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  check: svg('<path d="M20 6 9 17l-5-5"/>'),
  out: svg('<path d="M14 4h6v6M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'),
  star: svg(`<path d="${STAR}"/>`),
  starFill: svg(`<path fill="currentColor" d="${STAR}"/>`),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  trophy: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'),
  alert: svg('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>'),
  scale: svg('<path d="M12 3v18M7 21h10M5 7h14"/><path d="m5 7-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>'),
  page: svg('<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="m9 14 2 2 4-4"/>'),
};

const SIGNAL_ICON = { low: icons.trophy, strong: icons.check, fair: icons.tag, routine: icons.alert };

export const storeSlug = (store) => store.toLowerCase().replace(/[^a-z]+/g, '');

export const verdictBadge = (signal, short = false) =>
  `<span class="badge sig-${signal}" title="${SIGNALS[signal].label}">${SIGNAL_ICON[signal]}${short ? SIGNALS[signal].short : SIGNALS[signal].label}</span>`;

/** "held 3 reads" when every read saw today's price, else where it came from: "from $149 on 27 Nov". */
export function trailText(d) {
  const t = readTrail(d);
  if (t.held) return t.count > 1 ? `held ${t.count} reads` : '1 read';
  return `from ${usd(t.first.price)} on ${checkedAt(t.first.at).split(' ').slice(0, 2).join(' ')}`;
}

/** Where the price was read: the store's own page, or the deals site (the price check names the exact page). */
export const readWhere = (d) => (d.readAt === 'store page' ? `${d.store} page` : d.site);

function storeLine(deals, d) {
  const s = storeStanding(deals, d);
  const rank = !s ? '' : s.best ? `<span class="best">lowest of ${s.stores}</span>` : `<span class="dearer">+${usd(s.gap)} vs ${esc(s.cheapest.store)}</span>`;
  return `<p class="store fit"><i class="dot st-${storeSlug(d.store)}"></i><b>${esc(d.store)}</b>${rank}${d.terms ? `<span class="terms">${esc(d.terms)}</span>` : ''}</p>`;
}

export function dealCard(d, deals, saved, extra = '') {
  const isSaved = saved.has(d.id);
  const onPage = d.readAt === 'store page';
  return `<article class="card sig-${d.signal} ${extra}">
  <div class="card-top">${verdictBadge(d.signal)}<em class="off">−${percentOff(d)}%</em><span class="score" title="Deal score out of 99">${dealScore(d)}</span><button class="save-btn" data-save="${esc(d.id)}" aria-pressed="${isSaved}" aria-label="${isSaved ? 'Remove from' : 'Add to'} shortlist">${isSaved ? icons.starFill : icons.star}</button></div>
  <h3><a href="#/?deal=${encodeURIComponent(d.id)}" data-open="${esc(d.id)}">${esc(d.product)}</a></h3>
  <div class="prices"><strong>${usd(d.price)}</strong><s>${usd(d.was)}</s><a class="go" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">${d.signal === 'routine' ? 'See it' : 'Buy'}${icons.out}</a></div>
  ${storeLine(deals, d)}
  <p class="why fit">${esc(d.note)}</p>
  <p class="read fit ${onPage ? 'on-page' : ''}">${onPage ? icons.page : icons.clock}<b>${esc(readWhere(d))}</b> ${checkedAt(d.checked)} · ${trailText(d)}</p>
</article>`;
}
