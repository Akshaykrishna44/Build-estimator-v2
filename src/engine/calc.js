import { SQM, UF, toNumber as n } from './units.js';
import { TYPE_MULT } from '../data/types.js';
import { CATEGORY } from '../data/materials.js';
import { INTERIOR_BY_TYPE, INTERIOR_LEVELS } from '../data/interior.js';
import { powerEstimate, solarEstimate } from './power.js';

/** CPWD cost index over DSR 2023 for the chosen station, as a fraction (115 -> 0.15). */
export function cpwdIncrease({ station, customIndex }) {
  const idx = station === 'custom' ? n(customIndex) || 100 : n(station) || 100;
  return (idx - 100) / 100;
}

export const typeMultipliers = (state) => {
  const custom = state.ctypes.find((t) => t.key === state.inputs.type);
  return custom ? custom.mult : TYPE_MULT[state.inputs.type] || {};
};

const factorOf = (state, k) => {
  const o = state.catalog[k] && state.catalog[k][state.materials[k].sel];
  return o && o.factor != null ? o.factor : 1;
};

/** The roof work item changes with the roof type picked in the "Roof type and sheeting" row. */
export function roofSystem(item, state) {
  if (item.id !== 7 || !state.materials.sheet || !state.catalog.sheet) return item;
  const opt = state.catalog.sheet[state.materials.sheet.sel];
  const b = opt && opt.bundle;
  if (!b) return item;
  return { ...item, m: b.rep ? b.m : [...item.m, ...b.m], l: b.rep ? b.l : [...item.l, ...b.l] };
}

/**
 * The whole estimate, as a pure function of the app state.
 * Quantities -> materials, labour, equipment -> overhead, contingency, GST -> workers, durations, reports.
 */
