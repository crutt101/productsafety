// Third-party lab-report data: glyphosate residues (ppb) measured in retail breads.
// ppb === null means the lab reported no detectable glyphosate (typical LOD ~10 ppb).

const BREAD_SOURCES = {
  fl2026: {
    name: 'Florida Dept. of Health — "Healthy Florida First" (Feb 2026)',
    short: 'Florida DOH 2026',
    url: 'https://www.food-safety.com/articles/11118-floridas-latest-food-contaminant-testing-report-focuses-on-glyphosate-in-bread',
    detail: 'State testing of 8 breads across 5 national brands; 6 of 8 loaves had detectable glyphosate.'
  },
  detox: {
    name: 'The Detox Project × Mamavation lab investigation (2023–24)',
    short: 'Detox Project',
    url: 'https://mamavation.com/food/glyphosate-bread-oats-legumes-protein-powders-bars.html',
    detail: 'LC-MS/MS testing at an EPA-certified lab; 45 of 86 wheat-based foods tested positive, breads ranged from non-detect to 1,150 ppb.'
  },
  sour2026: {
    name: 'Mamavation sourdough investigation (Mar 2026)',
    short: 'Mamavation Sourdough 2026',
    url: 'https://mamavation.com/food/sourdough-bread-glyphosate.html',
    detail: 'Eight sourdough brands tested by LC-MS/MS at an EPA-certified lab, detection limit 10 ppb; 6 of 8 tested positive.'
  }
};

// Reference levels (ppb) for context
const GLYPHOSATE_REFS = {
  ewgChildBenchmark: 160,   // EWG child-protective health benchmark
  euMrlWheat: 10000,        // EU maximum residue level for wheat grain (10 ppm)
  epaToleranceWheat: 30000, // US EPA tolerance for wheat grain (30 ppm)
  labLod: 10                // typical lab limit of detection
};

const BREAD_TESTS = [
  // The Detox Project × Mamavation (2023–24)
  { brand: 'Village Hearth', product: '100% Whole Wheat Bread', ppb: 1150, source: 'detox' },
  { brand: '365 by Whole Foods', product: 'Whole Wheat Sandwich Bread', ppb: 1040, source: 'detox' },
  { brand: 'Pepperidge Farm', product: '100% Whole Grain Wheat Bread', ppb: 587, source: 'detox' },
  { brand: 'Pepperidge Farm', product: 'Jewish Rye & Pumpernickel Deli Swirl', ppb: 531, source: 'detox' },
  { brand: 'Market Pantry (Target)', product: '100% Whole Wheat Sandwich Bread', ppb: 348, source: 'detox' },
  { brand: 'Great Value (Walmart)', product: '100% Whole Wheat Bread', ppb: 340, source: 'detox' },
  { brand: 'Sara Lee', product: '100% Whole Wheat Bread', ppb: 284, source: 'detox' },
  { brand: 'Hy-Vee', product: '100% Whole Wheat Bread', ppb: 211, source: 'detox' },
  { brand: 'Hy-Vee', product: 'Seeded Hearty Rye Bread', ppb: 88, source: 'detox' },
  { brand: 'Great Value (Walmart)', product: 'Wheat Bread', ppb: 63, source: 'detox' },
  { brand: 'Big Sky Bread', product: 'Honey Whole Wheat', ppb: 42, source: 'detox' },
  { brand: 'Brownberry', product: 'Oatnut Whole Grains Bread', ppb: 17, source: 'detox' },
  { brand: 'Angelic Bakehouse', product: '7-Grain Sprouted Wholegrain Bread', ppb: 12, source: 'detox' },
  { brand: 'Angelic Bakehouse', product: 'Sprouted 7-Grain Rye Bread', ppb: 12, source: 'detox' },
  { brand: 'Silver Hills Sprouted Bakery', product: 'Little Big Bread (sprouted)', ppb: null, source: 'detox' },
  { brand: "Dave's Killer Bread", product: 'Organic Sprouted Whole Grains Thin-Sliced', ppb: null, source: 'detox' },

  // Florida Department of Health (Feb 2026)
  { brand: 'Sara Lee', product: 'Honey Wheat', ppb: 191.04, source: 'fl2026' },
  { brand: "Nature's Own", product: 'Butter Bread', ppb: 190.23, source: 'fl2026' },
  { brand: 'Wonder Bread', product: 'Classic White', ppb: 173.19, source: 'fl2026' },
  { brand: "Nature's Own", product: 'Perfectly Crafted White', ppb: 132.34, source: 'fl2026' },
  { brand: "Dave's Killer Bread", product: 'White Bread Done Right', ppb: 11.85, source: 'fl2026' },
  { brand: "Dave's Killer Bread", product: '21 Whole Grains & Seeds', ppb: 10.38, source: 'fl2026' },
  { brand: 'Sara Lee', product: 'Artesano Bakery Bread (White)', ppb: null, source: 'fl2026' },
  { brand: 'Pepperidge Farm', product: 'Farmhouse Hearty White', ppb: null, source: 'fl2026' },

  // Mamavation sourdough investigation (Mar 2026)
  { brand: 'Izzio', product: 'San Francisco Style Sourdough', ppb: 118, source: 'sour2026' },
  { brand: 'Sprouts', product: 'Organic San Francisco Style Sourdough', ppb: 33, source: 'sour2026' },
  { brand: '365 by Whole Foods', product: 'Organic Artisan Sourdough', ppb: 23, source: 'sour2026' },
  { brand: 'Francisco International', product: 'Extra Sourdough Bread', ppb: 17, source: 'sour2026' },
  { brand: "Nature's Own", product: 'Perfectly Crafted Thick Sliced Sourdough', ppb: 16, source: 'sour2026' },
  { brand: 'The Rustik Oven', product: 'Sourdough Bread', ppb: 10, source: 'sour2026' },
  { brand: 'San Luis', product: 'Sourdough Bread', ppb: null, source: 'sour2026' },
  { brand: "Rudi's Bakery", product: 'Organic Rocky Mountain Sourdough', ppb: null, source: 'sour2026' }
];

// Verdict helper shared by lander + bread page
function breadVerdict(ppb) {
  if (ppb === null) return { label: 'None detected', cls: 'ok', color: 'var(--ok)' };
  if (ppb >= 500) return { label: 'Very high', cls: 'danger', color: 'var(--danger-strong)' };
  if (ppb >= GLYPHOSATE_REFS.ewgChildBenchmark) return { label: 'High — above EWG benchmark', cls: 'danger', color: '#fb923c' };
  if (ppb >= 50) return { label: 'Moderate', cls: 'warn', color: 'var(--warn)' };
  return { label: 'Low', cls: 'warn', color: '#facc15' };
}
