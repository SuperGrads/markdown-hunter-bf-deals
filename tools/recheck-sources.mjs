// Re-reads every deal in the saved deals-source pages: for each deal, finds its product link (ASIN, Target A-number,
// Walmart item id, Best Buy SKU or the page path) in the source text and looks for its sale and usual price in the
// block that follows the link. Writes one JSON line per deal: { id, key, found, src, near, flags }.
//
//   node tools/recheck-sources.mjs <dir with <sourceKey>.html files> out.jsonl
//
// "found: both" means the source still states this store, link and both prices; "sale" only the sale price;
// "link" the link with other prices (the price moved: `near` shows what the source says now); "none" no trace.
// `flags` lists every "Lowest price ever / in 2026 / in three months" flag a source puts beside that link.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deals } from '../app/data/deals.js';

const [dir, outFile] = process.argv.slice(2);

/** Page HTML to plain text, keeping each link's (decoded) target inline so a price can be tied to its link. */
function pageText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>/gi, (_, href) => ` [[${decodeURIComponent(href.replace(/&amp;/g, '&'))}]] `)
    .replace(/<[^>]+>/g, '\n')
    .replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n')
    .replace(/\$\s+(?=[0-9])/g, '$'); // "$" and its digits sit in separate elements on some pages
}

/** What identifies a product link at its store, whatever affiliate wrapper a source puts around it. */
function linkKey(url) {
  const u = new URL(url);
  const asin = u.pathname.match(/\/dp\/([A-Z0-9]{10})/);
  if (asin) return asin[1];
  const tgt = u.pathname.match(/\/A-(\d+)/);
  if (tgt) return `A-${tgt[1]}`;
  const wmt = u.hostname.includes('walmart') && u.pathname.match(/\/(\d{6,})$/);
  if (wmt) return wmt[1];
  const bby = u.pathname.match(/\/(?:sku\/)?([A-Z0-9]{8,10})(?:\/|$)/i) ?? u.pathname.match(/(\d{7})\.p/);
  if (u.hostname.includes('bestbuy') && bby) return bby[1];
  return u.pathname.replace(/\/$/, '').split('/').filter(Boolean).pop();
}

const money = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const moneyShort = (n) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
// A price as text ("$1,299.99", "$484") or as a source's own link parameter ("salePrice=269.95", "price=599.99").
const states = (block, n) => block.includes(money(n)) || new RegExp(`\\${moneyShort(n)}(?![0-9]|[.,][0-9])|[Pp]rice=${n}(?![0-9]|\\.[0-9])`).test(block);

const texts = Object.fromEntries(readdirSync(dir).filter((f) => f.endsWith('.html')).map((f) => [f.replace(/\.html$/, ''), pageText(readFileSync(join(dir, f), 'utf8'))]));
const order = (d) => [d.src, ...Object.keys(texts).filter((k) => k !== d.src)]; // its own source first

const lines = [];
for (const d of deals) {
  const key = linkKey(d.url);
  let best = { id: d.id, key, found: 'none' };
  const flags = new Set();
  for (const src of order(d)) {
    const text = texts[src];
    if (!text) continue;
    let at = text.indexOf(key);
    while (at >= 0) {
      // Other links in the block are cut to a marker so a long affiliate URL cannot push the prices out of reach.
      // The block is this link's own price parameters, then the text after it with other links cut to a marker, so
      // a long affiliate URL cannot push the prices out of reach.
      const rest = text.slice(at, at + 6000);
      const ownLink = rest.match(/^[^\]]*\]\]/)?.[0] ?? '';
      const params = (ownLink.match(/[Pp]rice=[0-9.]+/g) ?? []).join(' ');
      const block = `${params} ${rest.slice(ownLink.length).replace(/\[\[[^\]]*\]\]/g, '[L]').slice(0, 420)}`;
      const sale = states(block, d.price);
      const was = states(block, d.was);
      const found = sale && was ? 'both' : sale ? 'sale' : 'link';
      const rank = { none: 0, link: 1, sale: 2, both: 3 };
      // The source's own price-history flag for this product sits just above or below its link.
      // It is only read up to where the next product's card starts ("BETA", "Learn more"), and 60 characters back.
      const ownCard = block.split(/BETA|We can help you find|Learn more/)[0];
      const flag = (`${text.slice(Math.max(0, at - 60), at)} ${ownCard}`.match(/Lowest price\s+(ever|in [0-9a-z ]{2,12}?)(?=\s*(\n|\[|$))/i) ?? [])[0]?.replace(/\s+/g, ' ') ?? '';
      if (flag) flags.add(`${flag} (${src})`);
      if (rank[found] > rank[best.found]) best = { id: d.id, key, found, src, near: (block.match(/\$[0-9][0-9,]*(\.[0-9]{2})?/g) ?? []).slice(0, 4) };
      at = text.indexOf(key, at + key.length);
    }
  }
  lines.push(JSON.stringify({ ...best, flags: [...flags] }));
}
writeFileSync(outFile, lines.join('\n') + '\n');
const tally = {};
for (const l of lines) { const f = JSON.parse(l).found; tally[f] = (tally[f] ?? 0) + 1; }
console.log(tally);
