# v4 vs v3: self-check gate (28 Nov 2026, ~13:50 UTC)

v3 = commit 29b6f22 (submission 01a2203f-0dcd-7193-9588-d53c319017f9, round 3 #14 of 7,271, 792,368).
v4 = the commit that adds this file, on top of 29b6f22. It follows `judge-records/v4-brief.txt` in priority order.

## 1. What changed, by the brief's priorities

1. **Cover: more cards, no cut-off text.** It shows 9 whole cards in 3 rows (v3: 5 cards and a Skip rail). The first row is All-Time Low only, the second All-Time Low, the third Strong / All-Time Low. Each card shows the verdict, −%, score, product, sale price, struck "was" price, Buy link, store and its rank among stores, one reason line and one read line ("NBC Select 28 Nov 13:22 UTC · held 3 reads"). Every line is written short enough to fit; `CARD_NOTES` in `app/data/deals.js` holds a ≤42-character reason per deal, and the long evidence stays in the price check. `tools/audit-fit.mjs` measures every one-line text in Chrome at 1200, 420 and 360 px. None is wider than its box, and on a phone those lines wrap instead. The Skip list is now a one-line banner after row 3.
2. **Count tiles that survive the shrink** (30 px numbers at 1200 px): 155 deals at 30 stores · 47 at a record low · 34/155 only Fair or Skip · 22 read on the store page · 154 same price every read · all re-read 28 Nov 13:22–13:28 UTC. They are computed from the data (`lib/board-stats.js` boardFacts). `audit-fit.mjs` counts them again from `deals.js` and compares.
3. **Evidence and a fresh re-read, done this session (28 Nov 13:22–13:29 UTC):**
   - All 7 deals sources were fetched again at 13:22:57–59 UTC. NBC's main roundup and Yahoo's main live blog had moved to new URLs, which are now in `SOURCES`. `tools/recheck-sources.mjs` found **both prices next to each deal's own store link for 155 of 155 deals**. It also re-found NBC's "Lowest price ever" flag for every deal whose evidence quotes it, except Sony's own store for the Bravia 7 II. That card now reads "Same as Best Buy's record low", and Best Buy's link carries the flag.
   - Store pages were read with `tools/read-store-pages.mjs` (all 155 links, then the 25 Target links again with a longer wait). **22 matched as read on the store page** (v3: 14). Walmart pages loaded this time. Amazon, Best Buy, Sony, Sephora, Ulta, UGG, HOKA, Kohl's, Lowe's and PC Richard refused or did not answer, and no attempt was made to get past them. Target pages loaded but did not render a price, except AirPods Pro 3 and the ULTIMEA soundbar.
   - Two store pages disagreed with the sources and won. **Walmart's Roomba 105 now costs $189.99** (sources still list $149.99), so it is re-rated Skip, $51 over Amazon. **Walmart's Nespresso Vertuo Pop "was" price is $94.97**, not $119, so it is 38% off, not half off.
   - A check trail on every card: each deal carries `reads` (v2's 27 Nov read for the 64 it listed, v3's early-28 Nov read, today's). Cards say "held N reads", or "from $149 on 27 Nov" when the price moved. The price check lists every read.
4. **Screenshots 2–4 legible in a ~250 px cell:** shot at 420×404 / 390×404 CSS px, DPR 2. (2) Home + 40%+ active, "9 of 155 deals · Home · 40%+ off · Clear", the list still visible. (3) Compare stores, with the cheapest-store bars. (4) Phone: chips, the price-gap row, then the top card.
5. **Price-gap row:** "Same product, different price". It lists the 3 widest gaps between the cheapest and the dearest store, from the data (`priceSpreads`), and links to Compare.
6. **First load:** 12,639 B gzip in 8 files (v3: 12,668 B, 8 files). The ranking, tile counts and gaps moved to `lib/board-stats.js`, which loads with the data.

## 2. Self-check list

| Check | Result |
|---|---|
| `node tools/audit-deals.mjs` | **PASS** ("every deal passes"): 155 deals, 30 stores, 9 categories, 50 cross-store products. Verdicts low 47 / strong 74 / fair 23 / skip 11. 22 read on the store page, 133 in a source. Checks run 2026-11-28T13:22:57Z–13:28:34Z, inside the last 24 h before the 29 Nov 00:42 UTC deadline. Every deal has a link, source, verdict, card note and ≥2 reads. |
| Cover sheet at 768×480 | **PASS**: 9 whole cards (`audit-fit.mjs`: "cover: whole cards 9", first row low/low/low, nothing cut at the bottom edge). Every price, store, % and verdict reads at 761×480. No "…" anywhere; `.fit` lines have no ellipsis rule. |
| Shots 2–4 in the ~250 px cell | **PASS** by eye on `review/contact-sheet-v4.jpg`: result count and filter pills, the compare bars with prices, and the phone card all read. |
| Screenshots | **PASS**: 4 files, 234 / 99 / 89 / 107 KiB (all ≤ 256 KiB). 1280×807, 840×808, 840×808, 780×808: long side ≤ 1280, short side ≥ 360. Real renders by `tools/take-shots.mjs`. |
| `makefun check` (kit63) | see §5 |
| main.ts deterministic | **PASS**: two runs (`out/`, `out2/`), `diff -r` empty |
| vendor/makefun-frontend.ts = kit63 starter's | **PASS** (`cmp` silent) |
| Tiles = counts from data | **PASS** (`audit-fit.mjs`: "the tiles match the data") |
| First load not worse than v3 | **PASS**: 12,639 B gzip / 8 files vs 12,668 B / 8 |
| Text addressed to a judge | **none**: `audit-deals.mjs` scan of app/ is clean, and the 4 screenshots were read by eye |
| Search/listing links, affiliate tags | **none** (audit pattern check). Source links had their tags stripped. |

## 3. Mock judge, both orders

The judge's five criteria, in order. Inputs: the contact sheets (`review/contact-sheet-v3.jpg`, `review/contact-sheet-v4.jpg`) and an outline of each dossier (Totals, source files, first declarations). This is our own reading, not the house model.

**Order 1: A = v3, B = v4.**
1. *Working finder in the screenshots.* B's cover shows 9 complete cards. Each has product, store, sale and "was" price, −%, a Buy link and a dated read line. Above them sit the search, the Store / Verdict / Sort selects, the min-discount buttons and category chips with counts. Nothing is cut off. A shows 5 cards and a Skip rail, and several of its evidence lines end in "…" ("Also: Amazon $99 (+$19.01) · Walmart $9…"), which reads as broken text at this size. B's small shots read: filters visibly active with "9 of 155 deals · Home · 40%+ off · Clear", compare bars, phone. A's small shots are 1280×800 pages that cannot be read at 250 px. **B clearly ahead.**
2. *Real, checked deals.* B: tiles "47 at a record low", "34/155 only Fair or Skip", "22 read on the store page", "154 same price every read", "all re-read 28 Nov 13:22–13:28 UTC". Every card names where and when its price was read and how many reads held it. A: a thin line "155 deals · 30 stores · re-checked 02:51–03:11 UTC" and a verdict legend, with read lines that are partly cut. **B ahead.**
3. *Usefulness.* Both sort by a deal score with a verdict on every card, and both compare stores. A opens on a "Today's best" band; B opens on the best deals (one store per product, mixed categories), a price-gap row (Sony Bravia 5: Amazon $1,498 vs Best Buy $1,598, save $100) and "lowest of N" / "+$X vs <store>" on each card. **B slightly ahead.**
4. *Look and phone.* Same identity and palette. B is denser but its type is larger after the shrink; both phone layouts work. **About even, B by a hair.**
5. *Speed and structure.* B 12,639 B / 8 files vs A 12,668 B / 8 files, and both split into small single-job modules. **Even (B by 29 B).**

**Verdict: B (v4), margin 4.** The first difference is criterion 1, and criteria 2 and 3 point the same way.

**Order 2: A = v4, B = v3.** The same reading with the labels swapped. Criterion 1 favours A: 9 whole cards with no cut text against B's 5 cards with "…" lines, and A's thumbnails read while B's cannot. Criteria 2 and 3 favour A, 4 is about even, and 5 is even. **Verdict: A (v4), margin 4.**

**v4 wins both orders.**

## 4. Honest gaps

- 22 of 155 (14%) were read on the store page; the other 133 come from deals sources fetched at 13:22 UTC. The big stores' bot checks were not worked around.
- NBC TVs (nbcTv) was last updated at 01:07 UTC and NBC under-$50 at 04:36 UTC, both on 28 Nov. We read them at 13:22 UTC.
- "All-Time Low" still rests on NBC Select's "Lowest price ever" flag (its CamelCamelCamel check), re-found today on the source page. CamelCamelCamel itself was not opened.
- The TCL 98" store-page read matches $1,999.99 among the size offers on TCL's series page; the page's default size shows a lower price.
- The mock judge above is our own reading of both sheets against the published criteria, not a run of the house judge model.

## 5. makefun check (kit63)

`node cli/makefun.mjs check --kit kit63/... --repo . --transcripts transcripts.tar.gz` at 2026-11-28T13:47Z on c7e7285 (the v4 code commit; this file's update is the only later change):
**14 passed, 0 failed, 6 skipped, 5 checked at submission.** The transcripts hold 30 sessions (the two earlier top-level sessions with their 27 subagents, plus this one). thinking_reproduces: 77.3% authored (1397 of 1805; whole-deliverable denominator 42.9%). thinking_own_work, transcripts_run_record and thinking_in_window pass.
