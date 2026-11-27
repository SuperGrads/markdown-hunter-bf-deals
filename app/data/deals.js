// Every deal on Markdown Hunter. Our agent read each price on Black Friday, 27 Nov 2026, in a deals roundup
// published or updated that day (after 00:42 UTC) that names the store and links straight to the product there.
//
// Each row: group (one product at several stores shares a group), product, store, category, price and was (USD, as
// the source states them), url (the product page at the store), source key, signal + evidence (is it really a deal,
// and why), terms (what a shopper must do or know to get the price: a code, a membership, a colour).
//
// signal: "low"     the source tracks it as the lowest price ever (or since release)
//         "strong"  a deep cut, about 30% or more, or the lowest in months, with no all-time-low claim
//         "fair"    a real but modest cut, or the same product is cheaper at another store
//         "routine" a repeat of an earlier sale, a "was" price nobody charges, or a cut too small to matter

export const SOURCES = {
  nbc: { name: 'NBC Select', title: 'Best Black Friday 2026 deals we\'re live tracking', updated: 'updated 27 Nov 2026, 8:00 AM EST', url: 'https://www.nbcnews.com/select/shopping/best-black-friday-deals-11-27-2026-rcna611358', checked: '2026-11-27T13:23:00Z' },
  nbcTv: { name: 'NBC Select TVs', title: 'Best Black Friday TV deals 2026', updated: '27 Nov 2026, 4:54 AM EST', url: 'https://www.nbcnews.com/select/shopping/best-black-friday-tv-deals-2026-rcna611453', checked: '2026-11-27T13:27:00Z' },
  popsci: { name: 'Popular Science', title: 'The best Black Friday deals live right now', updated: 'updated 27 Nov 2026, 12:56 AM EST', url: 'https://www.popsci.com/gear/best-black-friday-deals-2026/', checked: '2026-11-27T13:27:00Z' },
  yahoo: { name: 'Yahoo Shopping', title: 'Black Friday deals are live (live blog)', updated: 'updated 27 Nov 2026, 1:15 PM UTC', url: 'https://shopping.yahoo.com/deals/breaking-news/live/black-friday-deals-are-live-apple-dyson-ugg-ring-hoka-and-more-of-the-biggest-sales-of-2026-153033593.html', checked: '2026-11-27T13:24:00Z' },
};

const amazon = (asin) => `https://www.amazon.com/dp/${asin}`;
const homeDepot = (id) => `https://www.homedepot.com/p/${id}`;

