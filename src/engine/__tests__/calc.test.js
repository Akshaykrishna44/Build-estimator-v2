import { describe, it, expect } from 'vitest';
import { stateWith, onlyItems, noDoors, calc, close, SQM, pickGrade } from '../../test/helpers.js';
import { reducer } from '../../state/reducer.js';

const base = (inputs = {}) => noDoors(stateWith({ len: '200', wid: '100', hgt: '24', floors: '1', days: '120', hpd: '8', loc: '1', oh: '8', ct: '10', ...inputs }));

describe('electrical only: hand-worked case (market basis, no GST)', () => {
  const A = 200 * 100 * SQM, pts = 0.15 * A;
  const mat = pts * 25 * 1.05 * 42 + pts * 1.5 * 1.02 * 150 + pts * 0.05 * 1.02 * 8500;
  const hrs = pts * 3, lab = hrs * 450, b = mat + lab, oh = b * 0.08, ct = (b + oh) * 0.1;
  const R = calc(onlyItems(base(), { 9: 1 }));
  it('materials, labour and hours', () => {
    expect(close(R.mc, mat)).toBe(true);
    expect(close(R.lc, lab)).toBe(true);
    expect(close(R.hrs, hrs)).toBe(true);
  });
  it('total = base + overhead + contingency', () => {
    expect(close(R.total, b + oh + ct)).toBe(true);
    expect(R.gv).toBe(0);
  });
  it('electrician headcount = ceil(hours / (days x hours per day))', () => {
    expect(R.tr.map((r) => [r[0], r[2]])).toEqual([['elec', Math.ceil(hrs / (120 * 8))]]);
    const R30 = calc(onlyItems(base({ days: '30' }), { 9: 1 }));
    expect(R30.tr[0][2]).toBe(Math.ceil(hrs / (30 * 8)));
  });
  it('GST and location factor apply to base, overhead and contingency', () => {
    const G = calc(onlyItems(base({ gst: '18', loc: '1.1' }), { 9: 1 }));
    const bb = (mat + lab) * 1.1, o = bb * 0.08, c = (bb + o) * 0.1, g = (bb + o + c) * 0.18;
    expect(close(G.gv, g)).toBe(true);
    expect(close(G.total, bb + o + c + g)).toBe(true);
  });
});

describe('rate bases', () => {
  it('Tamil Nadu PWD SOR rates', () => {
    const s = stateWith({}, 'tn');
    expect(s.materials.cem.rate).toBe(280.13);
    expect(s.materials.steel.rate).toBe(55.67);
    expect(s.trades.civil.wage).toBe(121);
    expect(s.inputs.gst).toBe('18');
  });
  it('CPWD rates and +15% Chennai cost index', () => {
    const s = noDoors(stateWith({ len: '200', wid: '100', hgt: '24', oh: '8', ct: '10' }, 'cpwd'));
    expect(s.materials.cem.rate).toBe(257.8);
    expect(s.materials.steel.rate).toBe(55.5);
    expect(s.items.find((i) => i.id === 1).e[0][2]).toBe(900);
    const R = calc(onlyItems(s, { 9: 1 }));
    expect(R.CIP).toBeCloseTo(0.15, 10);
    const A = 200 * 100 * SQM, pts = 0.15 * A;
    const mat = (pts * 25 * 1.05 * 42 + pts * 1.5 * 1.02 * 150 + pts * 0.05 * 1.02 * 8500) * 1.15, lab = pts * 3 * 122 * 1.15;
    expect(close(R.mc, mat)).toBe(true);
    expect(close(R.lc, lab)).toBe(true);
    const b = mat + lab, o = b * 0.08, c = (b + o) * 0.1;
    expect(close(R.total, (b + o + c) * 1.18)).toBe(true);
  });
  it('station index and custom index', () => {
    expect(calc(stateWith({ station: '125' }, 'cpwd')).CIP).toBeCloseTo(0.25, 10);
    expect(calc(stateWith({ station: 'custom', customIndex: '110' }, 'cpwd')).CIP).toBeCloseTo(0.1, 10);
    expect(calc(stateWith({ station: '125' }, 'tn')).CIP).toBe(0);
  });
  it('market basis keeps the placeholder prices and no GST', () => {
    const s = stateWith({}, 'mkt');
    expect([s.materials.cem.rate, s.materials.steel.rate, s.trades.civil.wage, s.inputs.gst]).toEqual([375, 68, 350, '0']);
  });
});

