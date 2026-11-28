# markdown-hunter-bf-deals

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/SuperGrads/markdown-hunter-bf-deals/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/SuperGrads/markdown-hunter-bf-deals/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

**Markdown Hunter** is a Black Friday and Cyber Monday 2026 deal finder. It's a static site with no build step and no network requests.

- **155 deals at 30 stores, every one re-checked on Saturday 28 Nov 2026 (02:51–03:12 UTC).** 14 prices were read on the store's own product page (Samsung, Target, Vitamix, Oral-B, Zappos and others). The other 141 were read in a deals source updated on 28 Nov that names the store and links to the product: NBC Select's roundups and Yahoo Shopping's live blogs. Amazon, Best Buy, Walmart and several other stores turned away automated page reads. Each card says where its price was read and when.
- **A verdict on every deal, with evidence:** *All-Time Low* (47), *Strong Deal* (75), *Fair Price* (23) or *Skip* (10). An "All-Time Low" rests on NBC Select's "Lowest price ever" badge (its desk checks prices against CamelCamelCamel history) or on matching that record price at another store. Fair and Skip name the trap with numbers: a padded "was" price, a store charging $30–$100 more than another, or a repeat of October's Prime Day price.
- **Useful on the card itself:** an "Also: Best Buy $1,299.99 (+$2)" line on every product sold at more than one store (50 products), a "Best price of 3" marker, and any condition (colour, Deal of the Day, extra 10% at checkout).
- **Today's best** opens the board: the top TV, audio and home deal, each at its cheapest store. The deals flagged Skip sit beside the list.
- **Search, filters and sorts:** search, store, category, minimum discount and verdict, each with a live count. Sort by deal score, % off, dollars saved or lowest price. Opening a deal docks its price check beside the list on a wide screen: the math, where and when the price was read, and the same product at every store. A Compare stores view and a shortlist round it out. All state lives in the URL hash.

The first load is 8 files and 12.7 KB gzip: the page, one stylesheet, `main.js`, three `lib/` modules and two views. The deal data, compare, price-check and shortlist views, and their styles (`views/view-styles.js`) load with `import()`.

## Run it

```sh
node serve.ts                                   # http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # hand-in: app/, screenshots/, dossier.json
node tools/audit-deals.mjs                      # every deal: prices add up, checked 28 Nov, link, source, verdict
node serve.ts --port 8093 & node tools/take-shots.mjs # re-take the screenshots (headless Chrome)
python3 tools/contact-sheet.py screenshots sheet.jpg  # preview the screenshots as one shrunk sheet
node tools/read-store-pages.mjs urls.txt out.jsonl    # read prices on store product pages
```

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
