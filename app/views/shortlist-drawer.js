// The shortlist drawer (#/?list=1): saved deals with their prices, what they add up to and what they save.

import { savings } from '../lib/deal-math.js';
import { esc, usd } from '../lib/format.js';
import { icons } from './icons.js';
import { storeSlug, verdictBadge } from './deal-card.js';

export function shortlistDrawer(deals, saved) {
  const picks = deals.filter((d) => saved.has(d.id));
  const total = picks.reduce((s, d) => s + d.price, 0);
  const saving = picks.reduce((s, d) => s + savings(d), 0);
  const body = picks.length
    ? `<ul class="picks">${picks
        .map(
          (d) => `<li><div><a href="#/?deal=${encodeURIComponent(d.id)}" data-open="${esc(d.id)}">${esc(d.product)}</a><p><i class="dot st-${storeSlug(d.store)}"></i>${esc(d.store)} · ${usd(d.price)} <s>${usd(d.was)}</s></p>${verdictBadge(d.signal)}</div><button class="x" data-save="${esc(d.id)}" aria-label="Remove">${icons.close}</button></li>`,
        )
        .join('')}</ul>
  <div class="totals"><div><span>${picks.length} items</span><b>${usd(Math.round(total * 100) / 100)}</b></div><div><span>You save</span><b class="green">${usd(Math.round(saving * 100) / 100)}</b></div></div>`
    : `<p class="empty">Tap ${icons.star} on any deal to keep it here while you compare.</p>`;
  return `<div class="overlay side" data-list="close"><aside class="drawer" role="dialog" aria-label="Shortlist">
  <header><h2>${icons.starFill}Your shortlist</h2><button class="x" data-list="close" aria-label="Close">${icons.close}</button></header>
  ${body}
</aside></div>`;
}