describe('land and geometry', () => {
  it('land units', () => {
    expect(calc(stateWith({ landUnit: 'acre', land: '1' })).LAND).toBeCloseTo(43560, 6);
    expect(calc(stateWith({ landUnit: 'cent', land: '100' })).LAND).toBeCloseTo(43560, 6);
  });
  it('land cost = price x area, in any price unit', () => {
    expect(calc(stateWith({ land: '100000', landPrice: '2000' })).LCOST).toBeCloseTo(2e8, 4);
    expect(calc(stateWith({ land: '100000', landPriceUnit: 'cent', landPrice: '871200' })).LCOST).toBeCloseTo(2e8, 2);
  });
  it('plan, built-up, wall area', () => {
    const R = calc(stateWith({ len: '200', wid: '108', hgt: '24', floors: '3' }));
    expect(R.PLAN).toBe(21600);
    expect(R.BS).toBe(64800);
    expect(R.WALLFT).toBe(2 * 308 * 24);
  });
  it('brickwork follows the wall-area ratio', () => {
    const plan = 200 * 108, wref = 4 * Math.sqrt(plan) * 12;
    const ratio = Math.min(3, Math.max(0.3, (2 * 308 * 24) / wref));
    const R = calc(onlyItems(base({ wid: '108' }), { 6: 1 }));
    expect(close(R.need.brk, plan * SQM * ratio * 0.9 * 55 * 1.05, 1e-9)).toBe(true);
    const tall = calc(onlyItems(base({ wid: '108', hgt: '48' }), { 6: 1 }));
    expect(tall.need.brk).toBeGreaterThan(R.need.brk);
  });
  it('fractional floors round down', () => {
    expect(calc(stateWith({ floors: '2.7' })).F).toBe(2);
  });
});

describe('materials, wood and roofs', () => {
  const plan = 200 * 100 * SQM;
  it('footings: cement, formwork plywood and timber with wastage', () => {
    const R = calc(onlyItems(base(), { 3: 1 }));
    const q = 0.12 * plan;
    expect(close(R.need.cem, q * 8 * 1.05)).toBe(true);
    expect(close(R.need.fply, q * 8.6 * 1.1)).toBe(true);
    expect(close(R.need.wood, q * 0.15 * 1.08)).toBe(true);
  });
  it('quantity to use overrides the calculated quantity', () => {
    let s = onlyItems(base(), { 3: 1 });
    s = reducer(s, { type: 'setOverride', key: 'cem', value: '5000' });
    const R = calc(s), line = R.bom.find((x) => x.name === 'Cement');
    expect(line.qty).toBe(5000);
    expect(close(line.cost, 5000 * s.materials.cem.rate)).toBe(true);
    expect(R.need.cem).toBeGreaterThan(0);
  });
  it('a quantity for a material no work item uses goes to Other materials', () => {
    let s = onlyItems(base(), {});
    s = reducer(s, { type: 'addMaterial', name: 'Test cable', unit: 'm', waste: '5', rate: '55' });
    s = reducer(s, { type: 'setOverride', key: 'c1', value: '100' });
    const R = calc(s);
    expect(close(R.phases['Other materials'].m, 5500)).toBe(true);
    expect(close(R.mc, 5500)).toBe(true);
  });
  it('interior woodwork plywood', () => {
    const s = onlyItems(base(), { 14: 1.4 });
    expect(close(calc(s).need.ply, 0.3 * (200 * 100 * SQM) * 1.4 * 10.76 * 1.1)).toBe(true);
  });
  it('Galvalume truss adds purlin steel; RCC roof adds concrete and drops the sheet', () => {
    let s = onlyItems(base(), { 7: 1 });
    expect(calc(s).need.str || 0).toBe(0);
    const g = calc(pickGrade(s, 'sheet', 'Truss with Galvalume sheet'));
    expect(close(g.need.str, plan * 7 * 1.03)).toBe(true);
    expect(close(g.need.sheet, plan * 1.1 * 1.05)).toBe(true);
    const r = calc(pickGrade(s, 'sheet', 'RCC concrete roof (150 mm slab)'));
    expect(close(r.need.cem, plan * 1.2 * 1.05)).toBe(true);
    expect(close(r.need.steel, plan * 15 * 1.04)).toBe(true);
    expect(r.bom.filter((b) => b.name === 'Roof type and sheeting')).toHaveLength(0);
  });
  it('AAC block uses its own quantity factor', () => {
    const s = pickGrade(onlyItems(base(), { 6: 1 }), 'brk', 'AAC block');
    const R = calc(s), plain = calc(onlyItems(base(), { 6: 1 }));
    expect(close(R.need.brk, plain.need.brk * 0.12)).toBe(true);
  });
});

