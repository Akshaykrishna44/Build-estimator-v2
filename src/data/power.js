// Electricity board (EB) charges, substation and solar. All rates are indicative placeholders: check the current
// TNPDCL (TNEB) tariff order, the board's estimate and local quotes before relying on them.

/** Connected load in watts per sq ft of built-up area, by project type (indicative). Custom types use DEFAULT_LOAD. */
export const DEFAULT_LOAD = 5;
export const LOAD_BY_TYPE = {
  shed: 4, manuf: 12, heavy: 25, food: 14, textile: 10, pharma: 20, chem: 18, factory: 10,
  semi: 45, ev: 30, dc: 80, pwr: 3, wh: 2.5, cold: 12,
  office: 5, gcc: 6, mall: 8, hotel: 6,
  home: 1.5, villa: 2, apt: 1.5, afford: 1, hostel: 1.5,
  hospital: 7, school: 2, civic: 3, carpark: 1, transit: 5,
};

/** Project types that always need their own substation, whatever the size. */
export const SUBSTATION_ALWAYS = ['pwr', 'dc', 'semi', 'ev', 'heavy'];

/** Standard distribution transformer ratings in kVA. */
export const TRANSFORMER_KVA = [63, 100, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500];

/**
 * Power items. grp: 'eb' = paid to the electricity board (outside overhead and GST); 'sub' = built by the contractor.
 * cls: lt = only on an LT supply, ht = only with a substation (HT supply), all = always.
 * basis: kva = demand kVA, trf = transformer kVA, kw = connected kW, fix = a fixed quantity q.
 * hpu = electrician man-hours per unit (contractor items only).
 */
export const DEFAULT_POWER_ITEMS = [
  { id: 1, grp: 'eb', cls: 'lt', basis: 'kva', name: 'Service connection and development charges (LT)', unit: 'kVA', q: 1, rate: 1500, hpu: 0 },
  { id: 2, grp: 'eb', cls: 'ht', basis: 'kva', name: 'Service connection and development charges (HT)', unit: 'kVA', q: 1, rate: 1200, hpu: 0 },
  { id: 3, grp: 'eb', cls: 'all', basis: 'kva', name: 'Security deposit (refundable, held by the board)', unit: 'kVA', q: 1, rate: 1500, hpu: 0, refund: true },
  { id: 4, grp: 'eb', cls: 'lt', basis: 'fix', name: 'Meter and metering board (LT)', unit: 'set', q: 1, rate: 12000, hpu: 0 },
  { id: 5, grp: 'eb', cls: 'ht', basis: 'fix', name: 'HT metering cubicle with CT and PT', unit: 'set', q: 1, rate: 150000, hpu: 0 },
  { id: 6, grp: 'eb', cls: 'ht', basis: 'fix', name: 'HT line extension, poles and feeder (board estimate)', unit: 'lot', q: 1, rate: 800000, hpu: 0 },
  { id: 7, grp: 'eb', cls: 'all', basis: 'fix', name: 'Temporary power connection for construction', unit: 'lot', q: 1, rate: 25000, hpu: 0 },
  { id: 8, grp: 'eb', cls: 'all', basis: 'fix', name: 'Registration, inspection and supervision fees', unit: 'lot', q: 1, rate: 15000, hpu: 0 },
  { id: 9, grp: 'sub', cls: 'lt', basis: 'kw', name: 'Service cable and LT main panel', unit: 'kW', q: 1, rate: 1500, hpu: 0.4 },
  { id: 10, grp: 'sub', cls: 'ht', basis: 'trf', name: 'Distribution transformer (11 kV or 22 kV to 415 V)', unit: 'kVA', q: 1, rate: 1200, hpu: 0.12 },
  { id: 11, grp: 'sub', cls: 'ht', basis: 'fix', name: 'HT switchgear, ring main unit and VCB panel', unit: 'set', q: 1, rate: 600000, hpu: 120 },
  { id: 12, grp: 'sub', cls: 'ht', basis: 'trf', name: 'LT main panel (PCC) with ACB', unit: 'kVA', q: 1, rate: 1100, hpu: 0.1 },
  { id: 13, grp: 'sub', cls: 'ht', basis: 'kva', name: 'Automatic power factor correction (capacitor) panel', unit: 'kVA', q: 1, rate: 450, hpu: 0.05 },
  { id: 14, grp: 'sub', cls: 'ht', basis: 'kw', name: 'HT and LT cabling (XLPE) and termination', unit: 'kW', q: 1, rate: 700, hpu: 0.25 },
  { id: 15, grp: 'sub', cls: 'ht', basis: 'fix', name: 'Substation earthing pits and strips', unit: 'pit', q: 4, rate: 35000, hpu: 16 },
  { id: 16, grp: 'sub', cls: 'ht', basis: 'fix', name: 'Transformer plinth, oil pit, fencing and yard civil work', unit: 'lot', q: 1, rate: 350000, hpu: 160 },
  { id: 17, grp: 'sub', cls: 'ht', basis: 'fix', name: 'Testing, commissioning and electrical inspectorate approval', unit: 'lot', q: 1, rate: 75000, hpu: 60 },
];

/** Rooftop solar system types (all builds). rate = supply and installation per kWp of panels, excluding the mounting. */
export const SOLAR_TYPES = {
  on: { name: 'On-grid (grid-tied, no battery)', note: 'Feeds the building and the grid. Needs the board\'s net-metering approval. Stops in a power cut.', rate: 45000, hpk: 14, fee: 25000, battery: false },
  hybrid: { name: 'Hybrid (grid and battery)', note: 'Grid-tied with a battery that runs the building in a power cut.', rate: 85000, hpk: 20, fee: 25000, battery: true },
  off: { name: 'Off-grid (battery, no grid)', note: 'Stand-alone system with a battery bank. For sites without a reliable grid.', rate: 95000, hpk: 22, fee: 0, battery: true },
};

/** Mounting types. area = roof area in sq ft needed per kWp. rate = mounting structure per kWp. */
export const SOLAR_MOUNTS = {
  rcc: { name: 'RCC flat roof (tilted frame)', area: 110, rate: 5000, hpk: 6, roof: true },
  sheet: { name: 'Metal sheet roof (clamp-on rails)', area: 85, rate: 3000, hpk: 4, roof: true },
  ground: { name: 'Ground-mounted (own land, enter the size)', area: 0, rate: 8000, hpk: 8, roof: false },
};

/** Industrial project types where solar installation is included automatically. */
export const SOLAR_AUTO = ['shed', 'manuf', 'heavy', 'food', 'textile', 'pharma', 'chem', 'factory', 'semi', 'ev', 'dc', 'wh', 'cold'];

/** Project types whose usual roof is metal sheet. Others default to an RCC roof. */
export const SHEET_ROOF = ['shed', 'wh', 'manuf', 'textile', 'heavy', 'cold', 'food'];

export const DEFAULT_POWER = { mode: 'on', loadMode: 'auto', loadKw: '', pf: 0.9, df: 0.7, margin: 20, subMode: 'auto', threshold: 112 };
export const DEFAULT_SOLAR = { mode: 'auto', sys: 'on', mount: 'auto', sizeMode: 'roof', kwp: '', usable: 60, yield: 1450 };
