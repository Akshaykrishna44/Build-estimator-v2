import { DEFAULT_ITEMS } from '../data/items.js';
import { DEFAULT_TRADES } from '../data/trades.js';
import { MATERIALS, CATALOG, DEFAULT_GRADE } from '../data/materials.js';
import { DOOR_TYPES, DEFAULT_DOORS } from '../data/doors.js';
import { DEFAULT_INTERIOR_ITEMS } from '../data/interior.js';
import { DEFAULT_POWER, DEFAULT_POWER_ITEMS, DEFAULT_SOLAR, SOLAR_TYPES, SOLAR_MOUNTS } from '../data/power.js';
import { applyBasis } from './basis.js';

/** A new project starts empty: the user chooses the type and gives the size and schedule. */
export const DEFAULT_INPUTS = {
  type: '', land: '', landUnit: 'sqft', landPrice: '', landPriceUnit: 'sqft',
  len: '', wid: '', hgt: '', floors: '', days: '', hpd: '8', loc: '1',
  oh: '8', ct: '10', gst: '18', cap: '', lablim: '35', basis: 'tn', station: '115', customIndex: '115',
};

/** An example project, loaded only when the user asks for it. */
export const SAMPLE_PROJECT = { type: 'shed', land: '100000', landUnit: 'sqft', len: '200', wid: '108', hgt: '24', floors: '1', days: '120' };

const clone = (x) => JSON.parse(JSON.stringify(x));

/** A fresh state with the Tamil Nadu PWD basis applied. */
export function createInitialState() {
  const catalog = clone(CATALOG);
  const materials = {};
  for (const m of MATERIALS) {
    const sel = DEFAULT_GRADE[m.key] || 0;
    materials[m.key] = { name: m.name, unit: m.unit, waste: m.waste, custom: false, sel, rate: catalog[m.key][sel].rate, ovr: 0 };
  }
  const base = {
    inputs: { ...DEFAULT_INPUTS }, items: clone(DEFAULT_ITEMS), trades: clone(DEFAULT_TRADES),
    materials, catalog, doors: clone(DEFAULT_DOORS), doorTypes: clone(DOOR_TYPES), ctypes: [],
    interior: { mode: 'auto', level: 'standard', items: clone(DEFAULT_INTERIOR_ITEMS) },
    power: { ...DEFAULT_POWER, items: clone(DEFAULT_POWER_ITEMS) },
    solar: { ...DEFAULT_SOLAR, types: clone(SOLAR_TYPES), mounts: clone(SOLAR_MOUNTS) },
  };
  return applyBasis(base, 'tn');
}
