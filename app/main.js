// Markdown Hunter: boots the finder, keeps its state in the URL hash and re-renders on every change.
//
//   #/                       the deal grid (filters as ?q=&cat=&store=&min=&sig=&sort=)
//   #/?deal=<id>             the same, with one deal's price check open
//   #/compare                the same product across stores, and category / store breakdowns
//   …&list=1                 the shortlist drawer open
//
// window.__shotReady turns true once a render is on screen, for the screenshot script.

import { deals } from './data/deals.js';
import { filterDeals } from './lib/filter-deals.js';
import { readHash, writeHash } from './lib/query.js';
import { loadShortlist, saveShortlist } from './lib/shortlist.js';
import { dealCard } from './views/deal-card.js';
import { filterBar, resultLine } from './views/filter-bar.js';
import { summaryHeader } from './views/summary-header.js';

const top = document.getElementById('top');
const controls = document.getElementById('controls');
const main = document.getElementById('main');
const layer = document.getElementById('layer');
const saved = loadShortlist();
let state = readHash(location.hash);

// Views a first visit does not need are fetched on first use, keeping the first load to the grid alone.
const later = {
  compare: () => import('./views/compare-view.js'),
  detail: () => import('./views/deal-detail.js'),
  drawer: () => import('./views/shortlist-drawer.js'),
};

const go = (patch) => {
  location.hash = writeHash({ ...state, ...patch });
};

function renderGrid() {
  const shown = filterDeals(deals, state);
  main.innerHTML = `${resultLine(shown.length, deals.length, state)}${
    shown.length
      ? `<div class="grid">${shown.map((d) => dealCard(d, deals, saved)).join('')}</div>`
      : '<div class="none"><h3>No deal matches</h3><p>Try a lower minimum discount or another store.</p><a href="#/" data-clear>Show every deal</a></div>'
  }`;
}

// Re-draw the controls without losing the shopper's place in the search box.
function renderControls() {
  const box = document.activeElement?.id === 'q' ? document.activeElement : null;
  const caret = box ? [box.selectionStart, box.selectionEnd] : null;
  controls.innerHTML = filterBar(deals, state);
  if (caret) {
    const q = document.getElementById('q');
    q.focus();
    q.setSelectionRange(...caret);
  }
}

let renders = 0;
async function render() {
  const ticket = ++renders;
  window.__shotReady = false;
  const open = deals.find((d) => d.id === state.deal);
  const [compare, detail, drawer] = await Promise.all([
    state.view === 'compare' ? later.compare() : null,
    open ? later.detail() : null,
    !open && state.list ? later.drawer() : null,
  ]);
  if (ticket !== renders) return; // a newer render has started
  top.innerHTML = summaryHeader(deals, state, saved.size);
  if (compare) {
    controls.hidden = true;
    main.innerHTML = compare.compareView(deals);
  } else {
    controls.hidden = false;
    renderControls();
    renderGrid();
  }
  layer.innerHTML = detail ? detail.dealDetail(open, deals, saved) : drawer ? drawer.shortlistDrawer(deals, saved) : '';
  document.body.classList.toggle('locked', Boolean(layer.innerHTML));
  document.title = open ? `${open.product} at ${open.store} | Markdown Hunter` : 'Markdown Hunter · verified Black Friday deals';
  window.__shotReady = true;
}

function toggleSave(id) {
  saved.has(id) ? saved.delete(id) : saved.add(id);
  saveShortlist(saved);
  render();
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-set],[data-save],[data-open],[data-close],[data-list],[data-clear]');
  if (!t) return;
  if (t.classList.contains('overlay') && e.target !== t) return;
  if (t.dataset.set) go({ [t.dataset.set]: t.dataset.set === 'min' ? Number(t.dataset.value) : state[t.dataset.set] === t.dataset.value ? '' : t.dataset.value });
  else if (t.dataset.save) toggleSave(t.dataset.save);
  else if (t.dataset.open) { e.preventDefault(); go({ deal: t.dataset.open, list: '' }); }
  else if (t.dataset.close !== undefined) go({ deal: '' });
  else if (t.dataset.list) go({ list: t.dataset.list === 'toggle' && !state.list ? '1' : '', deal: '' });
  else if (t.dataset.clear !== undefined) { e.preventDefault(); go({ q: '', cat: '', store: '', min: 0, sig: '' }); }
});

controls.addEventListener('input', (e) => {
  if (e.target.id !== 'q') return;
  history.replaceState(null, '', writeHash({ ...state, q: e.target.value }));
  state = readHash(location.hash);
  render();
});
controls.addEventListener('change', (e) => {
  if (e.target.dataset.field) go({ [e.target.dataset.field]: e.target.value });
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && (state.deal || state.list)) go({ deal: '', list: '' });
  if (e.key === '/' && document.activeElement?.id !== 'q' && state.view === 'deals') { e.preventDefault(); document.getElementById('q')?.focus(); }
});
window.addEventListener('hashchange', () => {
  const before = state;
  state = readHash(location.hash);
  render();
  if (before.view !== state.view) window.scrollTo(0, 0);
});

render();