export function calculate(state) {
  const { inputs: I, items, trades, materials, catalog, doors, doorTypes } = state;
  const mult = typeMultipliers(state);

  // ---- geometry and area
  const FL = Math.max(n(I.len), 0), WD = Math.max(n(I.wid), 0), HT = Math.max(n(I.hgt), 0);
  const F = Math.max(Math.floor(n(I.floors)) || 1, 1);
  const PLAN = FL * WD, BS = PLAN * F, A = BS * SQM;
  const WALLFT = 2 * (FL + WD) * HT;
  const WREF = 4 * Math.sqrt(PLAN) * 12 * F;
  const WRATIO = WREF > 0 ? Math.min(3, Math.max(0.3, WALLFT / WREF)) : 1;
  const LAND = Math.max(n(I.land), 0) * UF[I.landUnit];
  const LPS = Math.max(n(I.landPrice), 0) / UF[I.landPriceUnit];
  const LCOST = LPS * LAND;

  // ---- schedule and rates
  const D = Math.max(n(I.days) || 1, 1), H = Math.max(n(I.hpd) || 8, 1);
  const CIP = I.basis === 'cpwd' ? cpwdIncrease(I) : 0;
  const GS = n(I.gst) / 100, OH = n(I.oh) / 100, CT = n(I.ct) / 100;
  const L = (n(I.loc) || 1) * (1 + CIP);

  const phases = {}, tot = {}, ITD = {}, trade = {};
  for (const k in trades) trade[k] = { h: 0, c: 0 };
  let mc = 0, lc = 0, ec = 0, hrs = 0;
  const dg = { h: 0, l: 0, e: 0, rows: [] };

  // ---- work items
  for (const it of items) {
    const f = mult[it.id] === undefined ? 1 : mult[it.id];
    const drv = it.drv || (it.plan ? 'plan' : '');
    const baseArea = drv === 'wall' ? A * WRATIO : drv === 'plan' ? PLAN * SQM : A;
    const qty = baseArea * n(it.q) * f;
    if (qty <= 0) continue;
    const dr = it.dig ? { n: it.n, u: it.u, q: qty, h: 0, l: 0, e: 0 } : null;
    if (dr) dg.rows.push(dr);
    const p = phases[it.ph] || (phases[it.ph] = { m: 0, h: 0, l: 0, e: 0, d: 0, dk: 0, rows: [] });
    const itm = roofSystem(it, state);

    for (const [k, per] of itm.m) {
      const mt = materials[k];
      if (!mt) continue;
      const q = qty * per * factorOf(state, k) * (1 + mt.waste), c = q * mt.rate * L;
      tot[k] = (tot[k] || 0) + q;
      p.m += c; mc += c;
      p.rows.push([mt.name, mt.unit, q, mt.rate * L, c, it.n, k]);
    }

    let itd = 0, itu = false;
    for (const [k, hp, cw] of itm.l) {
      const tr = trades[k];
      if (!tr) continue;
      const t = qty * hp, c = t * tr.wage * L, crew = cw > 0 ? cw : tr.count || 0;
      if (crew > 0) itd = Math.max(itd, t / (crew * H)); else itu = true;
      p.h += t; p.l += c; lc += c; hrs += t;
      trade[k].h += t; trade[k].c += c;
      if (dr) { dr.h += t; dr.l += c; dg.h += t; dg.l += c; }
    }
    ITD[it.id] = itu || !itm.l.length ? null : Math.ceil(itd);
    if (ITD[it.id] === null) p.dk = 1; else p.d += ITD[it.id];

    for (const [, hp, r] of it.e) {
      const c = qty * hp * r * L;
      p.e += c; ec += c;
      if (dr) { dr.e += c; dg.e += c; }
    }
  }

  // ---- quantities the user chose to use instead of the calculated ones
  const need = { ...tot };
  for (const k in materials) {
    const ov = materials[k].ovr || 0;
    if (!(ov > 0)) continue;
    const nd = need[k] || 0;
    if (nd > 0) {
      const f = ov / nd;
      for (const name in phases) {
        const ph = phases[name];
        for (const r of ph.rows) if (r[6] === k) { const nc = r[4] * f; ph.m += nc - r[4]; mc += nc - r[4]; r[2] *= f; r[4] = nc; }
      }
    } else {
      const c = ov * materials[k].rate * L;
      const ph = phases['Other materials'] || (phases['Other materials'] = { m: 0, h: 0, l: 0, e: 0, d: 0, dk: 0, rows: [] });
      ph.m += c; mc += c;
      ph.rows.push([materials[k].name, materials[k].unit, ov, materials[k].rate * L, c, 'Your quantity', k]);
    }
    tot[k] = ov;
  }

  // ---- doors and windows
  let dwCost = 0, dwN = 0, dwA = 0, dwH = 0;
  const dwRows = [];
  const firstType = Object.keys(doorTypes)[0];
  for (const r of doors) {
    const t = doorTypes[r.type] || doorTypes[firstType] || { name: 'Type', spec: '', rate: 0, cft: 0 };
    const rate = n(r.rate) > 0 ? n(r.rate) : t.rate, a = n(r.n) * n(r.w) * n(r.h), c = a * rate * L;
    dwCost += c; dwN += n(r.n); dwA += a; dwH += a * 0.2;
    dwRows.push({ r, t, rate, a, c });
  }
  if (dwCost > 0) {
    const ck = trades.carp ? 'carp' : Object.keys(trades)[0];
    if (ck) {
      const lab = dwH * trades[ck].wage * L, crew = trades[ck].count || 0;
      phases['Doors and windows'] = {
        m: dwCost, h: dwH, l: lab, e: 0, d: crew > 0 ? Math.ceil(dwH / (crew * H)) : 0, dk: crew > 0 ? 0 : 1,
        rows: dwRows.map((x) => [x.r.name, 'nos', n(x.r.n), n(x.r.w) * n(x.r.h) * x.rate * L, x.c, x.t.name + ', ' + x.r.w + ' × ' + x.r.h + ' ft', 'dw' + x.r.id]),
      };
      lc += lab; hrs += dwH; trade[ck].h += dwH; trade[ck].c += lab;
    }
    mc += dwCost;
  }

  // ---- interior design (fit-out): supplied and fixed items, with fixing man-hours
  const intr = interiorEstimate(state, BS, L);
  if (intr.on && intr.rows.length) {
    const ck = trades.carp ? 'carp' : Object.keys(trades)[0];
    if (ck) {
      const lab = intr.hours * trades[ck].wage * L, crew = trades[ck].count || 0;
      phases['Interior design'] = {
        m: intr.cost, h: intr.hours, l: lab, e: 0, d: crew > 0 ? Math.ceil(intr.hours / (crew * H)) : 0, dk: crew > 0 ? 0 : 1,
        rows: intr.rows.map((x) => [x.name, x.unit, x.qty, x.rate, x.cost, 'Interior design (' + intr.levelName + ')', 'in' + x.id]),
      };
      lc += lab; hrs += intr.hours; trade[ck].h += intr.hours; trade[ck].c += lab; mc += intr.cost;
      intr.lab = lab;
    }
  }

  // ---- electrical supply, substation and solar (contractor works). EB charges are paid to the board, outside overhead and GST.
  const pw = powerEstimate(state, BS, L);
  const sol = solarEstimate(state, PLAN, L, pw.loadKw);
  const addWork = (name, cost, hours, rows, src) => {
    if (!(rows.length && (cost > 0 || hours > 0))) return 0;
    const ck = trades.elec ? 'elec' : Object.keys(trades)[0];
    if (!ck) return 0;
    const lab = hours * trades[ck].wage * L, crew = trades[ck].count || 0;
    phases[name] = { m: cost, h: hours, l: lab, e: 0, d: crew > 0 ? Math.ceil(hours / (crew * H)) : 0, dk: crew > 0 ? 0 : 1, rows: rows.map((x, i) => [x.name, x.unit, x.qty, x.rate, x.cost, src, 'pw' + name.length + i]) };
    lc += lab; hrs += hours; trade[ck].h += hours; trade[ck].c += lab; mc += cost;
    return lab;
  };
  pw.lab = addWork(pw.substation ? 'Electrical substation and incoming supply' : 'Electrical incoming supply', pw.subCost, pw.hours, pw.subRows, 'Electrical supply');
  sol.lab = addWork('Solar installation', sol.cost, sol.hours, sol.rows, 'Solar installation');

  // ---- bill of materials and wood
  const usedIn = {};
  for (const name in phases) for (const r of phases[name].rows) if (r[6] && materials[r[6]]) (usedIn[r[6]] = usedIn[r[6]] || new Set()).add(r[5]);
  const bom = Object.keys(tot).filter((k) => materials[k] && tot[k] > 0).map((k) => ({
    cat: CATEGORY[k] || 'Other materials', name: materials[k].name, grade: gradeText(state, k), qty: tot[k], calc: need[k] || 0,
    unit: materials[k].unit, rate: materials[k].rate * L, cost: tot[k] * materials[k].rate * L,
    used: [...(usedIn[k] || [])].join(', ') || 'Your quantity',
  }));
  for (const x of dwRows) {
    if (x.c > 0 || n(x.r.n) > 0) bom.push({ cat: 'Doors and windows', name: x.r.name, grade: x.t.name + ', ' + x.r.w + ' × ' + x.r.h + ' ft', qty: n(x.r.n), calc: n(x.r.n), unit: 'nos', rate: n(x.r.w) * n(x.r.h) * x.rate * L, cost: x.c, used: 'Doors and windows' });
  }
  for (const x of intr.on ? intr.rows : []) bom.push({ cat: 'Interior design', name: x.name, grade: intr.levelName + ' level', qty: x.qty, calc: x.qty, unit: x.unit, rate: x.rate, cost: x.cost, used: 'Interior design' });
  for (const x of pw.subRows) bom.push({ cat: 'Electrical supply and substation', name: x.name, grade: pw.substation ? `HT supply, ${pw.trfKva} kVA transformer` : 'LT supply', qty: x.qty, calc: x.qty, unit: x.unit, rate: x.rate, cost: x.cost, used: 'Electrical supply' });
  for (const x of sol.rows) bom.push({ cat: 'Solar installation', name: x.name, grade: `${sol.kwp.toFixed(1)} kWp`, qty: x.qty, calc: x.qty, unit: x.unit, rate: x.rate, cost: x.cost, used: 'Solar installation' });
  const wl = [];
  for (const name in phases) for (const r of phases[name].rows) if (['wood', 'ply', 'fply'].includes(r[6])) wl.push({ src: r[5], mat: materials[r[6]].name, grade: gradeText(state, r[6]), q: r[2], u: materials[r[6]].unit, c: r[4], k: r[6] });
  for (const x of dwRows) {
    const cf = (x.t.cft || 0) * x.a;
    if (cf > 0) wl.push({ src: x.r.name + ' (' + x.t.name + ')', mat: 'Wood in doors and windows', grade: 'Included in door and window cost', q: cf, u: 'cft', c: 0, k: 'dw' });
  }
  const tcft = wl.filter((x) => x.u === 'cft').reduce((a, x) => a + x.q, 0);
  const tsq = wl.filter((x) => x.u === 'sq ft').reduce((a, x) => a + x.q, 0);
  const twc = wl.reduce((a, x) => a + x.c, 0);

  // ---- cost
  const base = mc + lc + ec, ohv = base * OH, ctv = (base + ohv) * CT, gv = (base + ohv + ctv) * GS, ebv = pw.ebCost, total = base + ohv + ctv + gv + ebv;

  // ---- workers and durations
  let peak = 0;
  const tr = Object.keys(trade).filter((k) => trade[k].h > 0).map((k) => {
    const w = Math.ceil(trade[k].h / (D * H));
    peak += w;
    return [k, trade[k].h, w, trade[k].c];
  });
  const planTot = tr.reduce((a, [k, , w]) => a + ((trades[k].count || 0) > 0 ? trades[k].count : w), 0);
  const cap = Math.floor(n(I.cap)) || 0;
  const pk = Object.keys(phases);
  const projDays = pk.length && pk.every((p) => !phases[p].dk) ? pk.reduce((a, p) => a + phases[p].d, 0) : null;

  // ---- labour share against the limit
  const LIM = Math.max(n(I.lablim), 0) / 100;
  const labPct = total > 0 ? lc / total : 0, labMax = total * LIM, labOver = lc - labMax;

  // ---- split and per-measurement prices
  const parts = [
    ['Materials', mc], ['Labour (other trades)', lc - dg.l], ['Land digging labour', dg.l], ['Equipment', ec], ['Overhead, contingency and GST', ohv + ctv + gv],
    ...(ebv > 0 ? [['Electricity board charges', ebv]] : []),
  ];
  const pmq = [
    ['Built-up area', BS, 'sq ft', 'sq ft'], ['Plan area (one floor)', PLAN, 'sq ft', 'sq ft'], ['Land area', LAND, 'sq ft', 'sq ft'],
    ['Land area', LAND / 435.6, 'cents', 'cent'], ['Land area', LAND / 43560, 'acres', 'acre'], ['Height of the building', HT, 'ft', 'foot of height'],
    ['External wall area', WALLFT, 'sq ft', 'sq ft of wall'], ['Building volume (plan area × height)', PLAN * HT, 'cu ft', 'cu ft'],
  ];
  const pm = pmq.map(([name, q, sizeUnit, unit]) => ({
    name, size: q, sizeUnit, unit: 'per ' + unit,
    perTotal: q > 0 ? total / q : null, perBase: q > 0 ? base / q : null, perWithLand: q > 0 ? (total + LCOST) / q : null,
  }));

  return {
    FL, WD, HT, F, PLAN, BS, A, WALLFT, LAND, LPS, LCOST, D, H, CIP, GS, L,
    mc, lc, ec, hrs, base, ohv, ctv, gv, ebv, total, phases, tot, need, ITD, dg, bom, wl, tcft, tsq, twc,
    tr, peak, planTot, cap, projDays, LIM, labPct, labMax, labOver, parts, pm, dwCost, dwN, dwA, dwRows, intr, pw, sol,
  };
}

