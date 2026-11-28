// Opens store product pages in plain headless Chrome and reads what each one shows today: the HTTP status of the
// page, where it ended up, its product name and the prices it states (current, list / "was"). It is the re-check
// behind each deal's `readAt: "store page"`. A page that refuses an automated visit is recorded as refused, never
// retried around: those deals are checked in a dated deals source instead. (Node 22+, no packages.)
//
//   node tools/read-store-pages.mjs urls.txt out.jsonl [--tabs 3]
//
// urls.txt holds one "<id> <url>" per line. Each result line is JSON: { id, url, status, finalUrl, title, name,
// prices, was, stock, notes, at }.

import { spawn } from 'node:child_process';
import { readFileSync, appendFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [listFile, outFile] = process.argv.slice(2);
const tabsAt = process.argv.indexOf('--tabs');
const TABS = tabsAt > 0 ? Number(process.argv[tabsAt + 1]) : 3;
const PORT = 9341;
const jobs = readFileSync(listFile, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
  const [id, url] = l.split(/\s+/);
  return { id, url };
});

const profile = mkdtempSync(join(tmpdir(), 'mh-check-'));
const chrome = spawn('/usr/bin/google-chrome', ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--lang=en-US', '--window-size=1366,900', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function devtools(path, method = 'GET') {
  for (let i = 0; i < 60; i++) {
    try { return await (await fetch(`http://127.0.0.1:${PORT}${path}`, { method })).json(); } catch { await sleep(250); }
  }
  throw new Error('Chrome did not answer');
}

