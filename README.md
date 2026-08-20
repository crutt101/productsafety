# ToxiScan

Scan any food barcode and get a **toxicity score out of 100** — flagging possible
carcinogens, additives banned in other countries, and glyphosate risk. Includes a
special report on **glyphosate in bread**, built from third-party lab data.

## Pages

| Page | What it does |
|---|---|
| `index.html` | Lander with the **Top Toxic Breads** leaderboard from independent lab reports |
| `scanner.html` | Camera barcode scanner (EAN/UPC) → Open Food Facts lookup → score /100 with per-ingredient flags. Also accepts typed barcodes or pasted ingredient lists |
| `bread.html` | Bread & glyphosate deep dive: sortable table of every bread tested by the Florida DOH (2026), The Detox Project × Mamavation, and Mamavation's sourdough investigation (2026) |

## How scoring works

Every product starts at 100. Each matched ingredient in `js/toxins.js` deducts
severity-weighted points, based on:

- **Carcinogen classifications** — IARC Groups 1/2A/2B, NTP listings (potassium bromate, Red 3, BHA, titanium dioxide, aspartame…)
- **Banned or restricted abroad** — EU/UK/Japan/Canada bans (azodicarbonamide, BVO, bleached flour, propylparaben…)
- **Other documented concerns** — endocrine disruption, nitrosamine formation, gut-microbiome effects
- **Glyphosate risk** — non-organic wheat/oat products get an automatic contextual flag

Matching runs against both the raw ingredient text and Open Food Facts additive
E-codes (`additives_tags`).

## Running it

Static site — no build step. Serve the folder over HTTPS (camera access requires
a secure context):

```bash
npx serve .        # or python3 -m http.server
```

Or enable **GitHub Pages** on this repo (Settings → Pages → deploy from branch)
and it works as-is.

## Tech

- Vanilla HTML/CSS/JS, [Outfit](https://fonts.google.com/specimen/Outfit) typeface
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) for camera barcode scanning
- [Open Food Facts API](https://world.openfoodfacts.org/data) (ODbL) for product/ingredient data

## Data sources for the bread report

- [Florida Dept. of Health "Healthy Florida First" bread testing, Feb 2026](https://www.food-safety.com/articles/11118-floridas-latest-food-contaminant-testing-report-focuses-on-glyphosate-in-bread)
- [The Detox Project × Mamavation bread/wheat investigation](https://mamavation.com/food/glyphosate-bread-oats-legumes-protein-powders-bars.html)
- [Mamavation sourdough glyphosate investigation, Mar 2026](https://mamavation.com/food/sourdough-bread-glyphosate.html)
- [Moms Across America fast-food testing, 2023](https://www.momsacrossamerica.com/lab-reports/fast-food-glyphosate)

**Disclaimer:** informational only, not medical advice. All glyphosate levels
shown are below current US EPA tolerances.
