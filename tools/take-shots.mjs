// Takes the site's screenshots with headless Chrome over the DevTools protocol (Node 22+, no packages).
// Start `node serve.ts --port 8093` first, then: node tools/take-shots.mjs
// Each shot in shots.json names a hash route, a viewport, optional saved deals and an optional element to scroll to
// (scrollTo, plus scrollBy pixels) once the page says it has rendered (window.__shotReady).

import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const shots = JSON.parse(readFileSync(join(root, 'shots.json'), 'utf8'));
const base = process.env.SHOT_BASE ?? 'http://localhost:8093/';
const chrome = process.env.CHROME ?? '/usr/bin/google-chrome';
const profile = mkdtempSync(join(tmpdir(), 'mh-shots-'));

const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=9333', `--user-data-dir=${profile}`, '--hide-scrollbars', '--no-first-run', '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch('http://127.0.0.1:9333/json')).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error('Chrome did not start');
}

const ws = new WebSocket(await target());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++seq;
  pending.set(id, (m) => (m.error ? reject(new Error(m.error.message)) : resolve(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;

await send('Page.enable');
await send('Runtime.enable');
for (const shot of shots) {
  const { width, height } = shot.viewport;
  const mobile = width < 600;
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: shot.scale ?? 1, mobile });
  await send('Page.navigate', { url: base });
  await sleep(500);
  await evaluate(`localStorage.setItem('markdown-hunter:shortlist', ${JSON.stringify(JSON.stringify(shot.saved ?? []))}); true`);
  await send('Page.navigate', { url: base + 'index.html?shot=' + shot.file + shot.path });
  for (let i = 0; i < 50 && !(await evaluate('window.__shotReady === true')); i++) await sleep(100);
  await sleep(300);
  if (shot.scrollTo) await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(shot.scrollTo)}); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + ${shot.scrollBy ?? 0}); return true; })()`);
  if (shot.type) await evaluate(`(() => { const q = document.getElementById('q'); q.focus(); q.value = ${JSON.stringify(shot.type)}; q.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
  await sleep(400);
  const ready = await evaluate('window.__shotReady === true');
  const y = await evaluate('window.scrollY'); // the clip is in page coordinates, so it starts where the window scrolled
  const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: shot.quality ?? 88, clip: { x: 0, y, width, height, scale: 1 }, captureBeyondViewport: false });
  writeFileSync(join(root, 'screenshots', shot.file), Buffer.from(data, 'base64'));
  console.log(`${shot.file}: ${width}x${height} ready=${ready} ${Math.round((data.length * 0.75) / 1024)} KiB`);
}
ws.close();
proc.kill();
