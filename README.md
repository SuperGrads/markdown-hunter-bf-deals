# markdown-hunter-bf-deals

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/SuperGrads/markdown-hunter-bf-deals/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/SuperGrads/markdown-hunter-bf-deals/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

**Markdown Hunter** is a Black Friday and Cyber Monday 2026 deal finder. It's a static site with no build step and no network requests.

- **155 deals at 30 stores, every one read again on Saturday 28 Nov 2026, 13:22–13:29 UTC.** 22 prices were read on the store's own product page (Walmart, Samsung, Vitamix, Oral-B, Bloomingdale's, Zappos and others). The other 133 were read in a deals site fetched at 13:22 UTC that names the store and links to the product: NBC Select's roundups (updated up to 12:54 UTC) and Yahoo Shopping's live blogs (13:12 UTC). `tools/recheck-sources.mjs` found both prices beside each deal's own store link. Amazon, Best Buy, Sephora, Ulta, UGG and Kohl's turned away automated page reads, and most Target pages did not render a price.
- **A check trail on every card.** We read each price two or three times: 27 Nov (the deals v2 listed), early 28 Nov and again at 13:22 UTC. 154 held the same price at every read. One moved: Walmart's own page now asks $189.99 for the Roomba 105, up from $149 on 27 Nov, so it is flagged Skip.
- **A verdict on every deal, with its evidence:** *All-Time Low* (47), *Strong Deal* (74), *Fair Price* (23) or *Skip* (11). An "All-Time Low" is NBC Select's "Lowest price ever" flag (its desk checks prices against CamelCamelCamel history), re-found on today's page, or the same price as that record at another store. Fair and Skip name the trap with numbers: a padded "was" price, a store charging more than another, or a repeat of October's Prime Day price.
- **The board:** tiles counted from the data (deals, record lows, how many are only Fair or Skip, store-page reads, prices that held), then search, store, verdict, sort, minimum discount and category filters with live counts, a "same product, different price" row and compact cards. The best deals come first, one store per product and a mix of categories. Opening a deal shows its price check: the math, every read, where and when, and the same product at every store. A Compare stores view and a shortlist round it out. All state lives in the URL hash.

The first load is 8 files and 12.6 KB gzip: the page, one stylesheet, `main.js`, three `lib/` modules and two views. The deal data, the board's ranking and counts (`lib/board-stats.js`), the compare, price-check and shortlist views and their styles load with `import()`.

## Run it

```sh
node serve.ts                                   # http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # hand-in: app/, screenshots/, dossier.json
node tools/audit-deals.mjs                      # every deal: prices add up, checked 28 Nov, link, source, verdict
node tools/recheck-sources.mjs pages/ out.jsonl # re-read deals in saved source pages (<key>.html): both prices by the link
node serve.ts --port 8093 & node tools/take-shots.mjs # re-take the screenshots (headless Chrome)
node tools/audit-fit.mjs                        # with the server up: no card line cut, 9+ whole cards, tiles = data
python3 tools/contact-sheet.py screenshots sheet.jpg  # preview the screenshots as one shrunk sheet
node tools/read-store-pages.mjs urls.txt out.jsonl    # read prices on store product pages
```

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
