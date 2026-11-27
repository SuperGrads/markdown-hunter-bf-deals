// The quick-view panel for one deal (#/?deal=<id>): the price check in full — prices, discount, verdict and its
// evidence, when and where the price was read, the same product at other stores, and the store link.

import { SIGNALS, dealScore, percentOff, savings, sameProduct } from '../lib/deal-math.js';
import { checkedAt, esc, hostOf, usd } from '../lib/format.js';
import { icons } from './icons.js';
import { priceBar, storeSlug, verdictBadge } from './deal-card.js';

function storeRows(deals, d) {
  const all = [d, ...sameProduct(deals, d)].sort((a, b) => a.price - b.price);
  if (all.length < 2) return '';
  const max = Math.max(...all.map((o) => o.price));
  return `<section class="panel-sec"><h4>${icons.store}Same product, ${all.length} stores</h4><ul class="vs">${all
    .map(
      (o, i) => `<li class="${o.id === d.id ? 'me' : ''}"><span class="vs-store"><i class="dot st-${storeSlug(o.store)}"></i>${esc(o.store)}</span><span class="vs-bar"><span style="width:${Math.round((o.price / max) * 100)}%"></span></span><b>${usd(o.price)}</b>${o.price === all[0].price ? '<em>Lowest</em>' : `<small>+${usd(o.price - all[0].price)}</small>`}</li>`,
    )
    .join('')}</ul></section>`;
}

export function dealDetail(d, deals, saved) {
  if (!d) return '';
  const isSaved = saved.has(d.id);
  return `<div class="overlay" data-close>
<div class="panel sig-${d.signal}" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
  <button class="x" data-close aria-label="Close">${icons.close}</button>
  <p class="eyebrow">${esc(d.category)} · <i class="dot st-${storeSlug(d.store)}"></i>${esc(d.store)}</p>
  <h2 id="dlg-title">${esc(d.product)}</h2>
  <div class="panel-price">
    <div><strong>${usd(d.price)}</strong><s>${usd(d.was)}</s></div>
    <div class="off-big">−${percentOff(d)}%<small>save ${usd(savings(d))}</small></div>
  </div>
  ${priceBar(d)}
  <section class="panel-sec verdict">
    <h4>${icons.shield}Is it really a deal?</h4>
    <div class="verdict-row">${verdictBadge(d.signal)}<span class="score big">${dealScore(d)}<small>/99</small></span></div>
    <p class="evidence">${esc(d.evidence)}</p>
    <p class="muted">${esc(SIGNALS[d.signal].blurb)}</p>
  </section>
  <section class="panel-sec">
    <h4>${icons.check}Price check</h4>
    <dl class="facts">
      <dt>Sale price</dt><dd>${usd(d.price)} at ${esc(d.store)}</dd>
      <dt>Usual price</dt><dd>${usd(d.was)}</dd>
      <dt>Checked</dt><dd>${checkedAt(d.checked)}</dd>
      <dt>Price read in</dt><dd><a href="${esc(d.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(d.source)}</a></dd>
      ${d.note ? `<dt>Condition</dt><dd>${esc(d.note)}</dd>` : ''}
      <dt>Store link</dt><dd>${esc(hostOf(d.url))}${d.kind === 'search' ? ' (store search: the source named this store\'s price, not its page)' : ''}</dd>
    </dl>
  </section>
  ${storeRows(deals, d)}
  <div class="actions wide">
    <a class="go" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">${d.kind === 'search' ? 'Find it at' : 'Go to'} ${esc(d.store)}${icons.out}</a>
    <button class="save-btn ${isSaved ? 'on' : ''}" data-save="${esc(d.id)}" aria-pressed="${isSaved}">${isSaved ? icons.starFill + 'Saved' : icons.star + 'Save'}</button>
  </div>
</div></div>`;
}
