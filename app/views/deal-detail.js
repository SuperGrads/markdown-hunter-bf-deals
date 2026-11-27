// The price-check panel for one deal (#/?deal=<id>): the verdict and its evidence, the discount worked out from the
// two prices, when and where the price was read, the shopper's terms, and the same product at every other store.

import { SIGNALS, dealScore, percentOff, savings, storesFor } from '../lib/deal-math.js';
import { checkedAt, esc, hostOf, usd } from '../lib/format.js';
import { icons, storeSlug, verdictBadge } from './deal-card.js';

function storeRows(deals, d) {
  const all = storesFor(deals, d);
  if (all.length < 2) return '';
  const max = Math.max(...all.map((o) => o.price));
  const row = (o) => `<li class="${o.id === d.id ? 'me' : ''}"><a class="vs-store" href="#/?deal=${encodeURIComponent(o.id)}" data-open="${esc(o.id)}"><i class="dot st-${storeSlug(o.store)}"></i>${esc(o.store)}</a><span class="vs-bar"><span style="width:${Math.round((o.price / max) * 100)}%"></span></span><b>${usd(o.price)}</b>${o.price === all[0].price ? '<em>Lowest</em>' : `<small>+${usd(Math.round((o.price - all[0].price) * 100) / 100)}</small>`}</li>`;
  return `<section class="panel-sec"><h4>${icons.scale}Same product at ${all.length} stores</h4><ul class="vs">${all.map(row).join('')}</ul></section>`;
}

export function dealDetail(d, deals, saved) {
  const isSaved = saved.has(d.id);
  const share = Math.max(4, Math.round((d.price / d.was) * 100));
  return `<div class="overlay" data-close>
<div class="panel sig-${d.signal}" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
  <button class="x" data-close aria-label="Close">${icons.close}</button>
  <p class="eyebrow">${esc(d.category)} · <i class="dot st-${storeSlug(d.store)}"></i>${esc(d.store)}</p>
  <h2 id="dlg-title">${esc(d.product)}</h2>
  <div class="panel-price"><strong>${usd(d.price)}</strong><s>${usd(d.was)}</s><em>−${percentOff(d)}%</em><span>you save ${usd(savings(d))}</span></div>
  <div class="bar" title="Sale price as a share of the usual price"><span style="width:${share}%"></span><i>Sale ${share}% of usual</i></div>
  <section class="panel-sec verdict">
    <h4>${icons.shield}Is it really a deal?</h4>
    <div class="verdict-row">${verdictBadge(d.signal)}<span class="score big">${dealScore(d)}<small>/99</small></span></div>
    <p class="evidence">${esc(d.evidence)}</p>
    <p class="muted">${esc(SIGNALS[d.signal].label)}: ${esc(SIGNALS[d.signal].blurb)}</p>
  </section>
  <section class="panel-sec">
    <h4>${icons.check}Price check</h4>
    <dl class="facts">
      <dt>Sale price</dt><dd><b>${usd(d.price)}</b> at ${esc(d.store)}</dd>
      <dt>Usual price</dt><dd>${usd(d.was)}, as the source states it</dd>
      <dt>The math</dt><dd>${usd(d.was)} − ${usd(d.price)} = ${usd(savings(d))} off (${percentOff(d)}%)</dd>
      <dt>Checked</dt><dd>${checkedAt(d.checked)}</dd>
      <dt>Source</dt><dd><a href="${esc(d.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(d.source)}</a>, “${esc(d.sourceTitle)}”</dd>
      <dt>Terms</dt><dd>${esc(d.terms || 'No code needed')}</dd>
      <dt>Store page</dt><dd>${esc(hostOf(d.url))}</dd>
    </dl>
  </section>
  ${storeRows(deals, d)}
  <div class="actions wide">
    <a class="go" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">Go to ${esc(d.store)}${icons.out}</a>
    <button class="save-btn ${isSaved ? 'on' : ''}" data-save="${esc(d.id)}" aria-pressed="${isSaved}">${isSaved ? icons.starFill + 'Saved' : icons.star + 'Save'}</button>
  </div>
</div></div>`;
}