/** Whether interior design applies and its rows. mode: auto (by project type), on, off. Quantities are per 1000 sq ft of built-up area. */
export function interiorEstimate(state, builtUpSqft, L = 1) {
  const it = state.interior || { mode: 'off', level: 'standard', items: [] };
  const preset = INTERIOR_BY_TYPE[state.inputs.type];
  const on = it.mode === 'on' || (it.mode === 'auto' && !!preset);
  const lv = INTERIOR_LEVELS[it.level] || INTERIOR_LEVELS.standard;
  const out = { on, auto: it.mode === 'auto', preset: !!preset, level: it.level, levelName: lv.name, rows: [], cost: 0, hours: 0, lab: 0 };
  if (!on) return out;
  const f = preset ? preset.f : 1;
  for (const r of it.items) {
    const m = preset && preset.m[r.id] !== undefined ? preset.m[r.id] : 1;
    const qty = (builtUpSqft / 1000) * n(r.q) * f * m;
    if (!(qty > 0)) continue;
    const rate = n(r.rate) * lv.mult * L, cost = qty * rate, hours = qty * n(r.hpu);
    out.rows.push({ id: r.id, name: r.name, unit: r.unit, qty, rate, cost, hours });
    out.cost += cost; out.hours += hours;
  }
  return out;
}

function gradeText(state, k) {
  const o = state.catalog[k] && state.catalog[k][state.materials[k].sel];
  return o ? `${o.name} (${o.spec})` : '';
}
