// Inline SVG icons (no icon font, no network): each is a 24-unit stroke drawing coloured by currentColor.

const svg = (body, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const icons = {
  tag: svg('<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  check: svg('<path d="M20 6 9 17l-5-5"/>'),
  shield: svg('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
  out: svg('<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'),
  star: svg('<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>'),
  starFill: svg('<path fill="currentColor" d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>'),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  trophy: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'),
  bars: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  store: svg('<path d="M4 9h16l-1-5H5z"/><path d="M5 9v11h14V9"/><path d="M10 20v-6h4v6"/>'),
  alert: svg('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>'),
};

export const signalIcon = { low: icons.trophy, strong: icons.check, fair: icons.tag, routine: icons.alert };
