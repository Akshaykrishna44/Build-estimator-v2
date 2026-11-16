// Interior design: fit-out items priced per quantity (supplied and fixed), with man-hours per unit.
// q is the quantity per 1000 sq ft of built-up area for a typical building. Rates are indicative 2026 market values.
export const INTERIOR_LEVELS = {
  economy: { name: 'Economy', mult: 0.7 },
  standard: { name: 'Standard', mult: 1 },
  premium: { name: 'Premium', mult: 1.5 },
  luxury: { name: 'Luxury', mult: 2.2 },
};

export const DEFAULT_INTERIOR_ITEMS = [
  { id: 1, name: 'False ceiling (gypsum board on GI grid)', unit: 'sq ft', q: 600, rate: 110, hpu: 0.1 },
  { id: 2, name: 'Premium flooring over the basic floor (vitrified, wood or marble)', unit: 'sq ft', q: 800, rate: 130, hpu: 0.15 },
  { id: 3, name: 'Wall paneling and feature walls', unit: 'sq ft', q: 120, rate: 260, hpu: 0.18 },
  { id: 4, name: 'Modular kitchen with counter and appliances space', unit: 'nos', q: 0.8, rate: 180000, hpu: 60 },
  { id: 5, name: 'Wardrobes and built-in storage', unit: 'sq ft', q: 90, rate: 1400, hpu: 0.45 },
  { id: 6, name: 'Loose furniture (beds, sofas, tables, chairs)', unit: 'set', q: 1, rate: 150000, hpu: 8 },
  { id: 7, name: 'Office workstations and cabins', unit: 'nos', q: 6, rate: 14000, hpu: 2 },
  { id: 8, name: 'Glass and office partitions', unit: 'sq ft', q: 80, rate: 650, hpu: 0.25 },
  { id: 9, name: 'Decorative lighting fixtures', unit: 'nos', q: 14, rate: 1800, hpu: 0.6 },
  { id: 10, name: 'Curtains, blinds and soft furnishing', unit: 'sq ft', q: 60, rate: 180, hpu: 0.05 },
  { id: 11, name: 'Bathroom fittings and sanitaryware upgrade', unit: 'set', q: 1.2, rate: 45000, hpu: 6 },
  { id: 12, name: 'Reception, branding, signage and wall decor', unit: 'set', q: 0.5, rate: 60000, hpu: 4 },
];

// Building types that normally need interior design. f scales every quantity; m changes single items (0 removes the item).
export const INTERIOR_BY_TYPE = {
  office: { f: 1, m: { 4: 0, 5: 0.4, 6: 0.1, 11: 0.3, 7: 1.5, 8: 1.5 } },
  gcc: { f: 1, m: { 4: 0.2, 5: 0.3, 6: 0.1, 11: 0.4, 7: 2, 8: 1.5 } },
  mall: { f: 1.2, m: { 4: 0, 5: 0.1, 6: 0, 7: 0, 11: 0.3, 8: 2, 12: 3 } },
  hotel: { f: 1.3, m: { 4: 0.2, 5: 1.3, 6: 1.5, 7: 0.1, 8: 0.3, 11: 2, 12: 2 } },
  home: { f: 1, m: { 7: 0, 8: 0, 12: 0 } },
  villa: { f: 1.4, m: { 7: 0, 8: 0, 12: 0, 3: 1.5, 9: 1.5 } },
  apt: { f: 1, m: { 7: 0, 8: 0, 12: 0.3 } },
  afford: { f: 0.5, m: { 7: 0, 8: 0, 12: 0, 3: 0.3, 9: 0.5 } },
  hostel: { f: 0.6, m: { 4: 0.2, 6: 0.6, 7: 0, 8: 0, 12: 0.3 } },
  hospital: { f: 0.9, m: { 4: 0, 5: 0.3, 6: 0.3, 7: 0.5, 8: 2, 11: 1.5, 12: 1 } },
  school: { f: 0.6, m: { 4: 0, 5: 0.1, 6: 1.2, 7: 0.3, 8: 0.5, 11: 0.8, 12: 0.5 } },
  civic: { f: 0.7, m: { 4: 0, 5: 0.2, 6: 0.3, 7: 1, 8: 0.8, 12: 1 } },
  pharma: { f: 0.2, m: { 4: 0, 5: 0, 6: 0, 7: 2, 8: 4, 11: 0.5, 12: 0.5 } },
  dc: { f: 0.15, m: { 4: 0, 5: 0, 6: 0, 7: 2, 8: 2, 11: 0.5, 12: 1 } },
  semi: { f: 0.15, m: { 4: 0, 5: 0, 6: 0, 7: 2, 8: 2, 11: 0.5, 12: 1 } },
};
