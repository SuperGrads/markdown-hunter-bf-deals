// The finder's state lives in the URL hash (#/view?q=…&cat=…), so every filtered view is a link you can share.

export const DEFAULTS = { view: 'deals', q: '', cat: '', store: '', min: 0, sig: '', sort: 'score', deal: '', list: '' };

export function readHash(hash) {
  const [path, qs = ''] = hash.replace(/^#\/?/, '').split('?');
  const p = new URLSearchParams(qs);
  return {
    view: path === 'compare' ? 'compare' : 'deals',
    q: p.get('q') ?? '',
    cat: p.get('cat') ?? '',
    store: p.get('store') ?? '',
    min: Number(p.get('min')) || 0,
    sig: p.get('sig') ?? '',
    sort: p.get('sort') ?? 'score',
    deal: p.get('deal') ?? '',
    list: p.get('list') ?? '',
  };
}

export function writeHash(state) {
  const p = new URLSearchParams();
  for (const key of ['q', 'cat', 'store', 'min', 'sig', 'sort', 'deal', 'list']) {
    if (state[key] && state[key] !== DEFAULTS[key]) p.set(key, String(state[key]));
  }
  const qs = p.toString();
  return `#/${state.view === 'compare' ? 'compare' : ''}${qs ? '?' + qs : ''}`;
}
