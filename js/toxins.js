// ToxiScan ingredient hazard database.
// Each entry: display name, penalty points deducted from 100, text patterns
// matched against the ingredient list, Open Food Facts additive E-codes,
// regulatory/health flags, and a short note.
// Severity is derived from points: >=18 severe, >=10 high, >=5 moderate, else low.

const TOXIN_DB = [
  {
    id: 'potassium_bromate',
    name: 'Potassium bromate',
    points: 25,
    patterns: ['potassium bromate', 'bromated flour', 'bromated'],
    ecodes: ['e924'],
    flags: ['Possible carcinogen — IARC Group 2B', 'Banned in the EU, UK, Canada, Brazil, China & India', 'Banned in California from 2027 (AB 418)'],
    note: 'Flour "improver" that causes kidney and thyroid tumors in animal studies. Legal in most of the US, outlawed across much of the world.'
  },
  {
    id: 'trans_fat',
    name: 'Partially hydrogenated oils (artificial trans fat)',
    points: 25,
    patterns: ['partially hydrogenated'],
    ecodes: [],
    flags: ['Banned in the US (FDA determination, effective 2018–2020)', 'WHO target for global elimination', 'Strongly linked to heart disease'],
    note: 'Artificial trans fats raise LDL and lower HDL cholesterol. If this still appears on a label, the product predates or evades the ban.'
  },
  {
    id: 'red_3',
    name: 'Red Dye No. 3 (erythrosine)',
    points: 22,
    patterns: ['red 3', 'red no 3', 'erythrosine', 'fd&c red 3'],
    ecodes: ['e127'],
    flags: ['Causes cancer in animal studies', 'FDA revoked authorization (Jan 2025, compliance by 2027)', 'Banned in EU food (narrow exceptions)'],
    note: 'Synthetic dye shown to cause thyroid tumors in rats — banned from US cosmetics since 1990, only recently from food.'
  },
  {
    id: 'bvo',
    name: 'Brominated vegetable oil (BVO)',
    points: 22,
    patterns: ['brominated vegetable oil', 'brominated soybean oil'],
    ecodes: ['e443'],
    flags: ['FDA revoked authorization (2024)', 'Banned in the EU, Japan & India', 'Thyroid & neurological toxicity in animal studies'],
    note: 'Citrus-drink emulsifier that accumulates bromine in body fat. Removed from the US food supply in 2024 after decades of concern.'
  },
  {
    id: 'azodicarbonamide',
    name: 'Azodicarbonamide (ADA)',
    points: 18,
    patterns: ['azodicarbonamide'],
    ecodes: ['e927a'],
    flags: ['Banned in the EU & Australia', 'Breaks down into semicarbazide & urethane — possible carcinogens', 'Also used to make foamed plastics'],
    note: 'The "yoga mat" dough conditioner. When baked it forms breakdown products that raised cancer concerns in international reviews.'
  },
  {
    id: 'titanium_dioxide',
    name: 'Titanium dioxide',
    points: 18,
    patterns: ['titanium dioxide'],
    ecodes: ['e171'],
    flags: ['Banned in EU food (2022)', 'EFSA: genotoxicity cannot be ruled out', 'Possible carcinogen when inhaled — IARC 2B'],
    note: 'Whitening pigment in candy, gum and frosting. The EU withdrew it after its safety authority could not rule out DNA damage from nanoparticles.'
  },
  {
    id: 'nitrite',
    name: 'Sodium nitrite',
    points: 15,
    patterns: ['sodium nitrite'],
    ecodes: ['e250'],
    flags: ['Forms nitrosamines — probable human carcinogens', 'Processed meat is IARC Group 1', 'EU tightened limits in 2025'],
    note: 'Curing salt in bacon, deli meat and hot dogs. Reacts with proteins during cooking and digestion to form nitrosamines.'
  },
  {
    id: 'revoked_flavors',
    name: 'FDA-revoked synthetic flavors',
    points: 15,
    patterns: ['benzophenone', 'ethyl acrylate', 'methyl eugenol', 'pulegone', 'pyridine (flavor)', 'styrene'],
    ecodes: [],
    flags: ['FDA revoked authorization (2018) as carcinogenic flavor substances'],
    note: 'Six synthetic flavoring chemicals delisted after they were shown to cause cancer in animals.'
  },
  {
    id: 'bha',
    name: 'BHA (butylated hydroxyanisole)',
    points: 14,
    patterns: ['bha', 'butylated hydroxyanisole'],
    ecodes: ['e320'],
    flags: ['Possible carcinogen — IARC Group 2B', 'Listed under California Prop 65', 'Restricted in parts of the EU & Japan'],
    note: 'Petroleum-derived preservative that keeps fats from going rancid; "reasonably anticipated to be a human carcinogen" per the US National Toxicology Program.'
  },
  {
    id: 'nitrate',
    name: 'Sodium / potassium nitrate',
    points: 12,
    patterns: ['sodium nitrate', 'potassium nitrate'],
    ecodes: ['e251', 'e252'],
    flags: ['Converts to nitrite, then nitrosamines', 'Processed-meat curing agent'],
    note: 'Slow-release curing salt with the same downstream nitrosamine chemistry as sodium nitrite.'
  },
  {
    id: 'propylparaben',
    name: 'Propylparaben',
    points: 12,
    patterns: ['propylparaben', 'propyl paraben', 'propyl p-hydroxybenzoate'],
    ecodes: ['e216', 'e217'],
    flags: ['Suspected endocrine disruptor', 'Removed from EU approved food additives (2006)', 'Banned in California from 2027 (AB 418)'],
    note: 'Preservative in some tortillas and baked goods; mimics estrogen and affected sperm production in animal studies.'
  },
  {
    id: 'tbhq',
    name: 'TBHQ (tert-butylhydroquinone)',
    points: 10,
    patterns: ['tbhq', 'tertiary butylhydroquinone', 'tert-butylhydroquinone'],
    ecodes: ['e319'],
    flags: ['Tumor promotion at high doses in animal studies', 'May impair immune response (EWG analysis)', 'FDA caps it at 0.02% of oil content'],
    note: 'Synthetic antioxidant that keeps fried snacks and instant noodles shelf-stable.'
  },
  {
    id: 'potassium_iodate',
    name: 'Potassium iodate',
    points: 8,
    patterns: ['potassium iodate'],
    ecodes: ['e917'],
    flags: ['Flour treatment banned in the EU, UK & many countries'],
    note: 'Oxidizing dough conditioner; excess iodate exposure can disturb thyroid function.'
  },
  {
    id: 'propyl_gallate',
    name: 'Propyl gallate',
    points: 8,
    patterns: ['propyl gallate'],
    ecodes: ['e310'],
    flags: ['Mixed carcinogenicity evidence (NTP)', 'Suspected endocrine activity'],
    note: 'Preservative often used alongside BHA/BHT in fats, meats and snack foods.'
  },
  {
    id: 'aluminum',
    name: 'Aluminum-based additives',
    points: 8,
    patterns: ['sodium aluminum phosphate', 'sodium aluminium phosphate', 'sodium aluminum sulfate', 'aluminum sulfate', 'sodium alum'],
    ecodes: ['e541'],
    flags: ['EU sharply restricted aluminum additives (2014)', 'Neurotoxicity concerns at chronic high intakes'],
    note: 'Leavening agents in some baking powders, pancake mixes and processed cheeses.'
  },
  {
    id: 'aspartame',
    name: 'Aspartame',
    points: 8,
    patterns: ['aspartame'],
    ecodes: ['e951'],
    flags: ['Possible carcinogen — IARC Group 2B (2023)', 'PKU warning required'],
    note: 'Artificial sweetener classified by IARC as possibly carcinogenic in 2023; regulators still consider normal intakes safe.'
  },
  {
    id: 'red_40',
    name: 'Red Dye No. 40 (Allura Red)',
    points: 8,
    patterns: ['red 40', 'red no 40', 'allura red'],
    ecodes: ['e129'],
    flags: ['EU warning label: "may have an adverse effect on activity and attention in children"', 'Banned from California school food (2024 law)', 'May carry benzidine traces (carcinogen)'],
    note: 'The most-used synthetic food dye in the US; linked to behavioral effects in sensitive children.'
  },
  {
    id: 'yellow_5',
    name: 'Yellow Dye No. 5 (tartrazine)',
    points: 8,
    patterns: ['yellow 5', 'yellow no 5', 'tartrazine'],
    ecodes: ['e102'],
    flags: ['EU warning label for children\'s behavior', 'Banned from California school food (2024 law)', 'Known hypersensitivity reactions'],
    note: 'Azo dye tied to hyperactivity in the Southampton study that triggered EU warning labels.'
  },
  {
    id: 'yellow_6',
    name: 'Yellow Dye No. 6 (Sunset Yellow)',
    points: 8,
    patterns: ['yellow 6', 'yellow no 6', 'sunset yellow'],
    ecodes: ['e110'],
    flags: ['EU warning label for children\'s behavior', 'Banned from California school food (2024 law)', 'May carry benzidine traces'],
    note: 'Azo dye in candy, chips and sodas; same behavioral-warning class as Red 40 and Yellow 5.'
  },
  {
    id: 'green_3',
    name: 'Green Dye No. 3 (Fast Green)',
    points: 6,
    patterns: ['green 3', 'green no 3', 'fast green'],
    ecodes: ['e143'],
    flags: ['Banned in the EU', 'Bladder tumors in animal studies'],
    note: 'Rarely used synthetic dye that never won EU approval.'
  },
  {
    id: 'caramel_color',
    name: 'Caramel color (Class III/IV)',
    points: 6,
    patterns: ['caramel color', 'caramel colour'],
    ecodes: ['e150c', 'e150d'],
    flags: ['Ammonia-process versions contain 4-MeI — IARC 2B', 'California Prop 65 threshold for 4-MeI'],
    note: 'The brown in colas and soy sauces. Ammonia-processed classes carry the byproduct 4-methylimidazole.'
  },
  {
    id: 'carrageenan',
    name: 'Carrageenan',
    points: 6,
    patterns: ['carrageenan'],
    ecodes: ['e407'],
    flags: ['Degraded form is IARC 2B', 'Gut-inflammation concerns', 'Removed from EU infant formula'],
    note: 'Seaweed-derived thickener; the debate centers on whether food-grade carrageenan degrades in the gut.'
  },
  {
    id: 'bleached_flour',
    name: 'Bleached flour',
    points: 6,
    patterns: ['bleached'],
    ecodes: [],
    flags: ['Bleaching agents (benzoyl peroxide, chlorine dioxide) banned in the EU & UK'],
    note: 'Chemically whitened flour. European bakers age flour naturally instead.'
  },
  {
    id: 'bht',
    name: 'BHT (butylated hydroxytoluene)',
    points: 8,
    patterns: ['bht', 'butylated hydroxytoluene'],
    ecodes: ['e321'],
    flags: ['Suspected endocrine disruptor', 'Banned or restricted in Japan & parts of the EU', 'Liver effects in animal studies'],
    note: 'Cereal-bag preservative chemically related to BHA; evidence is mixed but many brands have quietly dropped it.'
  },
  {
    id: 'hfcs',
    name: 'High-fructose corn syrup',
    points: 5,
    patterns: ['high fructose corn syrup', 'high-fructose corn syrup'],
    ecodes: [],
    flags: ['Linked to obesity, fatty liver & type 2 diabetes at high intakes'],
    note: 'Ultra-processed sweetener; a marker of low-quality formulation more than acute toxicity.'
  },
  {
    id: 'saccharin',
    name: 'Saccharin',
    points: 5,
    patterns: ['saccharin'],
    ecodes: ['e954'],
    flags: ['Formerly on the US carcinogen list (delisted 2000)', 'Gut microbiome effects in human trials'],
    note: 'The oldest artificial sweetener; its rat-bladder-tumor mechanism was later judged not human-relevant.'
  },
  {
    id: 'acesulfame',
    name: 'Acesulfame potassium',
    points: 5,
    patterns: ['acesulfame'],
    ecodes: ['e950'],
    flags: ['Limited long-term safety data', 'Gut microbiome effects in animal studies'],
    note: 'Zero-calorie sweetener that survives baking; often paired with sucralose or aspartame.'
  },
  {
    id: 'polysorbate',
    name: 'Polysorbates (60/65/80)',
    points: 5,
    patterns: ['polysorbate'],
    ecodes: ['e433', 'e435', 'e436'],
    flags: ['Emulsifiers linked to gut-microbiome disruption & inflammation in animal studies'],
    note: 'Synthetic emulsifiers in ice cream and baked goods studied for effects on the intestinal barrier.'
  },
  {
    id: 'sucralose',
    name: 'Sucralose',
    points: 4,
    patterns: ['sucralose'],
    ecodes: ['e955'],
    flags: ['Sucralose-6-acetate showed DNA damage in lab studies', 'Gut microbiome effects'],
    note: 'Chlorinated sugar derivative sold as Splenda; heat can create compounds of emerging concern.'
  },
  {
    id: 'sulfites',
    name: 'Sulfites',
    points: 4,
    patterns: ['sodium metabisulfite', 'potassium metabisulfite', 'sulfur dioxide', 'sodium bisulfite', 'sodium sulfite'],
    ecodes: ['e220', 'e223', 'e224'],
    flags: ['Major allergen — can trigger asthma attacks', 'Banned on fresh produce in the US since 1986'],
    note: 'Preservative in dried fruit and wine; one of the FDA\'s mandatory-label allergens.'
  },
  {
    id: 'sodium_benzoate',
    name: 'Sodium / potassium benzoate',
    points: 4,
    patterns: ['sodium benzoate', 'potassium benzoate'],
    ecodes: ['e211', 'e212'],
    flags: ['Can form benzene (a known carcinogen) with vitamin C', 'Hyperactivity link in the Southampton study'],
    note: 'Common drink preservative; the benzene risk appears when combined with ascorbic acid and heat or light.'
  },
  {
    id: 'cmc',
    name: 'Cellulose gum (CMC)',
    points: 4,
    patterns: ['carboxymethylcellulose', 'carboxymethyl cellulose', 'cellulose gum'],
    ecodes: ['e466'],
    flags: ['Emulsifier linked to gut inflammation in a human trial'],
    note: 'Thickener under new scrutiny after controlled-feeding studies showed microbiome shifts.'
  },
  {
    id: 'phosphates',
    name: 'Added phosphates',
    points: 3,
    patterns: ['sodium phosphate', 'disodium phosphate', 'trisodium phosphate', 'sodium acid pyrophosphate', 'sodium hexametaphosphate', 'sodium tripolyphosphate'],
    ecodes: ['e339', 'e450', 'e451', 'e452'],
    flags: ['High phosphate load linked to cardiovascular & kidney strain'],
    note: 'Highly absorbable inorganic phosphorus used in processed meats, sodas and baked goods.'
  },
  {
    id: 'calcium_propionate',
    name: 'Calcium / sodium propionate',
    points: 3,
    patterns: ['calcium propionate', 'sodium propionate'],
    ecodes: ['e281', 'e282'],
    flags: ['Mold inhibitor; irritability/behavior links in small studies'],
    note: 'The standard commercial-bread preservative. Low acute risk, but a marker of industrial bread.'
  },
  {
    id: 'datem',
    name: 'DATEM',
    points: 3,
    patterns: ['datem', 'diacetyl tartaric'],
    ecodes: ['e472e'],
    flags: ['Dough conditioner; heart-tissue effects in one animal study'],
    note: 'Emulsifier that gives industrial bread its uniform crumb.'
  },
  {
    id: 'mono_diglycerides',
    name: 'Mono- and diglycerides',
    points: 3,
    patterns: ['monoglycerides', 'mono- and diglycerides', 'mono and diglycerides', 'diglycerides'],
    ecodes: ['e471'],
    flags: ['Can carry trans fats that don\'t count toward the label'],
    note: 'Emulsifiers classified as fats rather than trans fats, creating a labeling loophole.'
  },
  {
    id: 'edta',
    name: 'Calcium disodium EDTA',
    points: 3,
    patterns: ['edta'],
    ecodes: ['e385'],
    flags: ['Chelator; mineral-depletion concerns at high intakes'],
    note: 'Binds trace metals to keep dressings and sauces from discoloring.'
  },
  {
    id: 'dimethylpolysiloxane',
    name: 'Dimethylpolysiloxane',
    points: 3,
    patterns: ['dimethylpolysiloxane'],
    ecodes: ['e900'],
    flags: ['Silicone anti-foaming agent; marker of ultra-processed frying oil'],
    note: 'The same silicone family used in caulk; keeps fryer oil from foaming in fast-food kitchens.'
  },
  {
    id: 'natamycin',
    name: 'Natamycin',
    points: 3,
    patterns: ['natamycin'],
    ecodes: ['e235'],
    flags: ['Antifungal antibiotic; EU limits it to cheese/sausage surfaces only'],
    note: 'An antibiotic used as a preservative in some shredded cheeses and baked goods.'
  },
  {
    id: 'msg',
    name: 'Monosodium glutamate (MSG)',
    points: 2,
    patterns: ['monosodium glutamate', 'msg'],
    ecodes: ['e621'],
    flags: ['Generally recognized as safe; sensitivity reactions reported'],
    note: 'Flavor enhancer with a poor reputation but a fairly clean safety record; flagged for transparency.'
  },
  {
    id: 'artificial_flavor',
    name: 'Artificial flavors',
    points: 2,
    patterns: ['artificial flavor', 'artificial flavour', 'artificially flavored'],
    ecodes: [],
    flags: ['Undisclosed synthetic chemicals'],
    note: 'A catch-all term that can hide dozens of unlisted compounds.'
  }
];

// Special contextual flag added by the scoring engine, not matched from text:
const GLYPHOSATE_RISK = {
  id: 'glyphosate_risk',
  name: 'Glyphosate residue risk (non-organic wheat/oats)',
  points: 5,
  flags: ['Probable carcinogen — IARC Group 2A (2015)', 'Used as a pre-harvest desiccant on wheat & oats', 'Detected in most conventional breads tested'],
  note: 'This product contains non-organic wheat or oats. Independent lab tests routinely find glyphosate residues in conventional wheat products — see our Bread & Glyphosate report.'
};