const raw = [
  // ── TVs ───────────────────────────────────────────────────────────────
  ['sony-bravia-7ii-65', 'Sony Bravia 7 II 65" Mini-LED Google TV (K65XR70M2)', 'Best Buy', 'TVs', 1499.99, 2599.99, 'https://www.bestbuy.com/product/sony-65-class-bravia-7-ii-true-rgb-4k-hdr-google-tv-with-gemini/J7XSRH54W4', 'nbcTv', 'low', 'NBC Select badges it "Lowest price ever"; Sony\'s own store matches it to the cent.'],
  ['sony-bravia-7ii-65', 'Sony Bravia 7 II 65" Mini-LED Google TV (K65XR70M2)', 'Sony', 'TVs', 1499.99, 2599.99, 'https://electronics.sony.com/tv-video/televisions/all-tvs/p/k65xr70m2', 'nbcTv', 'low', '"Lowest price ever" per NBC Select, the same $1,499.99 as Best Buy.'],
  ['sony-bravia-8ii-55', 'Sony Bravia 8 II 55" QD-OLED Google TV (K55XR80M2)', 'Best Buy', 'TVs', 1799.99, 2599.99, 'https://www.bestbuy.com/product/sony-55-class-bravia-8-ii-oled-4k-uhd-smart-google-tv-with-gemini-2025/J7XSRH5T4Q/sku/6626033', 'nbcTv', 'strong', '$800 off Sony\'s flagship OLED; NBC Select makes no record-low claim for it.'],
  ['sony-bravia-8ii-55', 'Sony Bravia 8 II 55" QD-OLED Google TV (K55XR80M2)', 'Sony', 'TVs', 1799.99, 2599.99, 'https://electronics.sony.com/tv-video/televisions/all-tvs/p/k55xr80m2', 'nbcTv', 'strong', 'Same $1,799.99 as Best Buy; 31% off with no record-low claim.'],
  ['lg-c6-65', 'LG C6 65" OLED evo 4K TV (OLED65C6PUA, 2026)', 'Best Buy', 'TVs', 1399.99, 2699.99, 'https://www.bestbuy.com/product/lg-65-class-c6-oled-evo-ai-4k-smart-webos-tv-with-perfect-black-perfect-color-and-brightness-booster-2026/JJ8VPZKZ8H/sku/6673112', 'nbcTv', 'strong', '$1,300 off this year\'s C6; NBC Select and Popular Science both list $1,399.99, and LG.com charges the same.'],
  ['samsung-frame-65', 'Samsung The Frame 65" QLED art TV (LS03FA, 2025)', 'Amazon', 'TVs', 897.99, 1497.99, amazon('B0DXMR856R'), 'nbcTv', 'low', 'NBC Select: "Lowest price ever". Popular Science saw $897.96 earlier the same day.'],
  ['samsung-frame-65', 'Samsung The Frame 65" QLED art TV (LS03FA, 2025)', 'Best Buy', 'TVs', 899.99, 1599.99, 'https://www.bestbuy.com/product/samsung-65-class-ls03fa-the-frame-series-qled-4k-uhd-art-mode-samsungvision-ai-smart-tv-w-wall-mount-2025/J3ZYGXCV3T', 'nbcTv', 'low', '$2 above Amazon\'s record low; Best Buy\'s listing includes a wall mount.'],
  ['samsung-frame-65', 'Samsung The Frame 65" QLED art TV (LS03FA, 2025)', 'Samsung', 'TVs', 899.99, 1799.99, 'https://www.samsung.com/us/lifestyle-tvs/the-frame/65-inch-the-frame-qled-4k-tv-ls03fa-sku-qn65ls03fafxza/', 'nbcTv', 'fair', 'A good price, but Samsung\'s $1,799.99 "was" oversells it: Amazon lists the same TV from $1,497.99, so the real cut is 40%, not 50%.'],
  ['samsung-qn70f-85', 'Samsung 85" Neo QLED QN70F Mini-LED TV (2025)', 'Amazon', 'TVs', 1099.99, 1697.99, amazon('B0DXN369G2'), 'popsci', 'strong', '$598 off at Amazon per Popular Science, and $600 under Samsung\'s own sale price.'],
  ['samsung-qn70f-85', 'Samsung 85" Neo QLED QN70F Mini-LED TV (2025)', 'Samsung', 'TVs', 1699.99, 2299.99, 'https://www.samsung.com/us/tvs/neo-qled/85-class-neo-qled-4k-tv-qn70f-sku-qn85qn70fafxza/', 'nbcTv', 'routine', 'Skip: Samsung.com wants $1,699.99 for the TV Amazon sells for $1,099.99 today.'],
  ['hisense-u7-65', 'Hisense 65" U7 Mini-LED Google TV (65U7SG, 2026)', 'Amazon', 'TVs', 797.99, 1497.99, amazon('B0GR9BLPJ8'), 'nbcTv', 'low', 'NBC Select: "Lowest price ever", 47% off.'],
  ['hisense-u7-65', 'Hisense 65" U7 Mini-LED Google TV (65U7SG, 2026)', 'Best Buy', 'TVs', 799.99, 1499.99, 'https://www.bestbuy.com/product/hisense-65-class-u7-miniled-qled-uhd-4k-hdr-glare-free-smart-google-tv-with-gemini-2026/J3Z9Z42HT2/sku/6672762', 'nbcTv', 'low', 'Within $2 of the record low at Amazon and P.C. Richard.'],
  ['hisense-u7-65', 'Hisense 65" U7 Mini-LED Google TV (65U7SG, 2026)', 'P.C. Richard & Son', 'TVs', 797.99, 1497.99, 'https://www.pcrichard.com/hisense-flat-panel-television-65u7sg/65U7SG.html', 'nbcTv', 'low', 'Ties Amazon\'s record low, $797.99.'],
  ['hisense-u7-75', 'Hisense 75" U7 Mini-LED Google TV (75U7SG, 2026)', 'Amazon', 'TVs', 997.99, 1999.99, amazon('B0GR9NR9XV'), 'popsci', 'strong', 'Half off: Popular Science puts it at "$1,002 off list price", with no record claim.'],
  ['hisense-s7-75', 'Hisense 75" S7 CanvasTV QLED (75S7SG, 2026)', 'Amazon', 'TVs', 1297.99, 2499.99, amazon('B0GRGQ5YSM'), 'nbcTv', 'low', 'NBC Select: "Lowest price ever", 48% off.'],
  ['hisense-s7-75', 'Hisense 75" S7 CanvasTV QLED (75S7SG, 2026)', 'Best Buy', 'TVs', 1299.99, 2499.99, 'https://www.bestbuy.com/product/hisense-75-class-s7-canvas-series-smart-google-tv-4k-qled-smart-google-tv-with-hi-matte-display-and-ultraslim-wall-mount-2026/J3Z9Z42HKR/sku/6673873', 'nbcTv', 'low', '$2 above Amazon, the same record-low sale.'],
  ['tcl-qm7l-98', 'TCL 98" QM7L SQD-Mini LED Google TV (98QM7L, 2026)', 'Amazon', 'TVs', 1997.99, 3999.99, amazon('B0GPSLXN6W'), 'nbcTv', 'strong', 'Half off a 98-inch set; NBC Select and Popular Science both list $1,997.99, with no record claim.'],
  ['tcl-qm7l-98', 'TCL 98" QM7L SQD-Mini LED Google TV (98QM7L, 2026)', 'Best Buy', 'TVs', 1999.99, 3999.99, 'https://www.bestbuy.com/product/tcl-98-class-qm7l-series-4k-uhd-hdr-sqd-mini-led-smart-tv-with-google-tv-with-gemini-2026/J36QYTH8GG/sku/6672673', 'nbcTv', 'strong', '50% off, $2 above Amazon.'],
  ['tcl-qm7l-98', 'TCL 98" QM7L SQD-Mini LED Google TV (98QM7L, 2026)', 'TCL', 'TVs', 1999.99, 3999.99, 'https://us.tcl.com/products/qm7l-series-sqd-mini-led-4k-uhd-hdr-smart-tv-with-google-tv?variant=44054439329857', 'nbcTv', 'strong', 'TCL\'s own store matches Best Buy at $1,999.99.'],
  ['roku-pro-55', 'Roku Pro Series 55" QLED Smart TV', 'Amazon', 'TVs', 699.99, 999.99, amazon('B0GVW1M8JF'), 'nbcTv', 'low', 'NBC Select: "Lowest price ever", $300 off.'],
  ['roku-plus-55', 'Roku Plus Series 55" QLED Mini-LED TV', 'Amazon', 'TVs', 299.99, 499.99, amazon('B0DWHVZHBY'), 'nbcTv', 'strong', '40% off; NBC Select gives it no record-low badge.'],
  ['roku-plus-55', 'Roku Plus Series 55" QLED Mini-LED TV', 'Best Buy', 'TVs', 299.99, 499.99, 'https://www.bestbuy.com/product/roku-55-class-plus-series-4k-qled-mini-led-smart-rokutv/J3PFCJQ6RW', 'nbcTv', 'strong', 'The same $299.99 as Amazon.'],
  ['hisense-h5r1-65', 'Hisense 65" H5R1 4K Roku TV (2026)', 'Walmart', 'TVs', 228, 398, 'https://www.walmart.com/ip/20206324665', 'yahoo', 'strong', 'Yahoo lists it at $228, $170 off: a 65-inch 4K set for the price of a soundbar.'],

  // ── Audio ─────────────────────────────────────────────────────────────
  ['airpods-pro-3', 'Apple AirPods Pro 3', 'Amazon', 'Audio', 149, 249, amazon('B0FQFB8FMG'), 'nbc', 'low', 'NBC Select: "Lowest price ever"; Yahoo says it "matches the lowest we\'ve seen all year".'],
  ['airpods-pro-3', 'Apple AirPods Pro 3', 'Best Buy', 'Audio', 149.99, 249.99, 'https://www.bestbuy.com/product/apple-airpods-pro-3-wireless-active-noise-cancelling-earbuds-with-heart-rate-sensing-feature-white/JJGCQLYK5F/sku/6376563', 'nbc', 'strong', '99¢ above Amazon\'s record low: buy wherever is easier.'],
  ['sony-wh1000xm6', 'Sony WH-1000XM6 noise-cancelling headphones', 'Sony', 'Audio', 348, 459.99, 'https://electronics.sony.com/audio/headphones/headband/p/wh1000xm6-b', 'popsci', 'fair', '$111.99 off at Sony\'s own store: a real cut on this year\'s flagship, but only 24%.', 'Black'],
  ['sony-wh1000xm5', 'Sony WH-1000XM5 noise-cancelling headphones', 'Best Buy', 'Audio', 169.99, 398, 'https://www.bestbuy.com/product/sony-wh-1000xm5-wireless-noise-cancelling-over-the-ear-headphones-black/J7XSRH5CXG/sku/10893389', 'popsci', 'strong', '$228 off the last-generation flagship, under half the price of the XM6.', 'Black'],
  ['bose-qc', 'Bose QuietComfort headphones', 'Amazon', 'Audio', 167, 359, amazon('B0D4Z9C562'), 'yahoo', 'low', 'Yahoo: "just about as low as these top-sellers get", 53% off.'],
  ['beats-studio-pro', 'Beats Studio Pro wireless headphones', 'Amazon', 'Audio', 139.95, 299.99, amazon('B0H7Z164PJ'), 'popsci', 'strong', 'Under half the $299.99 list; Popular Science makes no record claim.', 'Light Blue'],
  ['shokz-openfit-2plus', 'Shokz OpenFit 2+ open-ear earbuds', 'Amazon', 'Audio', 99.95, 199.95, amazon('B0FVKJMTJH'), 'popsci', 'strong', 'Exactly half price per Popular Science.', 'Purple'],
  ['bose-soundlink-flex-2', 'Bose SoundLink Flex speaker (2nd Gen)', 'Amazon', 'Audio', 99, 149, amazon('B0D6WD2QSQ'), 'popsci', 'strong', '$50 off a waterproof speaker, 34%.'],
  ['bose-soundlink-micro-2', 'Bose SoundLink Micro speaker (2nd Gen)', 'Amazon', 'Audio', 79, 129, amazon('B0FF4RY23S'), 'popsci', 'strong', '$50 off, 39%; no record claim.'],
  ['sony-ult-field-1', 'Sony ULT Field 1 waterproof speaker', 'Amazon', 'Audio', 68, 139.99, amazon('B0CXKSCY1G'), 'popsci', 'strong', 'Over half off per Popular Science.'],
  ['marshall-emberton-3', 'Marshall Emberton III speaker', 'Amazon', 'Audio', 89.99, 179.99, amazon('B0GXH3N61Z'), 'popsci', 'strong', 'Half price per Popular Science.'],
  ['sonos-beam-sub-mini', 'Sonos Beam (Gen 2) + Sub Mini bundle', 'Amazon', 'Audio', 738, 998, amazon('B0C6KL7FN7'), 'popsci', 'fair', '$260 off the pair, 26%; no record claim.'],

  // ── Laptops & tech ────────────────────────────────────────────────────
  ['macbook-air-13-m5', 'Apple MacBook Air 13" M5, 16GB / 512GB', 'Best Buy', 'Tech', 999, 1299, 'https://www.bestbuy.com/product/apple-macbook-air-13-inch-laptop-m5-chip-with-10-core-cpu-and-8-core-gpu-16gb-memory-512gb-ssd-midnight/JJGCQLKXL7/sku/6697543', 'popsci', 'strong', '$300 off the current Air per Popular Science; Amazon matches.', 'Midnight'],
  ['macbook-air-13-m5', 'Apple MacBook Air 13" M5, 16GB / 512GB', 'Amazon', 'Tech', 999, 1299, amazon('B0GR19X8DC'), 'yahoo', 'strong', 'Yahoo: "the lowest Amazon price we\'ve seen this year"; Best Buy matches.', 'Check the configuration on the listing'],
  ['lg-ultragear-27g640a', 'LG UltraGear 27" QHD IPS gaming monitor (27G640A-B)', 'Amazon', 'Tech', 229.49, 449.99, amazon('B0FLLKBNY7'), 'popsci', 'strong', 'Nearly half off per Popular Science.'],
  ['dji-osmo-pocket-3', 'DJI Osmo Pocket 3 Creator Combo', 'Amazon', 'Tech', 466, 629, amazon('B0CG19FGQ5'), 'popsci', 'fair', '$163 off the combo, 26%; a Popular Science top pick.'],
  ['dji-osmo-action-4', 'DJI Osmo Action 4 Standard Combo', 'Amazon', 'Tech', 179, 299, amazon('B0C783YNW7'), 'popsci', 'strong', '$120 off, 40%.'],
  ['insta360-x5', 'Insta360 X5 360° camera (No Drone bundle)', 'Amazon', 'Tech', 499.99, 656, amazon('B0DZCG84CS'), 'popsci', 'fair', '$156 off the bundle, 24%; no record claim.'],
  ['anker-87w-powerbank', 'Anker 20,000mAh 87W power bank, built-in USB-C cable', 'Amazon', 'Tech', 56.99, 79.99, amazon('B0CXDQXC3Q'), 'popsci', 'fair', '$23 off, 29%: fine if you need one now.'],

  // ── Wearables & trackers ──────────────────────────────────────────────
  ['airtag-2', 'Apple AirTag (2nd Gen), 1-pack', 'Amazon', 'Wearables', 18, 29, amazon('B0GJTFXNRX'), 'nbc', 'low', 'NBC Select: "Lowest price ever", $11 off.'],
  ['airtag-2', 'Apple AirTag (2nd Gen), 1-pack', 'Best Buy', 'Wearables', 18, 29, 'https://www.bestbuy.com/product/apple-airtag-1-pack-2nd-generation-2026-white/JJGCQLTTHZ/sku/6377585', 'nbc', 'low', 'Matches Amazon\'s record low exactly.'],
  ['airtag-2', 'Apple AirTag (2nd Gen), 1-pack', 'Target', 'Wearables', 18.99, 29.99, 'https://www.target.com/p/apple-airtag-2nd-generation/-/A-95228359', 'nbc', 'strong', '99¢ more than Amazon and Best Buy.'],
  ['oura-ring-5', 'Oura Ring 5 smart ring', 'Amazon', 'Wearables', 299, 399, amazon('B0GRK1N94H'), 'nbc', 'low', 'NBC Select: "Lowest price ever"; Target and Ulta match it.', 'Needs Oura membership, $5.99/mo (1 month free)'],
  ['oura-ring-5', 'Oura Ring 5 smart ring', 'Target', 'Wearables', 299, 399, 'https://www.target.com/p/oura-ring-5/-/A-1011018295', 'nbc', 'low', 'Same $299 record low as Amazon.', 'Needs Oura membership, $5.99/mo (1 month free)'],
  ['oura-ring-5', 'Oura Ring 5 smart ring', 'Ulta Beauty', 'Wearables', 299, 399, 'https://www.ulta.com/p/oura-ring-5-silver-pimprod2063171?sku=2664669', 'nbc', 'low', 'Same $299 record low as Amazon and Target.', 'Needs Oura membership, $5.99/mo (1 month free)'],
  ['apple-watch-se3', 'Apple Watch SE 3, GPS 40mm', 'Amazon', 'Wearables', 179, 249, amazon('B0HJ9ZNRKT'), 'popsci', 'fair', '$70 off, 28%; Yahoo shows the same $179.'],
  ['garmin-instinct-3', 'Garmin Instinct 3 AMOLED 45mm GPS watch', 'Amazon', 'Wearables', 249.99, 449.99, amazon('B0DSC8JF59'), 'popsci', 'strong', '$200 off, 44%, per Popular Science.'],
  ['garmin-inreach-mini-2', 'Garmin inReach Mini 2 satellite communicator', 'Amazon', 'Wearables', 249, 399.99, amazon('B09PSKG7C3'), 'popsci', 'strong', '$151 off, 38%.', 'Needs an active Garmin satellite plan'],

  // ── Smart home ────────────────────────────────────────────────────────
  ['ring-battery-doorbell-2k', 'Ring Battery Doorbell 2K (newest model)', 'Amazon', 'Smart Home', 39, 100, amazon('B0FHJ7TKZM'), 'yahoo', 'low', 'Yahoo: "the lowest it\'s been since its release", 61% off.'],
  ['ring-doorbell-indoor-cam', 'Ring Battery Doorbell + Indoor Cam bundle', 'Amazon', 'Smart Home', 49.99, 149.98, amazon('B0H6GX9QQ6'), 'popsci', 'strong', 'Two devices for $49.99, $100 off the bundle.'],
  ['hatch-sleep-clock', 'Hatch Sleep Clock', 'Amazon', 'Smart Home', 187.49, 249.99, amazon('B0GV4YDWM5'), 'nbc', 'low', 'NBC Select: "Lowest price ever"; Hatch\'s own site is 1¢ more.'],
  ['hatch-sleep-clock', 'Hatch Sleep Clock', 'Hatch', 'Smart Home', 187.5, 249.99, 'https://www.hatch.co/hatch-sleep-clock', 'nbc', 'low', 'The same 25% cut, 1¢ above Amazon.'],
  ['blueair-211i-max', 'Blueair Blue Pure 211i Max air purifier', 'Amazon', 'Smart Home', 199.99, 349.99, amazon('B0BN2MGV5H'), 'popsci', 'strong', '$150 off a large-room purifier, 43%.'],
  ['coway-airmega-1512', 'Coway Airmega AP-1512HH Mighty air purifier', 'Amazon', 'Smart Home', 143.99, 229.99, amazon('B01728NLRG'), 'popsci', 'strong', '$86 off, 37%.'],

  // ── Kitchen ───────────────────────────────────────────────────────────
  ['kitchenaid-k45ss', 'KitchenAid Classic 4.5 qt tilt-head stand mixer (K45SS)', 'Amazon', 'Kitchen', 279.99, 399.99, amazon('B00004SGFW'), 'nbc', 'strong', 'NBC Select: "Lowest price in over 6 months"; Target and Kohl\'s match it.', 'White'],
  ['kitchenaid-k45ss', 'KitchenAid Classic 4.5 qt tilt-head stand mixer (K45SS)', 'Target', 'Kitchen', 279.99, 399.99, 'https://www.target.com/p/kitchenaid-classic-4-5qt-stand-mixer-white/-/A-80204121', 'nbc', 'strong', 'The same $279.99 as Amazon.', 'White'],
  ['kitchenaid-k45ss', 'KitchenAid Classic 4.5 qt tilt-head stand mixer (K45SS)', "Kohl's", 'Kitchen', 279.99, 399.99, 'https://www.kohls.com/product/prd-5689493/kitchenaid-k45ss-classic-series-45-qt-tilt-head-stand-mixer.jsp', 'nbc', 'strong', 'The same $279.99 as Amazon and Target.'],
  ['cuisinart-clearview', 'Cuisinart ClearView 4 qt glass-basket air fryer', 'Amazon', 'Kitchen', 83.99, 139.95, amazon('B0GVPBSXXF'), 'nbc', 'low', 'NBC Select: "Lowest price ever", $16 under the other two stores.'],
  ['cuisinart-clearview', 'Cuisinart ClearView 4 qt glass-basket air fryer', "Bloomingdale's", 'Kitchen', 99.95, 139.95, 'https://www.bloomingdales.com/shop/product/cuisinart-clearview-4-quart-glass-basket-air-fryer?ID=6272411', 'nbc', 'fair', 'A real $40 cut, but Amazon has it $16 cheaper.'],
  ['cuisinart-clearview', 'Cuisinart ClearView 4 qt glass-basket air fryer', 'Williams Sonoma', 'Kitchen', 99.95, 139.95, 'https://www.williams-sonoma.com/products/cuisinart-clearview-glass-basket-air-fryer/?catalogId=79&sku=15498371', 'nbc', 'fair', '$16 above Amazon\'s record low.'],
  ['vitamix-5200', 'Vitamix 5200 Professional-Grade blender, 64 oz', 'Amazon', 'Kitchen', 299.95, 499.95, amazon('B008H4SLV6'), 'nbc', 'strong', 'NBC Select: "Lowest price in over 6 months"; Popular Science lists it too.'],
  ['vitamix-5200', 'Vitamix 5200 Professional-Grade blender, 64 oz', 'Vitamix', 'Kitchen', 299.95, 499.95, 'https://www.vitamix.com/us/en_us/products/5200-standard-getting-started', 'nbc', 'strong', 'Vitamix matches Amazon\'s $299.95; NBC saw Best Buy still at $469.'],
  ['fullstar-chopper', 'Fullstar Pro 4-in-1 vegetable chopper & spiralizer', 'Amazon', 'Kitchen', 23.74, 49.99, amazon('B0764HS4SL'), 'nbc', 'strong', 'NBC Select: "Lowest price in over 3 months".'],
  ['fullstar-chopper', 'Fullstar Pro 4-in-1 vegetable chopper & spiralizer', 'Walmart', 'Kitchen', 35.52, 42.6, 'https://www.walmart.com/ip/18264252255', 'nbc', 'fair', '17% off, but $11.78 more than Amazon.'],
  ['fullstar-chopper', 'Fullstar Pro 4-in-1 vegetable chopper & spiralizer', 'Wayfair', 'Kitchen', 53.99, 57.99, 'https://www.wayfair.com/home/pdp/textiles-hub-the-original-pro-chopper-vegetable-chopper-and-spiralizer-food-chopper-with-container-fruit-slicer-kitchen-gadgets-gifts-home-essentials-cxtj2905.html', 'nbc', 'routine', 'Skip: $4 off, and more than double Amazon\'s $23.74.'],
  ['ninja-flip-sp151', 'Ninja Flip toaster oven & air fryer (SP151)', 'Amazon', 'Kitchen', 140, 250, amazon('B0D1CXL52G'), 'yahoo', 'strong', 'Yahoo: "the lowest it\'s been in 90 days", 44% off.'],
  ['ninja-af150amz', 'Ninja Air Fryer XL 5.5 qt (AF150AMZ)', 'Amazon', 'Kitchen', 89.99, 179.99, amazon('B08QKTXT1N'), 'popsci', 'strong', 'Half price per Popular Science.'],
  ['instant-pot-pro-6', 'Instant Pot Pro 6 qt 10-in-1 pressure cooker', 'Amazon', 'Kitchen', 99.99, 169.99, amazon('B08PQ2KWHS'), 'popsci', 'strong', '$70 off, 41%.'],
  ['breville-barista-express', 'Breville Barista Express espresso machine (BES870XL)', 'Amazon', 'Kitchen', 494.95, 699.95, amazon('B00CH9QWOU'), 'popsci', 'fair', '$205 off, 29%; no record claim.'],
  ['ninja-artisan-pizza', 'Ninja Artisan outdoor pizza oven (MO201)', 'Amazon', 'Kitchen', 199.99, 299.99, amazon('B0DWTFBFWT'), 'popsci', 'strong', '$100 off, a third of the price.'],
  ['keurig-k-express', 'Keurig K-Express Essentials single-serve coffee maker', 'Walmart', 'Kitchen', 35, 68.99, 'https://www.walmart.com/ip/12516374178', 'yahoo', 'strong', 'Yahoo: "matches the best we\'re seeing across the web".', 'Black'],
  ['crock-pot-7qt', 'Crock-Pot 7 qt manual slow cooker', 'Walmart', 'Kitchen', 31.98, 79.99, 'https://www.walmart.com/ip/15200300942', 'yahoo', 'strong', 'Yahoo: "the lowest price we\'re seeing across the \'net".', 'Mussel Grey'],

  // ── Home & cleaning ───────────────────────────────────────────────────
  ['dyson-v9-motorbar', 'Dyson V9 Motorbar cordless vacuum', 'Walmart', 'Home', 269.95, 599.99, 'https://www.walmart.com/ip/21316966979', 'yahoo', 'strong', 'Yahoo: "the best price we\'re seeing on the web"; Amazon matches, Target is 4¢ more.', 'Nickel'],
  ['dyson-v9-motorbar', 'Dyson V9 Motorbar cordless vacuum', 'Amazon', 'Home', 269.95, 599.99, amazon('B0HGNPTSMT'), 'popsci', 'strong', '$330 off per Popular Science, the same as Walmart.'],
  ['dyson-v9-motorbar', 'Dyson V9 Motorbar cordless vacuum', 'Target', 'Home', 269.99, 599.99, 'https://www.target.com/p/dyson-v9-motorbar-cordless-vacuum-9-8-34-cleaning-path-nickel/-/A-1011912746', 'yahoo', 'strong', '4¢ above Walmart and Amazon.', 'Nickel'],
  ['roomba-105', 'iRobot Roomba 105 Vac robot vacuum', 'Amazon', 'Home', 139, 299.99, amazon('B0DX6KZR9T'), 'nbc', 'low', 'NBC Select: "Lowest price ever", 54% off; $10 under Walmart and Target.'],
  ['roomba-105', 'iRobot Roomba 105 Vac robot vacuum', 'Walmart', 'Home', 149, 299.99, 'https://www.walmart.com/ip/15693016874', 'nbc', 'strong', 'Half off, but $10 above Amazon.'],
  ['roomba-105', 'iRobot Roomba 105 Vac robot vacuum', 'Target', 'Home', 149.99, 299.99, 'https://www.target.com/p/irobot-roomba-105-vac-robot-vacuum/-/A-94371681', 'nbc', 'strong', 'Half off, $10.99 above Amazon.'],
  ['roomba-105-combo', 'iRobot Roomba 105 Combo robot vacuum & mop', 'Amazon', 'Home', 169, 319.99, amazon('B0DWG2BB7X'), 'yahoo', 'strong', 'Yahoo: "the last time we saw it for less was back in March".'],
  ['shark-navigator-nv356e', 'Shark Navigator Lift-Away upright vacuum (NV356E)', 'Amazon', 'Home', 119.99, 199.99, amazon('B005KMDV9A'), 'nbc', 'strong', 'NBC Select: "Lowest price in over 3 months".'],
  ['roborock-f25', 'Roborock F25 BX cordless wet/dry vacuum mop', 'Amazon', 'Home', 189.99, 399.99, amazon('B0DHTTNJ2Y'), 'popsci', 'strong', '$210 off, 53%.'],
  ['dreame-l60', 'Dreame L60 Pro Ultra robot vacuum & mop', 'Amazon', 'Home', 899.99, 1399.99, amazon('B0GJM6D1MV'), 'popsci', 'strong', '$500 off, 36%.'],
  ['bissell-little-green-mini', 'Bissell Little Green Mini portable carpet cleaner', 'Amazon', 'Home', 79.99, 99.99, amazon('B0DJMP6T3N'), 'nbc', 'routine', 'NBC Select: "Matches October\'s Prime Big Deal Days price": a repeat sale, not a Black Friday low.', 'Tea Green'],
  ['bissell-little-green-mini', 'Bissell Little Green Mini portable carpet cleaner', 'Target', 'Home', 79.99, 99.99, 'https://www.target.com/p/bissell-little-green-mini-corded-carpet-cleaner-4-cleaning-path/-/A-95013315', 'nbc', 'routine', 'The same $20 cut Amazon ran in October.'],
  ['bissell-little-green-mini', 'Bissell Little Green Mini portable carpet cleaner', 'Best Buy', 'Home', 79.99, 99.99, 'https://www.bestbuy.com/product/bissell-little-green-mini-portable-carpet-cleaner-tea/J7JZ6T5ZQG/sku/6635023', 'nbc', 'routine', 'The same $79.99 as everywhere else, matching an October sale.', 'Tea Green'],
  ['teko-hover-scrubber', 'Teko Hover Scrubber cordless electric mop', 'QVC', 'Home', 49.99, 75, 'https://www.qvc.com/teko-hover-scrubber-electric-indooroutdoor-cordless-mop.product.V90537.html', 'yahoo', 'fair', 'A sponsored pick in Yahoo\'s blog with no price-history claim; first-time QVC shoppers can take $20 more off.', 'New customers: code HOLIDAY20, $20 off $40+'],

  // ── Tools & outdoor ───────────────────────────────────────────────────
  ['dewalt-atomic-2tool', 'DeWalt Atomic 20V Max 2-tool combo kit', 'The Home Depot', 'Tools', 169, 249, homeDepot('322138483'), 'popsci', 'strong', '$80 off, 32%.'],
  ['milwaukee-m18-drill', 'Milwaukee M18 brushless compact 1/2" drill/driver kit', 'The Home Depot', 'Tools', 99, 199, homeDepot('325479354'), 'popsci', 'strong', 'Half price per Popular Science.'],
  ['dewalt-multitool', 'DeWalt 20V Max brushless oscillating multi-tool kit', 'The Home Depot', 'Tools', 99, 199, homeDepot('341367667'), 'popsci', 'strong', 'Half price per Popular Science.'],
  ['bosch-gll50-20', 'Bosch GLL50-20 cross-line laser level', 'The Home Depot', 'Tools', 49.97, 95, homeDepot('327671498'), 'popsci', 'strong', '$45 off, 47%.'],
  ['ryobi-40v-blower', 'Ryobi 40V 550 CFM leaf blower kit with 4.0Ah battery (RY40LB01K)', 'The Home Depot', 'Tools', 99, 159, homeDepot('327354338'), 'yahoo', 'strong', '$60 off; per Yahoo the kit with battery costs $30 less than the bare blower.'],
  ['anker-solix-s2000', 'Anker SOLIX S2000 2,010Wh portable power station', 'Amazon', 'Tools', 649.97, 1199, amazon('B0GY4TQ2P8'), 'popsci', 'strong', '$549 off, 46%.'],
  ['bluetti-elite-100', 'Bluetti Elite 100 Mini 1,004.8Wh power station', 'Amazon', 'Tools', 379.99, 799, amazon('B0HD6GN86Q'), 'popsci', 'strong', 'Over half off per Popular Science.'],
  ['arcteryx-beta', "Arc'teryx Beta jacket, men's", 'REI', 'Gifts', 320, 400, 'https://www.rei.com/product/228617/arcteryx-beta-jacket-mens', 'popsci', 'fair', '$80 off, a modest 20% cut on a jacket that seldom goes on sale.'],

  // ── Beauty & care ─────────────────────────────────────────────────────
  ['oral-b-io3', 'Oral-B iO Series 3 electric toothbrush', 'Amazon', 'Beauty', 59.99, 109.99, amazon('B0B5HQZ4QB'), 'nbc', 'strong', 'NBC Select: "Lowest price in over six months". Amazon\'s $109.99 "was" oversells it: Target and Oral-B list $89.99, a 33% cut.', 'Icy Blue'],
  ['oral-b-io3', 'Oral-B iO Series 3 electric toothbrush', 'Target', 'Beauty', 59.99, 89.99, 'https://www.target.com/p/oral-b-io3-electric-toothbrush-black/-/A-88693684', 'nbc', 'strong', 'The same $59.99, "lowest price in over six months".', 'Black'],
  ['oral-b-io3', 'Oral-B iO Series 3 electric toothbrush', 'Oral-B', 'Beauty', 59.99, 89.99, 'https://oralb.com/en-us/products/oral-b-io-series-3-clean-protect-rechargeable-electric-toothbrush-matte-white/', 'nbc', 'strong', 'Oral-B\'s own store matches $59.99.', 'Matte White'],
  ['medicube-zero-pore', 'Medicube Zero Pore Pad 2.0, 70 pads', 'Amazon', 'Beauty', 13.23, 18.9, amazon('B09V7Z4TJG'), 'nbc', 'strong', 'NBC Select: "Lowest price in 2026".'],
  ['medicube-zero-pore', 'Medicube Zero Pore Pad 2.0, 70 pads', 'Ulta Beauty', 'Beauty', 15.75, 21, 'https://www.ulta.com/p/zero-pore-pad-pimprod2053434?sku=264535', 'nbc', 'fair', '25% off, but $2.52 more than Amazon.'],
  ['charlotte-tilbury-lip-cheat', 'Charlotte Tilbury Lip Cheat liner, Pillow Talk', 'Sephora', 'Beauty', 19.6, 28, 'https://www.sephora.com/product/lip-cheat-lip-liner-P433516', 'nbc', 'strong', 'NBC Select: "Lowest price in over 3 months"; Amazon matches.'],
  ['charlotte-tilbury-lip-cheat', 'Charlotte Tilbury Lip Cheat liner, Pillow Talk', 'Amazon', 'Beauty', 19.6, 28, amazon('B0DL3JFSG8'), 'nbc', 'strong', 'The same $19.60 as Sephora.'],
  ['charlotte-tilbury-lip-cheat', 'Charlotte Tilbury Lip Cheat liner, Pillow Talk', 'Charlotte Tilbury', 'Beauty', 21, 28, 'https://www.charlottetilbury.com/us/product/lip-cheat-pillowtalk', 'nbc', 'fair', 'The brand\'s own store is $1.40 above Sephora and Amazon.'],
  ['color-wow-dream-coat', 'Color Wow Dream Coat Supernatural Spray', 'Amazon', 'Beauty', 21, 30, amazon('B073CWSQ51'), 'nbc', 'strong', 'NBC Select: "Lowest price in over 3 months"; $1.50 under the brand site.'],
  ['laura-geller-baked', 'Laura Geller Baked Balance-n-Brighten foundation', 'Laura Geller', 'Beauty', 14, 38, 'https://www.laurageller.com/products/baked-balance-n-brighten-color-correcting-foundation', 'yahoo', 'fair', 'A sponsored pick in Yahoo\'s blog against the brand\'s own "was" price, with no price-history claim: judge it by the $14.', 'Code BF60 at checkout'],
  ['theragun-prime-6', 'Theragun Prime (6th Gen) massage gun', 'Therabody', 'Beauty', 189.99, 329.99, 'https://www.therabody.com/products/theragun-prime-gen-6-massage-gun', 'popsci', 'strong', '$140 off at Therabody\'s own store, 42%.'],

  // ── Style & gifts ─────────────────────────────────────────────────────
  ['ugg-classic-micro', 'UGG Classic Micro boot, women\'s', 'Amazon', 'Gifts', 97.99, 139.95, amazon('B0DPRGB27N'), 'nbc', 'low', 'NBC Select: "Lowest price ever"; UGG\'s own store matches it.'],
  ['ugg-classic-micro', 'UGG Classic Micro boot, women\'s', 'UGG', 'Gifts', 97.99, 140, 'https://www.ugg.com/women-boots/classic-micro/1173891.html', 'nbc', 'low', 'The same $97.99 record low as Amazon.', 'Chestnut'],
  ['ancestrydna-kit', 'AncestryDNA genetic test kit', 'Amazon', 'Gifts', 29, 99, amazon('B00TRLVKW0'), 'nbc', 'low', 'NBC Select: "Lowest price ever", $5 under Target and Walmart.'],
  ['ancestrydna-kit', 'AncestryDNA genetic test kit', 'Target', 'Gifts', 34, 99, 'https://www.target.com/p/ancestrydna-genetic-ethnicity-test-ethnicity-estimate-ancestrydna-test-kit-health-and-personal-care/-/A-87892971', 'nbc', 'strong', '66% off, $5 above Amazon.'],
  ['ancestrydna-kit', 'AncestryDNA genetic test kit', 'Walmart', 'Gifts', 34, 99, 'https://www.walmart.com/ip/442487021', 'nbc', 'strong', '66% off, $5 above Amazon.'],
  ['toniebox-2-bluey', 'Toniebox 2 starter set, Bluey', 'Target', 'Gifts', 99, 149.99, 'https://www.target.com/p/tonies-bluey-toniebox-2-starter-set-sky-blue/-/A-1006294529', 'nbc', 'strong', 'NBC Select: "Lowest price in over 6 months"; 99¢ under Amazon and Macy\'s.', 'Sky Blue'],
  ['toniebox-2-bluey', 'Toniebox 2 starter set, Bluey', 'Amazon', 'Gifts', 99.99, 149.99, amazon('B0FJ313VDR'), 'nbc', 'strong', '99¢ above Target, the same six-month low.'],
  ['toniebox-2-bluey', 'Toniebox 2 starter set, Bluey', "Macy's", 'Gifts', 99.99, 149.99, 'https://www.macys.com/shop/product/tonies-bluey-toniebox-2-screen-free-interactive-starter-set-ages-1?ID=27115185', 'nbc', 'strong', '99¢ above Target.'],
  ['owala-freesip-24', 'Owala FreeSip 24 oz water bottle', 'Amazon', 'Gifts', 22.79, 29.99, amazon('B085DV8T75'), 'nbc', 'fair', 'NBC Select: "Lowest price in 2026", though only $7.20 off.', 'Shy Marshmallow'],
  ['owala-freesip-24', 'Owala FreeSip 24 oz water bottle', 'Walmart', 'Gifts', 23.97, 29.97, 'https://www.walmart.com/ip/785624932', 'nbc', 'fair', '20% off, $1.18 above Amazon.', 'Black'],
  ['energizer-48', 'Energizer AA + AAA batteries, 48 count', 'Amazon', 'Gifts', 21.84, 38.98, amazon('B087GMJXMC'), 'nbc', 'low', 'NBC Select: "Lowest price ever", 44% off: stock up for the toys.'],
  ['samsonite-freeform-2pc', 'Samsonite Freeform 2-piece luggage set', 'Amazon', 'Gifts', 199.99, 279.99, amazon('B01N2R4JIU'), 'nbc', 'fair', 'NBC Select: "Lowest price in over 3 months"; $25 under Samsonite\'s own store.'],
  ['hoka-arahi-8', 'Hoka Arahi 8 running shoes, women\'s', 'Hoka', 'Gifts', 120, 150, 'https://www.hoka.com/en/us/womens-everyday-running-shoes/arahi-8/1168691.html', 'yahoo', 'fair', '$30 off at Hoka itself, 20%; no price-history claim.', 'Selected colours and sizes'],
  ['kate-spade-lucy', 'Kate Spade Lucy wristlet (KE574)', 'Kate Spade Outlet', 'Gifts', 26, 139, 'https://www.katespadeoutlet.com/products/lucy-wristlet/KE574-001.html', 'yahoo', 'routine', 'Inflated: an outlet "compare at" price. Yahoo makes no low-price claim, so judge it by the $26, not the 81%.', 'Extra 10% off at checkout'],
  ['big-chill-puffer', 'Big Chill packable puffer jacket, women\'s', 'Walmart', 'Gifts', 12.5, 75, 'https://www.walmart.com/ip/250670890', 'yahoo', 'routine', 'Inflated: Yahoo pitches it as "under $15", not as a price drop; read the 83% off as marketing.', 'Price varies by size and colour'],
];

const KEYS = ['group', 'product', 'store', 'category', 'price', 'was', 'url', 'src', 'signal', 'evidence', 'terms'];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

export const deals = raw.map((row) => {
  const d = Object.fromEntries(KEYS.map((k, i) => [k, row[i]]));
  const src = SOURCES[d.src];
  return { ...d, id: `${d.group}-${slug(d.store)}`, terms: d.terms ?? '', checked: src.checked, source: src.name, sourceTitle: `${src.title} (${src.updated})`, sourceUrl: src.url };
});
