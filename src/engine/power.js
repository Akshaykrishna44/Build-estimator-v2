import { toNumber as n } from './units.js';
import { DEFAULT_LOAD, LOAD_BY_TYPE, SUBSTATION_ALWAYS, TRANSFORMER_KVA, SOLAR_AUTO, SHEET_ROOF } from '../data/power.js';

/** The smallest standard transformer that carries kva. Above the largest rating, several of the largest are used. */
export function transformerFor(kva) {
  const max = TRANSFORMER_KVA[TRANSFORMER_KVA.length - 1];
  if (!(kva > 0)) return { kva: 0, units: 0 };
  if (kva > max) { const units = Math.ceil(kva / max); return { kva: units * max, units }; }
  return { kva: TRANSFORMER_KVA.find((r) => r >= kva), units: 1 };
}

/**
 * Power supply: connected load (kW), demand (kVA), whether a substation is needed, the transformer, and two cost groups.
 * EB charges (paid to the electricity board) stay outside overhead and GST; substation and incoming-supply work is built by the contractor.
 */
export function powerEstimate(state, builtUpSqft, L = 1) {
  const P = state.power;
  const out = { on: false, loadKw: 0, demandKva: 0, kva: 0, trfKva: 0, trfUnits: 0, substation: false, cls: 'lt', ebRows: [], subRows: [], ebCost: 0, refundable: 0, subCost: 0, hours: 0, warn: [], whyAuto: '' };
  if (!P || P.mode === 'off' || !state.inputs.type) return out;
  out.on = true;
  const type = state.inputs.type;
  const wpsf = LOAD_BY_TYPE[type] !== undefined ? LOAD_BY_TYPE[type] : DEFAULT_LOAD;
  out.loadKw = P.loadMode === 'manual' ? Math.max(n(P.loadKw), 0) : (builtUpSqft * wpsf) / 1000;
  const pf = Math.min(Math.max(n(P.pf) || 0.9, 0.1), 1), df = Math.max(n(P.df) || 0, 0);
  out.demandKva = (out.loadKw * df) / pf;
  const required = out.demandKva * (1 + Math.max(n(P.margin), 0) / 100);
  out.kva = Math.ceil(required);
  const over = required > Math.max(n(P.threshold), 0);
  const always = SUBSTATION_ALWAYS.includes(type);
  out.substation = P.subMode === 'yes' || (P.subMode !== 'no' && (always || over));
  out.whyAuto = P.subMode === 'yes' ? 'You chose to include a substation.' : P.subMode === 'no' ? 'You chose no substation.'
    : always ? 'This project type always needs its own substation.' : over ? `The demand of ${out.kva} kVA is above the ${n(P.threshold)} kVA limit for an LT supply.` : `The demand of ${out.kva} kVA is within the ${n(P.threshold)} kVA limit, so an LT supply is enough.`;
  out.cls = out.substation ? 'ht' : 'lt';
  if (out.substation) { const t = transformerFor(required); out.trfKva = t.kva; out.trfUnits = t.units; }
  else if (over) out.warn.push('The demand is above the LT limit but no substation is selected. Check with the board.');
  const base = { kva: out.kva, kw: out.loadKw, trf: out.trfKva, fix: 1 };
  for (const it of P.items) {
    if (it.cls !== 'all' && it.cls !== out.cls) continue;
    const qty = base[it.basis] * n(it.q);
    if (!(qty > 0)) continue;
    if (it.grp === 'eb') {
      const cost = qty * n(it.rate);
      out.ebRows.push({ id: it.id, name: it.name, unit: it.unit, qty, rate: n(it.rate), cost, refund: !!it.refund });
      out.ebCost += cost; if (it.refund) out.refundable += cost;
    } else {
      const rate = n(it.rate) * L, cost = qty * rate, hours = qty * n(it.hpu);
      out.subRows.push({ id: it.id, name: it.name, unit: it.unit, qty, rate, cost, hours });
      out.subCost += cost; out.hours += hours;
    }
  }
  return out;
}

export const solarOn = (state) => {
  const S = state.solar;
  return !!S && !!state.inputs.type && (S.mode === 'on' || (S.mode === 'auto' && SOLAR_AUTO.includes(state.inputs.type)));
};

/** Rooftop (or ground) solar: the size in kWp from the roof area or your own figure, cost, man-hours and yearly units. */
export function solarEstimate(state, planSqft, L = 1, loadKw = 0) {
  const S = state.solar;
  const out = { on: solarOn(state), auto: !!S && S.mode === 'auto', industrial: SOLAR_AUTO.includes(state.inputs.type), kwp: 0, roofKwp: 0, roofArea: 0, rows: [], cost: 0, hours: 0, kwh: 0, warn: [], sysName: '', mountName: '', mountKey: '' };
  if (!S) return out;
  const sys = state.solar.types[S.sys] || Object.values(state.solar.types)[0];
  const mk = S.mount === 'auto' ? (SHEET_ROOF.includes(state.inputs.type) ? 'sheet' : 'rcc') : S.mount;
  const mount = state.solar.mounts[mk] || state.solar.mounts.rcc;
  out.sysName = sys ? sys.name : ''; out.mountName = mount.name; out.mountKey = mk;
  out.roofKwp = mount.roof && mount.area > 0 ? (planSqft * Math.max(n(S.usable), 0)) / 100 / mount.area : 0;
  out.roofArea = planSqft * Math.max(n(S.usable), 0) / 100;
  if (!out.on || !sys) return out;
  out.kwp = S.sizeMode === 'manual' || !mount.roof ? Math.max(n(S.kwp), 0) : out.roofKwp;
  if (!(out.kwp > 0)) { if (!mount.roof) out.warn.push('Enter the solar size in kWp for a ground-mounted system.'); return out; }
  const add = (name, unit, qty, rate, fixed) => {
    const r = fixed ? rate : rate * L, cost = qty * r;
    out.rows.push({ name, unit, qty, rate: r, cost });
    out.cost += cost;
  };
  add(`Solar PV system: ${sys.name}`, 'kWp', out.kwp, n(sys.rate));
  add(`Mounting structure: ${mount.name}`, 'kWp', out.kwp, n(mount.rate));
  if (n(sys.fee) > 0) add('Net-metering and grid connection fees', 'lot', 1, n(sys.fee), true);
  out.hours = out.kwp * (n(sys.hpk) + n(mount.hpk));
  out.kwh = out.kwp * Math.max(n(S.yield), 0);
  if (S.sizeMode === 'manual' && mount.roof && out.roofKwp > 0 && out.kwp > out.roofKwp) out.warn.push(`The size is above what the roof holds (about ${Math.floor(out.roofKwp)} kWp at ${n(S.usable)}% usable roof).`);
  if (sys.fee > 0 && loadKw > 0 && out.kwp > loadKw) out.warn.push('The solar size is above the connected load. Exporting to the grid needs the board\'s approval.');
  return out;
}
