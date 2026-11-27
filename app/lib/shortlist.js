// The shopper's saved deals, kept in this browser only. Storage can be missing (private mode), so every access is
// guarded and the list simply starts empty.

const KEY = 'markdown-hunter:shortlist';

export function loadShortlist() {
  try {
    const ids = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

export function saveShortlist(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...ids]));
  } catch {
    /* storage unavailable: the list lasts for this visit */
  }
}