describe('land digging, doors, workers, labour limit', () => {
  it('digging labour = quantity x 0.9 h x digging wage', () => {
    const s = onlyItems(base(), { 1: 1 });
    const R = calc(s), q = 0.3 * 200 * 100 * SQM;
    expect(close(R.dg.l, q * 0.9 * s.trades.dig.wage)).toBe(true);
    expect(calc(onlyItems(base(), { 1: 1, 13: 1 })).dg.rows).toHaveLength(2);
  });
  it('doors and windows: area x rate, row override, wood content, fixing labour', () => {
    let s = onlyItems(base(), {});
    s = { ...s, doors: [{ id: 1, name: 'Windows', type: 'upvc', n: 20, w: 4, h: 4, rate: 0 }] };
    const cost = (st) => calc(st).bom.find((b) => b.cat === 'Doors and windows').cost;
    expect(close(cost(s), 20 * 16 * 650)).toBe(true);
    const teak = reducer(s, { type: 'updateDoor', id: 1, field: 'type', value: 'teak' });
    expect(close(cost(teak), 20 * 16 * 2200)).toBe(true);
    const over = reducer(teak, { type: 'updateDoor', id: 1, field: 'rate', value: '1000' });
    expect(close(cost(over), 20 * 16 * 1000)).toBe(true);
    const R = calc(teak);
    expect(close(R.wl.filter((x) => x.k === 'dw').reduce((a, x) => a + x.q, 0), 20 * 16 * 0.09)).toBe(true);
    expect(close(R.phases['Doors and windows'].h, 20 * 16 * 0.2)).toBe(true);
  });
  it('planned labourers give days with the crew; project duration needs every crew', () => {
    let s = onlyItems(base(), { 9: 1 });
    expect(calc(s).projDays).toBeNull();
    s = reducer(s, { type: 'updateTrade', key: 'elec', field: 'count', value: '2' });
    const R = calc(s), hrs = R.hrs;
    expect(R.ITD[9]).toBe(Math.ceil(hrs / (2 * 8)));
    expect(R.projDays).toBe(Math.ceil(hrs / 16));
    expect(R.planTot).toBe(2);
  });
  it('maximum workers on site', () => {
    const R = calc(onlyItems(base({ cap: '1' }), { 9: 1 }));
    expect(R.cap).toBe(1);
  });
  it('labour share and the 35% limit', () => {
    const s = onlyItems(base(), { 9: 1 });
    const R = calc(s);
    expect(close(R.labPct, R.lc / R.total)).toBe(true);
    expect(R.labOver > 0).toBe(R.labPct > 0.35);
    const tight = calc({ ...s, inputs: { ...s.inputs, lablim: String(R.labPct * 100 - 5) } });
    expect(tight.labOver).toBeGreaterThan(0);
    expect(close(tight.labOver, R.lc - (R.labPct * 100 - 5) / 100 * tight.total, 1e-9)).toBe(true);
  });
});

describe('invariants over every project type and rate basis', () => {
  it('totals are finite and the parts add up', async () => {
    const { TYPE_MULT } = await import('../../data/types.js');
    for (const basis of ['tn', 'cpwd', 'mkt']) {
      for (const t of Object.keys(TYPE_MULT)) {
        const R = calc(stateWith({ type: t }, basis));
        expect(Number.isFinite(R.total) && R.total > 0, `${basis}/${t} total`).toBe(true);
        expect(Math.abs(R.parts.reduce((a, p) => a + p[1], 0) - R.total), `${basis}/${t} pie`).toBeLessThan(1);
        expect(Math.abs(R.bom.reduce((a, b) => a + b.cost, 0) - R.mc), `${basis}/${t} bom`).toBeLessThan(1);
        expect(Math.abs(Object.values(R.phases).reduce((a, p) => a + p.m, 0) - R.mc), `${basis}/${t} phases`).toBeLessThan(1);
        expect(R.labPct >= 0 && R.labPct <= 1).toBe(true);
      }
    }
  });
});

describe('odd inputs never break the estimate', () => {
  const fields = [['len', ''], ['wid', '0'], ['hgt', ''], ['floors', '0'], ['floors', ''], ['days', '0'], ['hpd', '0'], ['land', ''], ['oh', '-5'], ['gst', '-3'], ['lablim', ''], ['loc', '0'], ['len', '1e9'], ['landPrice', 'abc']];
  it.each(fields)('%s = "%s"', (name, value) => {
    const R = calc(stateWith({ [name]: value }));
    expect(Number.isFinite(R.total)).toBe(true);
    expect(Number.isFinite(R.labPct)).toBe(true);
    expect(JSON.stringify(R.pm)).not.toMatch(/NaN|Infinity/);
  });
});
