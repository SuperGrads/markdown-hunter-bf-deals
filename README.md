# markdown-hunter-bf-deals

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/SuperGrads/markdown-hunter-bf-deals/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/SuperGrads/markdown-hunter-bf-deals/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

**Markdown Hunter** is a Black Friday and Cyber Monday 2026 deal finder. It's a static site with no build step and no network requests.

- **57 deals, all checked on 27 Nov 2026** across Amazon, Walmart, Target, Best Buy, Costco and Dick's Sporting Goods. Every deal has its sale price, usual price, discount, store link, check time (UTC) and the source where the price was read.
- **A verdict on every deal:** *All-Time Low*, *Strong Deal*, *Fair Price* or *Routine / Inflated*, with the evidence behind it (for example, a "was" price that oversells the discount, or a cut of one cent).
- **Search, filters and sorting:** search plus filters for category, store, minimum discount and verdict, each showing a live count. Sort by deal score, % off, dollars saved or lowest price.
- **Price check panel** for each deal, a **Compare stores** view for products sold at several stores, category and store breakdowns, and a **shortlist** drawer.
- All filter state lives in the URL hash, so every view is a shareable link. The layout works from 360 px phones to desktop.

The deal data is in `app/data/deals.js`. Views are in `app/views/` and logic is in `app/lib/`. The compare, detail and shortlist views load on first use with `import()`.

## Run it

```sh
node serve.ts                                   # http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # hand-in: app/, screenshots/, dossier.json
node serve.ts --port 8093 & node tools/take-shots.mjs # re-take the screenshots (headless Chrome)
```

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
