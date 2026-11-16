import { BASES, STATIONS } from '../data/bases.js';
import { DEFAULT_GRADE } from '../data/materials.js';
import { DEFAULT_TRADES } from '../data/trades.js';
import { cpwdIncrease } from '../engine/calc.js';

/**
 * Switch the rate basis: pick each covered material's government grade (others return to their default grade),
 * set trade wages and equipment hire rates. Options keepWages / keepEq leave those as the user set them.
 */
export function applyBasis(state, key, opts = {}) {
  const B = BASES[key] || BASES.tn;
  const materials = {};
  for (const k in state.materials) {
    const m = state.materials[k], list = state.catalog[k] || [];
    let sel = m.custom ? 0 : DEFAULT_GRADE[k] || 0;
    const wanted = B.mats[k];
    if (wanted) { const j = list.findIndex((o) => o.name === wanted); if (j >= 0) sel = j; }
    materials[k] = list[sel] ? { ...m, sel, rate: list[sel].rate } : m;
  }
  let trades = state.trades;
  if (!opts.keepWages) {
    trades = {};
    for (const k in state.trades) {
      const wage = B.wages ? B.wages[k] : undefined;
      trades[k] = { ...state.trades[k], wage: wage !== undefined ? wage : state.trades[k].wage };
    }
    if (key === 'mkt') for (const k in trades) if (DEFAULT_TRADES[k]) trades[k] = { ...trades[k], wage: DEFAULT_TRADES[k].wage };
  }
  const items = opts.keepEq ? state.items : state.items.map((it) => ({
    ...it, e: it.e.map((r) => (B.eq[r[0]] !== undefined ? [r[0], r[1], B.eq[r[0]]] : r)),
  }));
  return { ...state, materials, trades, items };
}

/** One-line description of the active rate basis, shown under the inputs. */
export function basisInfo(inputs) {
  const cip = inputs.basis === 'cpwd' ? cpwdIncrease(inputs) : 0;
  const gst = Number(inputs.gst) || 0;
  const text = {
    tn: 'Tamil Nadu PWD Schedule of Rates 2025-26, Volume I (effective 22.07.2025), the edition in use in 2026: basic rates excluding GST for cement, sand, aggregate, steel, bricks and labour wages. The Carpenter wage uses the Mason I wage as a stand-in. Other materials, equipment, door and window rates and the location factor are indicative or your own.',
    cpwd: `CPWD Delhi Analysis of Rates 2023 basic rates (Delhi, 01.04.2023, excluding GST) escalated by the CPWD building cost index: ${Math.round(cip * 100 + 100)} on DPAR 2023 (base 100) = +${(cip * 100).toFixed(0)}%. CPWD civil works in 2026 run on DSR 2023 (E&M on DSR 2025). Engineer wages, the electrician wage and materials not in the DAR list use indicative values. The index is applied to all rates.`,
    mkt: 'Indicative market placeholders. Replace them with local quotes or a schedule of rates.',
  }[inputs.basis];
  return text + (gst > 0 ? ` GST of ${gst}% is added on the total.` : ' No GST is added.');
}

export const stationLabel = (inputs) => {
  if (inputs.station === 'custom') return 'Other station (index ' + inputs.customIndex + ')';
  const s = STATIONS.find((x) => String(x.index) === String(inputs.station));
  return s ? `${s.name} (${s.index}, ${s.date})` : '';
};
