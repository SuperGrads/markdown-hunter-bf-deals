// One deal as a card in the grid: verdict, product, store, both prices, the discount, a price bar, the check time and
// source, and the two actions (go to the store, save to the shortlist).

import { SIGNALS, dealScore, percentOff, savings, sameProduct, bestInGroup } from '../lib/deal-math.js';
import { checkedAt, esc, usd } from '../lib/format.js';
import { icons, signalIcon } from './icons.js';

// "Android Authority" out of 'Android Authority, "Best Black Friday headphone deals" (26 Nov 2026)'.
export const sourceName = (d) => d.source.split(',')[0];

export function storeSlug(store) {
  return store.toLowerCase().replace(/[^a-z]+/g, '');
}

export function verdictBadge(signal) {
  return `<span class="badge sig-${signal}">${signalIcon[signal]}${SIGNALS[signal].label}</span>`;
}

export function priceBar(d) {
  const share = Math.max(4, Math.round((d.price / d.was) * 100));
  return `<div class="bar" title="Sale price as a share of the usual price"><span style="width:${share}%"></span></div>`;
}

function otherStores(deals, d) {
  const others = sameProduct(deals, d);
  if (!others.length) return '';
  const best = bestInGroup(deals, d);
  const first = others[0];
  return ` <span class="also ${best ? 'is-best' : ''}">· ${best ? 'lowest of ' + (others.length + 1) + ' stores' : 'cheaper at ' + esc(first.store) + ' ' + usd(first.price)}</span>`;
}

export function dealCard(d, deals, saved) {
  const isSaved = saved.has(d.id);
  return `<article class="card sig-${d.signal}">
  <div class="card-top">${verdictBadge(d.signal)}<span class="score" title="Deal score: discount, signal and dollars saved">${dealScore(d)}</span></div>
  <h3><a href="#/?deal=${encodeURIComponent(d.id)}" data-open="${esc(d.id)}">${esc(d.product)}</a></h3>
  <p class="where"><i class="dot st-${storeSlug(d.store)}"></i>${esc(d.store)}<span>· ${esc(d.category)}</span></p>
  <div class="prices"><strong>${usd(d.price)}</strong><s>${usd(d.was)}</s><em>−${percentOff(d)}%</em></div>
  ${priceBar(d)}
  <p class="save">Save ${usd(savings(d))}${otherStores(deals, d)}</p>
  <p class="checked">${icons.clock}Checked ${checkedAt(d.checked)}</p>
  <p class="via">${icons.check}Price read in ${esc(sourceName(d))}</p>
  <div class="actions">
    <a class="go" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">${d.kind === 'search' ? 'Find at' : 'Buy at'} ${esc(d.store)}${icons.out}</a>
    <button class="save-btn ${isSaved ? 'on' : ''}" data-save="${esc(d.id)}" aria-pressed="${isSaved}" aria-label="${isSaved ? 'Remove from' : 'Add to'} shortlist">${isSaved ? icons.starFill : icons.star}</button>
  </div>
</article>`;
}
