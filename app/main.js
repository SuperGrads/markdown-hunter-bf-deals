// Markdown Hunter: boots the finder, keeps every view in the URL hash and re-renders on each change.
//
//   #/                  the deal grid (filters as ?q=&cat=&store=&min=&sig=&sort=)
//   #/?deal=<id>        the same, with that deal's price check open
//   #/compare           the same product side by side across stores
//   …&list=1            the shortlist drawer open
//
// The deal data and every secondary view arrive by import(), so the first load is the page frame alone.
// window.__shotReady turns true once a render is on screen, for the screenshot script.

import { filterDeals } from './lib/filter-deals.js';
import { boardHeader, filterBar, resultLine } from './views/board.js';
import { dealCard } from './views/deal-card.js';

const DEFAULTS = { view: 'deals', q: '', cat: '', store: '', min: 0, sig: '', sort: 'score', deal: '', list: '' };
const PARAMS = ['q', 'cat', 'store', 'min', 'sig', 'sort', 'deal', 'list'];

export function readHash(hash) {
  const [path, qs = ''] = hash.replace(/^#\/?/, '').split('?');
  const p = new URLSearchParams(qs);
  const s = { ...DEFAULTS, view: path === 'compare' ? 'compare' : 'deals' };
  for (const key of PARAMS) if (p.has(key)) s[key] = key === 'min' ? Number(p.get(key)) || 0 : p.get(key);
  return s;
}

export function writeHash(s) {
  const p = new URLSearchParams();
  for (const key of PARAMS) if (s[key] && s[key] !== DEFAULTS[key]) p.set(key, String(s[key]));
  const qs = p.toString();
  return `#/${s.view === 'compare' ? 'compare' : ''}${qs ? '?' + qs : ''}`;
}

const $ = (id) => document.getElementById(id);
const [top, controls, main, layer] = ['top', 'controls', 'main', 'layer'].map($);

const later = {
  data: () => import('./data/deals.js'),
  shortlist: () => import('./lib/shortlist-store.js'),
  compare: () => import('./views/compare-view.js'),
  detail: () => import('./views/deal-detail.js'),
  drawer: () => import('./views/shortlist-drawer.js'),
};

let deals = [];
let store = null;
let saved = new Set();
let state = readHash(location.hash);

const go = (patch) => {
  location.hash = writeHash({ ...state, ...patch });
};

function renderGrid() {
  const shown = filterDeals(deals, state);
  main.innerHTML = resultLine(shown.length, deals.length, state) + (shown.length
    ? `<div class="grid">${shown.map((d) => dealCard(d, deals, saved)).join('')}</div>`
    : '<div class="none"><h3>No deal matches</h3><p>Try a lower minimum discount, another store or a shorter search.</p><a href="#/" data-clear>Show every deal</a></div>');
}

// Re-draw the controls without losing the shopper's place in the search box.
function renderControls() {
  const box = document.activeElement?.id === 'q' ? document.activeElement : null;
  const caret = box ? [box.selectionStart, box.selectionEnd] : null;
  controls.innerHTML = filterBar(deals, state);
  if (caret) {
    $('q').focus();
    $('q').setSelectionRange(...caret);
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
  top.innerHTML = boardHeader(deals, state, saved.size);
  controls.hidden = Boolean(compare);
  if (compare) main.innerHTML = compare.compareView(deals, saved);
  else {
    renderControls();
    renderGrid();
  }
  layer.innerHTML = detail ? detail.dealDetail(open, deals, saved) : drawer ? drawer.shortlistDrawer(deals, saved) : '';
  document.body.classList.toggle('locked', Boolean(layer.innerHTML));
  document.title = open ? `${open.product} at ${open.store} · Markdown Hunter` : 'Markdown Hunter · checked Black Friday deals';
  window.__shotReady = true;
}

function toggleSave(id) {
  saved.has(id) ? saved.delete(id) : saved.add(id);
  store.saveShortlist(saved);
  render();
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-set],[data-save],[data-open],[data-close],[data-list],[data-clear]');
  if (!t) return;
  if (t.classList.contains('overlay') && e.target !== t) return; // a click inside the panel, not on the backdrop
  const { set, value, save, open, list } = t.dataset;
  if (set) go({ [set]: set === 'min' ? Number(value) : state[set] === value ? '' : value });
  else if (save) toggleSave(save);
  else if (open) { e.preventDefault(); go({ deal: open, list: '' }); }
  else if (t.dataset.close !== undefined) go({ deal: '' });
  else if (list) go({ list: list === 'toggle' && !state.list ? '1' : '', deal: '' });
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
  if (e.key === '/' && document.activeElement?.id !== 'q' && state.view === 'deals') { e.preventDefault(); $('q')?.focus(); }
});
window.addEventListener('hashchange', () => {
  const before = state;
  state = readHash(location.hash);
  render();
  if (before.view !== state.view) window.scrollTo(0, 0);
});

const [data, shortlist] = await Promise.all([later.data(), later.shortlist()]);
deals = data.deals;
store = shortlist;
saved = shortlist.loadShortlist();
render();
