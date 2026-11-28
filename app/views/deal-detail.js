// The price-check panel for one deal (#/?deal=<id>): the verdict and its evidence, the discount worked out from the
// two prices, every read of the price we made (27 Nov to today), when and where the last one was (store page or a
// named deals source, with that source's update time), the shopper's terms, and the same product at every other
// store. On a wide screen it is docked beside the list; on a phone it opens as a sheet over it.

import { SIGNALS, dealScore, percentOff, savings, storesFor } from '../lib/deal-math.js';
import { checkedAt, esc, usd } from '../lib/format.js';
import { icons, storeSlug, verdictBadge } from './deal-card.js';
import { addStyles, viewIcons } from './view-styles.js';

const hostOf = (url) => new URL(url).hostname.replace(/^www\./, '');

// What each verdict means, in full; the cards show only its name.
const BLURBS = {
  low: 'NBC Select tracks it as the lowest price ever (it checks prices against CamelCamelCamel history), or it matches that record at another store.',
  strong: 'A deep cut (about 30%+) or a source\'s "lowest in 3+ months", with no record claim.',
  fair: 'A modest cut, a little above another store, or a "was" price padded above what other stores list.',
  routine: 'Another store sells the same thing for much less, or the price only repeats an earlier sale.',
};

function storeRows(deals, d) {
  const all = storesFor(deals, d);
  if (all.length < 2) return '';
  const max = Math.max(...all.map((o) => o.price));
  const row = (o) => `<li class="${o.id === d.id ? 'me' : ''}"><a class="vs-store" href="#/?deal=${encodeURIComponent(o.id)}" data-open="${esc(o.id)}"><i class="dot st-${storeSlug(o.store)}"></i>${esc(o.store)}</a><span class="vs-bar"><span style="width:${Math.round((o.price / max) * 100)}%"></span></span><b>${usd(o.price)}</b>${o.price === all[0].price ? '<em>Lowest</em>' : `<small>+${usd(Math.round((o.price - all[0].price) * 100) / 100)}</small>`}</li>`;
  return `<section class="panel-sec"><h4>${icons.scale}Same product at ${all.length} stores</h4><ul class="vs">${all.map(row).join('')}</ul></section>`;
}

function provenance(d) {
  if (d.readAt === 'store page') {
    return `<dt>Read at</dt><dd><b>${esc(d.store)}'s product page</b> (${esc(hostOf(d.url))}), page loaded and price read by our agent</dd>
      <dt>Also listed</dt><dd><a href="${esc(d.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(d.source)}</a>, updated ${checkedAt(d.sourceUpdated)}</dd>`;
  }
  return `<dt>Read at</dt><dd><a href="${esc(d.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(d.source)}</a>, “${esc(d.sourceTitle)}”, updated ${checkedAt(d.sourceUpdated)}; it names ${esc(d.store)} and links to this product</dd>`;
}

export function dealDetail(d, deals, saved, docked) {
  addStyles('vs', 'panel');
  const isSaved = saved.has(d.id);
  const share = Math.max(4, Math.round((d.price / d.was) * 100));
  const panel = `<div class="panel sig-${d.signal} ${docked ? 'docked' : ''}" role="dialog" aria-labelledby="dlg-title">
  <button class="x" data-close aria-label="Close">${viewIcons.close}</button>
  <p class="eyebrow">${viewIcons.shield}Price check · ${esc(d.category)} · <i class="dot st-${storeSlug(d.store)}"></i>${esc(d.store)}</p>
  <h2 id="dlg-title">${esc(d.product)}</h2>
  <div class="panel-price"><strong>${usd(d.price)}</strong><s>${usd(d.was)}</s><em>−${percentOff(d)}%</em><span>save ${usd(savings(d))}</span></div>
  <div class="bar" title="Sale price as a share of the usual price"><span style="width:${share}%"></span><i>Sale is ${share}% of the usual price</i></div>
  <section class="panel-sec verdict">
    <h4>Is it really a deal?</h4>
    <div class="verdict-row">${verdictBadge(d.signal)}<span class="score big">${dealScore(d)}<small>/99</small></span></div>
    <p class="evidence">${esc(d.evidence)}</p>
    <p class="muted">${esc(SIGNALS[d.signal].label)}: ${esc(BLURBS[d.signal])}</p>
  </section>
  <section class="panel-sec">
    <h4>${icons.check}How we checked</h4>
    <dl class="facts">
      <dt>The math</dt><dd>${usd(d.was)} − ${usd(d.price)} = <b>${usd(savings(d))}</b> off (${percentOff(d)}%)</dd>
      <dt>Checked</dt><dd><b>${checkedAt(d.checked)}</b></dd>
      <dt>Our reads</dt><dd>${d.reads.map((r) => `${checkedAt(r.at)} <b>${usd(r.price)}</b>`).join(' → ')}</dd>
      ${provenance(d)}
      <dt>Terms</dt><dd>${esc(d.terms || 'No code or membership needed')}</dd>
    </dl>
  </section>
  ${storeRows(deals, d)}
  <div class="actions wide">
    <a class="go" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">Go to ${esc(d.store)}${icons.out}</a>
    <button class="save-btn ${isSaved ? 'on' : ''}" data-save="${esc(d.id)}" aria-pressed="${isSaved}">${isSaved ? icons.starFill + 'Saved' : icons.star + 'Save'}</button>
  </div>
</div>`;
  return docked ? panel : `<div class="overlay" data-close>${panel}</div>`;
}
