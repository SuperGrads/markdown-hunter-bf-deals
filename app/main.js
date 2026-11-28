// Markdown Hunter: boots the finder, keeps every view in the URL hash (#/?q=&cat=&store=&min=&sig=&sort=&deal=,
// #/compare, &list=1) and re-renders on each change. Deal data and secondary views arrive by import().

import { filterDeals } from './lib/filter-deals.js';
import { boardHeader, filterBar, isHome, resultLine, skipBanner, spreadRow } from './views/board.js';
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
const wide = matchMedia('(min-width: 900px)');

const later = {
  data: () => import('./data/deals.js'),
  stats: () => import('./lib/board-stats.js'),
  shortlist: () => import('./lib/shortlist-store.js'),
  compare: () => import('./views/compare-view.js'),
  detail: () => import('./views/deal-detail.js'),
  drawer: () => import('./views/shortlist-drawer.js'),
};

let deals = [];
let facts = null;
let spreads = [];
let store = null;
let saved = new Set();
let state = readHash(location.hash);

const go = (patch) => {
  location.hash = writeHash({ ...state, ...patch });
};

function renderBoard(open, detail) {
  const shown = filterDeals(deals, state);
  const home = isHome(state);
  const docked = open && detail && wide.matches;
  const cards = shown.map((d) => dealCard(d, deals, saved, d.id === state.deal ? 'is-open' : ''));
  // On the unfiltered board the Skip banner sits after the first three rows, so the top rows are the best deals.
  if (home) cards.splice(9, 0, skipBanner(facts));
  const grid = shown.length
    ? `<div class="grid">${cards.join('')}</div>`
    : '<div class="none"><h3>No deal matches</h3><p>Try fewer filters or a shorter search.</p><a href="#/" data-clear>Show every deal</a></div>';
  main.innerHTML = (home ? (docked ? '' : spreadRow(spreads)) : resultLine(shown.length, deals.length, state))
    + `<div class="board ${docked ? 'with-side' : ''}"><div class="list">${grid}</div>${docked ? `<div class="side-col">${detail.dealDetail(open, deals, saved, true)}</div>` : ''}</div>`;
  return docked;
}

function renderControls() {
  const box = document.activeElement?.id === 'q' ? document.activeElement : null;
  const caret = box ? [box.selectionStart, box.selectionEnd] : null;
  controls.innerHTML = filterBar(deals, state);
  // On a phone the category chips scroll sideways: start the row at the chip before the chosen one.
  const lead = controls.querySelector('.chip.on')?.previousElementSibling;
  if (lead) lead.parentElement.scrollLeft = lead.offsetLeft - lead.parentElement.offsetLeft;
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
  if (ticket !== renders) return;
  top.innerHTML = boardHeader(facts, state, saved.size);
  controls.hidden = Boolean(compare);
  let docked = false;
  if (compare) main.innerHTML = compare.compareView(deals, saved);
  else {
    renderControls();
    docked = renderBoard(open, detail);
  }
  layer.innerHTML = detail && !docked ? detail.dealDetail(open, deals, saved, false) : drawer ? drawer.shortlistDrawer(deals, saved) : '';
  document.body.classList.toggle('locked', Boolean(layer.innerHTML));
  document.title = open ? `${open.product} at ${open.store} · Markdown Hunter` : 'Markdown Hunter · re-checked Black Friday deals';
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
wide.addEventListener('change', () => state.deal && render());

const [data, stats, shortlist] = await Promise.all([later.data(), later.stats(), later.shortlist()]);
deals = data.deals;
stats.rankDeals(deals);
facts = stats.boardFacts(deals);
spreads = stats.priceSpreads(deals).slice(0, 3);
store = shortlist;
saved = shortlist.loadShortlist();
render();
