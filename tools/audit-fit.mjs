// Checks what the screenshots rely on, in headless Chrome (Node 22+, no packages). Start `node serve.ts --port 8093`
// first, then: node tools/audit-fit.mjs
//
//  - every one-line text on a card or in the price-gap row (class "fit") fits its box at the cover's width and at a
//    phone's: no line is wider than the card it sits in, so nothing is ever cut;
//  - the cover viewport (shots.json, first shot) shows at least 9 whole cards, its first row only All-Time Low or
//    Strong Deal, and no card or banner cut by the bottom edge;
//  - the count tiles say what the deal data says, counted here again from app/data/deals.js.
// Exits 1 on a failure.

import { spawn } from 'node:child_process';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deals } from '../app/data/deals.js';

const root = new URL('..', import.meta.url).pathname;
const cover = JSON.parse(readFileSync(join(root, 'shots.json'), 'utf8'))[0].viewport;
const base = process.env.SHOT_BASE ?? 'http://localhost:8093/';
const PORT = 9335;
const proc = spawn('/usr/bin/google-chrome', ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'mh-fit-'))}`, '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {}
  if (!wsUrl) await sleep(200);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((resolve) => { const id = ++seq; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.result.value;

async function open(path, width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  await send('Page.navigate', { url: base + 'index.html?fit=' + Date.now() + path });
  await sleep(300);
  for (let i = 0; i < 50 && !(await evaluate('window.__shotReady === true')); i++) await sleep(100);
}

// Lines that are wider than their box, with the text and both widths.
const OVERFLOWS = `[...document.querySelectorAll('.fit')].filter((el) => el.scrollWidth > el.clientWidth + 1)
  .map((el) => el.textContent.trim() + ' (' + el.scrollWidth + ' > ' + el.clientWidth + 'px)')`;

const problems = [];
const report = {};
for (const [name, w, h] of [['cover', cover.width, cover.height], ['narrow', 420, 800], ['phone', 360, 800]]) {
  await open('#/', w, h);
  const over = await evaluate(OVERFLOWS);
  report[`${name} ${w}px: lines checked`] = await evaluate(`document.querySelectorAll('.fit').length`);
  over.forEach((o) => problems.push(`${name} ${w}px: cut line: ${o}`));
}

await open('#/', cover.width, cover.height);
const view = await evaluate(`(() => {
  const H = innerHeight;
  const boxes = [...document.querySelectorAll('.card, .skips')].map((el) => ({ el, r: el.getBoundingClientRect() }));
  const whole = boxes.filter((b) => b.el.matches('.card') && b.r.bottom <= H);
  const cut = boxes.filter((b) => b.r.top < H && b.r.bottom > H).map((b) => b.el.className);
  const firstTop = whole[0]?.r.top;
  const firstRow = whole.filter((b) => b.r.top === firstTop).map((b) => b.el.className.match(/sig-(\\w+)/)[1]);
  const tiles = [...document.querySelectorAll('.tile')].map((t) => t.textContent.replace(/\\s+/g, ' ').trim());
  return { whole: whole.length, cut, firstRow, tiles };
})()`);
report['cover: whole cards'] = view.whole;
report['cover: first row'] = view.firstRow.join(', ');
report['cover: tiles'] = view.tiles;
if (view.whole < 9) problems.push(`cover shows ${view.whole} whole cards, fewer than 9`);
if (view.cut.length) problems.push(`cover cuts at its bottom edge: ${view.cut.join(' | ')}`);
if (view.firstRow.some((s) => s !== 'low' && s !== 'strong')) problems.push(`cover's first row holds ${view.firstRow.join(', ')}`);

// The tiles, counted again from the data.
const count = (f) => deals.filter(f).length;
const expected = [
  `${deals.length} deals at ${new Set(deals.map((d) => d.store)).size} stores`,
  `${count((d) => d.signal === 'low')} at a record low`,
  `${count((d) => d.signal === 'fair' || d.signal === 'routine')}/${deals.length} only Fair or Skip`,
  `${count((d) => d.readAt === 'store page')} read on the store page`,
  `${count((d) => d.reads.length > 1 && d.reads.every((r) => r.price === d.price))} same price every read`,
];
const bare = (t) => t.replace(/\s+/g, '');
expected.forEach((text, i) => { if (bare(view.tiles[i]) !== bare(text)) problems.push(`tile ${i + 1} says "${view.tiles[i]}", the data says "${text}"`); });

ws.close();
proc.kill();
console.log(JSON.stringify(report, null, 1));
if (problems.length) {
  console.error(`${problems.length} problem(s):\n` + problems.join('\n'));
  process.exit(1);
}
console.log('fit: every line fits, the cover shows whole cards only, the tiles match the data');
