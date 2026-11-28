// Styles and icons for the views that load later by import() (compare stores, the price-check panel, the shortlist
// drawer). Each view adds its sheet once, on first use, so the first load carries only the board's own stylesheet.

import { svg } from './deal-card.js';

export const viewIcons = {
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  shield: svg('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
  store: svg('<path d="M4 9h16l-1-5H5z"/><path d="M5 9v11h14V9"/><path d="M10 20v-6h4v6"/>'),
};

const SHEETS = {
  vs: `
.vs { list-style: none; margin: 0; padding: 0; display: grid; gap: 5px; }
.vs li { display: grid; grid-template-columns: 108px minmax(24px, 1fr) 82px 58px 84px; align-items: center; gap: 6px; font-size: 14px; }
.vs-store { text-decoration: none; font-weight: 750; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vs-store .dot { margin-right: 5px; vertical-align: 0; }
.vs-bar { height: 9px; background: #efebe2; border-radius: 9px; overflow: hidden; }
.vs-bar span { display: block; height: 100%; background: #b9bdc6; border-radius: 9px; }
.vs li:first-child .vs-bar span { background: var(--green); }
.vs b { text-align: right; font-size: 15.5px; }
.vs em { font-style: normal; color: #fff; background: var(--green); border-radius: 6px; padding: 1px 6px; font-weight: 800; font-size: 12.5px; text-align: center; }
.vs small { color: var(--red); font-weight: 750; text-align: center; }
.vs .badge { font-size: 12.5px; padding: 2px 7px 2px 6px; justify-content: center; }
.panel .vs li { grid-template-columns: 118px minmax(24px, 1fr) 84px 60px; }
.vs li.me { outline: 2px solid var(--gold); outline-offset: 2px; border-radius: 6px; }
.totals { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; }
.totals div { background: var(--paper); border-radius: 10px; padding: 7px 10px; }
.totals span { display: block; font-size: 12px; color: var(--ink-3); font-weight: 700; text-transform: uppercase; }
.totals b { font-size: 21px; }
.green { color: var(--green); }
@media (max-width: 760px) { .vs li { grid-template-columns: 92px 1fr 74px 54px; } .vs .badge { display: none; } }`,

  compare: `
.compare .intro h2 { display: flex; align-items: center; gap: 8px; margin: 16px 0 2px; font-size: 24px; letter-spacing: -0.02em; }
.compare .intro p { margin: 0 0 12px; color: var(--ink-2); font-size: 15.5px; }
.compare-cols { display: grid; grid-template-columns: 1fr 268px; gap: 12px; align-items: start; }
.matches { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 12px; }
.match, .side-card, .table-card { background: #fff; border-radius: var(--r); padding: 11px 13px; box-shadow: var(--shadow); }
.match header h3 { margin: 0; font-size: 16px; }
.match header p { margin: 1px 0 6px; font-size: 14px; color: var(--green); font-weight: 650; }
.side { display: grid; gap: 12px; position: sticky; top: 12px; }
.side-card h3, .table-card h3 { display: flex; align-items: center; gap: 7px; margin: 0 0 8px; font-size: 15.5px; }
.mini-picks { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.mini-picks li { display: flex; justify-content: space-between; gap: 8px; font-size: 13.5px; font-weight: 600; }
.mini-picks small { display: block; color: var(--ink-3); font-weight: 500; }
.wins { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; font-size: 14px; font-weight: 650; }
.wins li { display: flex; align-items: center; gap: 6px; }
.wins b { margin-left: auto; }
.side-card .go { width: 100%; justify-content: center; padding: 8px; }
.table-card { margin-top: 14px; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th { text-align: left; font-size: 12px; text-transform: uppercase; color: var(--ink-3); padding: 6px 8px; border-bottom: 1px solid var(--line); }
td { padding: 7px 8px; border-bottom: 1px solid #f0ece3; }
@media (max-width: 760px) { .compare-cols, .matches { grid-template-columns: 1fr; } .side { position: static; } }`,

  panel: `
.overlay { position: fixed; inset: 0; background: rgb(14 15 19 / 55%); display: flex; justify-content: center; align-items: flex-start; padding: 24px 12px; overflow-y: auto; z-index: 10; }
.overlay.side { justify-content: flex-end; padding: 0; }
.panel { position: relative; width: min(620px, 100%); background: #fff; border-radius: 16px; padding: 14px 16px; border-top: 6px solid var(--strong); box-shadow: var(--shadow); }
.panel.docked { width: auto; max-height: calc(100vh - 20px); overflow-y: auto; }
.panel.docked .bar, .panel.docked .muted { display: none; }
.panel.sig-low { border-top-color: var(--low); } .panel.sig-fair { border-top-color: #e0a526; } .panel.sig-routine { border-top-color: var(--routine); }
.x { position: absolute; top: 10px; right: 10px; border: 0; background: var(--paper); border-radius: 50%; width: 32px; height: 32px; display: grid; place-items: center; font-size: 16px; }
.eyebrow { display: flex; align-items: center; gap: 5px; margin: 0; font-size: 13.5px; color: var(--ink-3); font-weight: 750; }
.panel h2 { margin: 3px 36px 6px 0; font-size: 19px; line-height: 1.2; letter-spacing: -0.02em; }
.panel-price { display: flex; align-items: baseline; gap: 9px; flex-wrap: wrap; }
.panel-price strong { font-size: 32px; font-weight: 900; letter-spacing: -0.03em; }
.panel-price s { color: var(--ink-3); font-size: 18px; }
.panel-price em { font-style: normal; background: var(--red); color: #fff; border-radius: 8px; padding: 1px 8px; font-weight: 900; font-size: 18px; }
.panel-price span { color: var(--green); font-weight: 850; font-size: 16px; }
.bar { position: relative; height: 20px; background: #efebe2; border-radius: 8px; overflow: hidden; margin: 6px 0 2px; }
.bar span { display: block; height: 100%; background: linear-gradient(90deg, var(--green), #34b27b); }
.bar i { position: absolute; left: 9px; top: 1px; font-style: normal; font-size: 12.5px; font-weight: 800; color: var(--ink); }
.panel-sec { border-top: 1px solid var(--line); padding-top: 7px; margin-top: 8px; }
.panel-sec h4 { display: flex; align-items: center; gap: 7px; margin: 0 0 6px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-3); }
.verdict-row { display: flex; align-items: center; gap: 10px; }
.score.big { margin-left: 0; display: inline-flex; align-items: baseline; justify-content: center; gap: 1px; min-width: 60px; height: 30px; padding-top: 4px; font-size: 18px; }
.score.big small { font-size: 11px; color: #c9cbd1; }
.evidence { margin: 6px 0 3px; font-size: 15px; font-weight: 650; }
.panel .muted { margin: 0; font-size: 13px; }
.facts { display: grid; grid-template-columns: 82px 1fr; gap: 3px 10px; margin: 0; font-size: 14px; }
.facts dt { color: var(--ink-3); font-weight: 750; }
.facts dd { margin: 0; }
.actions { display: flex; gap: 8px; margin-top: 10px; }
.actions .go { flex: 1; justify-content: center; padding: 9px; font-size: 15.5px; }
.actions .save-btn { padding: 0 12px; }
@media (max-width: 760px) { .facts { grid-template-columns: 78px 1fr; } }`,

  drawer: `
.drawer { width: min(400px, 100%); min-height: 100%; background: #fff; padding: 18px; }
.drawer header { display: flex; justify-content: space-between; align-items: center; }
.drawer h2 { display: flex; gap: 8px; align-items: center; margin: 0; font-size: 20px; }
.drawer .x { position: static; }
.picks { list-style: none; padding: 0; margin: 14px 0 0; display: grid; gap: 8px; }
.picks li { display: flex; justify-content: space-between; gap: 8px; border: 1px solid var(--line); border-radius: 12px; padding: 10px; }
.picks a { font-weight: 700; text-decoration: none; }
.picks p { margin: 3px 0 5px; font-size: 14px; }
.empty { color: var(--ink-3); margin-top: 18px; }`,
};

/** Adds the named sheets to the page once each. */
export function addStyles(...names) {
  for (const name of names) {
    if (document.getElementById(`css-${name}`)) continue;
    const style = document.createElement('style');
    style.id = `css-${name}`;
    style.textContent = SHEETS[name];
    document.head.append(style);
  }
}
