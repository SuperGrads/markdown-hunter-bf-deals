// Text formatting shared by every view: escaping, money, times.

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function usd(n) {
  const cents = Math.round(n * 100) % 100 !== 0;
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 });
}

const pad = (n) => String(n).padStart(2, '0');

// "27 Nov, 06:22 UTC": fixed to UTC so every shopper reads the same check time.
export function checkedAt(iso) {
  const d = new Date(iso);
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()];
  return `${d.getUTCDate()} ${month}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

export const hostOf = (url) => new URL(url).hostname.replace(/^www\./, '');
