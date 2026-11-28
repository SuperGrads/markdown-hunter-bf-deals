// Audits the deal data before a hand-in and prints the numbers v3-vs-v2.md quotes (Node 22, no packages):
//   node tools/audit-deals.mjs
// Every deal must have a product, store, category, a product URL at an https store (no search or listing page), a
// sale and a usual price with the sale lower, a check time on 28 Nov 2026 (UTC), a readAt, a verdict and evidence.
// A store-page read must match the row's price. The site's text must not address an AI judge. Exits 1 on a failure.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { deals, SOURCES, STORE_PAGE_READS } from '../app/data/deals.js';
import { SIGNALS, percentOff, savings } from '../app/lib/deal-math.js';

const problems = [];
const fail = (d, why) => problems.push(`${d.id}: ${why}`);
const SEARCH = /\/s\?|\/search|[?&](k|q|query|searchTerm|st)=|\/sr\?|\/b\/|\/browse\/|\/c\/|\/collections\/all/i;

for (const d of deals) {
  for (const k of ['product', 'store', 'category', 'url', 'evidence', 'readAt', 'checked', 'source']) if (!d[k]) fail(d, `no ${k}`);
  if (!(d.price > 0 && d.was > d.price)) fail(d, `prices ${d.price} / ${d.was}`);
  const cents = (n) => Math.abs(Math.round(n * 100) - n * 100) < 1e-6;
  if (!cents(d.price) || !cents(d.was)) fail(d, 'price not whole cents');
  const off = percentOff(d);
  if (Math.abs((1 - d.price / d.was) * 100 - off) > 0.5) fail(d, `discount ${off}% does not match`);
  if (Math.abs(d.was - d.price - savings(d)) > 0.005) fail(d, 'savings do not add up');
  if (!/^https:\/\//.test(d.url)) fail(d, 'link is not https');
  if (SEARCH.test(d.url)) fail(d, `search or listing link ${d.url}`);
  if (!d.checked.startsWith('2026-11-28T')) fail(d, `checked ${d.checked}, not 28 Nov UTC`);
  if (!SIGNALS[d.signal]) fail(d, `unknown verdict ${d.signal}`);
  if (!SOURCES[d.src].updated.startsWith('2026-11-28T')) fail(d, 'source not updated on 28 Nov UTC');
  const page = STORE_PAGE_READS[d.id];
  if (page && Math.abs(page.price - d.price) > 0.001) fail(d, `store page showed ${page.price}, row says ${d.price}`);
  if (page && page.was && Math.abs(page.was - d.was) > 0.001) fail(d, `store page "was" ${page.was}, row says ${d.was}`);
}
for (const id of Object.keys(STORE_PAGE_READS)) if (!deals.some((d) => d.id === id)) problems.push(`STORE_PAGE_READS names no deal: ${id}`);
const ids = deals.map((d) => d.id);
for (const id of ids.filter((x, i) => ids.indexOf(x) !== i)) problems.push(`duplicate id ${id}`);

// Text addressed to an AI judge has no place in a deal finder: scan every text file of app/.
const JUDGE = /\b(judge|judging|grader|score this|pick (us|this entry)|vote for|as an ai|language model|llm|ai model)\b/i;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|js|css|json)$/.test(name)) readFileSync(p, 'utf8').split('\n').forEach((line, i) => JUDGE.test(line) && problems.push(`${p}:${i + 1} reads as addressed to a judge`));
  }
}
walk(new URL('../app', import.meta.url).pathname);

const count = (f) => deals.filter(f).length;
const groups = new Map();
for (const d of deals) groups.set(d.group, (groups.get(d.group) ?? 0) + 1);
const stats = {
  deals: deals.length,
  stores: new Set(deals.map((d) => d.store)).size,
  categories: new Set(deals.map((d) => d.category)).size,
  crossStoreProducts: [...groups.values()].filter((n) => n > 1).length,
  verdicts: Object.fromEntries(Object.keys(SIGNALS).map((k) => [k, count((d) => d.signal === k)])),
  readOnStorePage: count((d) => d.readAt === 'store page'),
  readInDatedSource: count((d) => d.readAt.startsWith('deals source')),
  checkedOn28Nov: count((d) => d.checked.startsWith('2026-11-28T')),
  amazonLinks: count((d) => /amazon\.com/.test(d.url)),
  firstCheck: deals.map((d) => d.checked).sort()[0],
  lastCheck: deals.map((d) => d.checked).sort().at(-1),
};
console.log(JSON.stringify(stats, null, 1));
if (problems.length) {
  console.error(`${problems.length} problem(s):\n` + problems.join('\n'));
  process.exit(1);
}
console.log('audit: every deal passes');
