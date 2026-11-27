# markdown-hunter-bf-deals

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/SuperGrads/markdown-hunter-bf-deals/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/SuperGrads/markdown-hunter-bf-deals/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

**Markdown Hunter** is a Black Friday and Cyber Monday 2026 deal finder. It's a static site with no build step and no network requests.

- **123 deals at 27 stores, all checked on Black Friday, 27 Nov 2026.** Stores include Amazon, Best Buy, Walmart, Target, The Home Depot, Sony, Samsung, TCL, REI, Sephora, Ulta and more, across 10 categories, TVs among them. Each deal has its sale price, usual price, discount, a direct link to the product page, the time it was checked (UTC), and its source: a deals roundup published or updated that day.
- **A verdict on every deal:** *All-Time Low*, *Strong Deal*, *Fair Price* or *Routine · Skip*, each with the evidence behind it. Seven deals are flagged as ones to skip, for example an outlet "compare at" price, a repeat of an October sale, or a store charging $600 more than another for the same TV.
- **What you need to act on a deal:** any code or condition (such as `BF60`, a required membership, or a specific colour), and a "lowest of 3" or "$10 less at Amazon" chip on every product sold at more than one store.
- **Search, filters and sorting:** search plus filters for category, store, minimum discount and verdict, each with a live count. Sort by deal score, % off, dollars saved or lowest price.
- **Price-check panel** for every deal, showing the discount math, the source and its update time, and the same product at each store. A **Compare stores** view lines up 27 products across 2–3 stores, and a **shortlist** shows totals and savings.
- All state lives in the URL hash, so every view is a shareable link. The layout works from 360 px phones to desktop.

The first load is 8 small files: the page, one stylesheet, `main.js`, three `lib/` modules and two views. The deal data (`app/data/deals.js`) and the compare, price-check and shortlist views load with `import()`.

## Run it

```sh
node serve.ts                                   # http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # hand-in: app/, screenshots/, dossier.json
node serve.ts --port 8093 & node tools/take-shots.mjs # re-take the screenshots (headless Chrome)
```

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