/** One DevTools connection to one tab. */
async function openTab() {
  const t = await devtools('/json/new?about:blank', 'PUT');
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let seq = 0;
  const pending = new Map();
  const listeners = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    else if (m.method) listeners.forEach((fn) => fn(m));
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, (m) => (m.error ? reject(new Error(m.error.message)) : resolve(m.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
  await send('Page.enable');
  await send('Network.enable');
  return { send, on: (fn) => listeners.push(fn), close: () => ws.close() };
}

// Runs inside the page: product name and prices from JSON-LD, price meta tags and the big stores' own markup.
const READ_PAGE = `(() => {
  const txt = (sel) => document.querySelector(sel)?.textContent.replace(/\\s+/g, ' ').trim() || '';
  const money = (s) => (String(s).match(/\\$\\s?[0-9][0-9,]*(\\.[0-9]{2})?/g) || []).map((m) => m.replace(/[$,\\s]/g, ''));
  const out = { title: document.title, name: '', prices: [], was: [], stock: '', notes: [] };
  for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const walk = (n) => {
        if (!n || typeof n !== 'object') return;
        if (Array.isArray(n)) return n.forEach(walk);
        const type = [].concat(n['@type'] || []).join(',');
        if (/Product/.test(type) && n.name && !out.name) out.name = n.name;
        if (/Offer/.test(type)) {
          if (n.price) out.prices.push('ld:' + n.price + (n.priceCurrency ? ' ' + n.priceCurrency : ''));
          if (n.lowPrice) out.prices.push('ld-low:' + n.lowPrice);
          if (n.availability) out.stock = String(n.availability).split('/').pop();
        }
        Object.values(n).forEach(walk);
      };
      walk(JSON.parse(s.textContent));
    } catch {}
  }
  const host = location.hostname;
  if (/amazon\\./.test(host)) {
    out.name = txt('#productTitle') || out.name;
    const core = document.querySelector('#corePriceDisplay_desktop_feature_div, #corePrice_desktop, #corePrice_feature_div, #apex_desktop');
    if (core) {
      const pay = core.querySelector('.priceToPay .a-offscreen, .apexPriceToPay .a-offscreen, .a-price .a-offscreen');
      if (pay) out.prices.push('amz:' + pay.textContent.trim());
      const basis = core.querySelector('.basisPrice .a-offscreen, .a-text-price .a-offscreen');
      if (basis) out.was.push('amz:' + basis.textContent.trim() + ' ' + (core.querySelector('.basisPrice')?.textContent.match(/List Price|Typical price|Was Price/)?.[0] || ''));
      const pct = core.querySelector('.savingsPercentage');
      if (pct) out.notes.push('pct ' + pct.textContent.trim());
    }
    const avail = txt('#availability');
    if (avail) out.stock = avail.slice(0, 80);
    const badge = txt('#dealBadge_feature_div');
    if (badge) out.notes.push(badge.slice(0, 80));
  } else if (/bestbuy\\.com/.test(host)) {
    out.name = txt('h1') || out.name;
    const box = document.querySelector('[data-testid="large-customer-price"], .priceView-customer-price, [data-testid="customer-price"]');
    if (box) out.prices.push('bby:' + money(box.textContent)[0]);
    const was = document.querySelector('[data-testid="regular-price"], .pricing-price__regular-price');
    if (was) out.was.push('bby:' + was.textContent.replace(/\\s+/g, ' ').trim().slice(0, 60));
  } else if (/walmart\\.com/.test(host)) {
    out.name = txt('h1') || out.name;
    const now = txt('[itemprop="price"]');
    if (now) out.prices.push('wmt:' + now.slice(0, 40));
    const was = txt('[data-seo-id="strike-through-price"]');
    if (was) out.was.push('wmt:' + was.slice(0, 40));
  } else if (/target\\.com/.test(host)) {
    out.name = txt('h1') || out.name;
    const now = txt('[data-test="product-price"]') || txt('[data-test="@web/Price/PriceFull"]') || txt('[data-module-type="ProductDetailPrice"]');
    if (now) out.prices.push('tgt:' + now.slice(0, 40));
    const was = txt('[data-test="product-regular-price"]');
    if (was) out.was.push('tgt:' + was.slice(0, 60));
  } else {
    out.name = out.name || txt('h1');
  }
  const meta = document.querySelector('meta[property="product:price:amount"], meta[property="og:price:amount"], meta[itemprop="price"]');
  if (meta) out.prices.push('meta:' + meta.content);
  if (!out.prices.length) {
    let el = document.querySelector('h1')?.parentElement;
    for (let i = 0; el && i < 4 && !out.prices.length; i++, el = el.parentElement) {
      const found = money(el.innerText || '');
      if (found.length) out.prices.push('near:' + found.slice(0, 4).join('|'));
    }
  }
  const head = (document.body?.innerText || '').slice(0, 3000) + document.title;
  if (/Robot or human|captcha|Access Denied|are you a human|unusual traffic|Pardon Our Interruption/i.test(head)) out.notes.push('REFUSED');
  if (/out of stock|sold out|no longer available|currently unavailable/i.test((document.body?.innerText || '').slice(0, 20000))) out.notes.push('mentions-out-of-stock');
  return out;
})()`;

async function readOne(tab, job) {
  let status = 0;
  let finalUrl = job.url;
  tab.on((m) => {
    // The first document response is the page itself; later ones are its frames (ads, bot checks).
    if (!status && m.method === 'Network.responseReceived' && m.params.type === 'Document') { status = m.params.response.status; finalUrl = m.params.response.url; }
  });
  try {
    await Promise.race([tab.send('Page.navigate', { url: job.url }), sleep(30000)]);
    await sleep(Number(process.env.WAIT_MS) || (/target\.com|walmart|bestbuy|homedepot/.test(job.url) ? 8000 : 5000));
    const r = await tab.send('Runtime.evaluate', { expression: READ_PAGE, returnByValue: true });
    return { ...job, status, finalUrl, ...(r.result?.value ?? {}), at: new Date().toISOString() };
  } catch (e) {
    return { ...job, status, finalUrl, error: String(e.message), at: new Date().toISOString() };
  }
}

await devtools('/json/version');
const tabs = await Promise.all(Array.from({ length: TABS }, openTab));
// amazon.com shows prices in the visitor's local currency unless this display preference says USD.
await tabs[0].send('Network.setCookie', { name: 'i18n-prefs', value: 'USD', domain: '.amazon.com', path: '/' });

let next = 0;
await Promise.all(tabs.map(async (tab) => {
  while (next < jobs.length) {
    const job = jobs[next++];
    const res = await readOne(tab, job);
    appendFileSync(outFile, JSON.stringify(res) + '\n');
    console.error(`${res.id} ${res.status} ${(res.prices || []).join(' ')} | ${(res.was || []).join(' ')} | ${(res.name || res.title || '').slice(0, 60)} ${(res.notes || []).join(';')}`);
  }
}));
tabs.forEach((t) => t.close());
chrome.kill();
