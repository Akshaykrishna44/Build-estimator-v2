import { describe, it, expect } from 'vitest';
import { reducer } from '../../state/reducer.js';
import { createInitialState } from '../../state/initial.js';
import { calculate, interiorEstimate } from '../calc.js';
import { INTERIOR_BY_TYPE, INTERIOR_LEVELS } from '../../data/interior.js';

const base = (type, extra = {}) => {
  let s = reducer(createInitialState(), { type: 'input', name: 'basis', value: 'mkt' });
  for (const [name, value] of Object.entries({ type, len: '50', wid: '40', hgt: '10', floors: '1', days: '100', ...extra })) s = reducer(s, { type: 'input', name, value });
  return s;
};
const set = (s, field, value) => reducer(s, { type: 'setInterior', field, value });

describe('interior design estimate', () => {
  it('is included automatically for types that need it, not for others', () => {
    expect(calculate(base('office')).intr.on).toBe(true);
    expect(calculate(base('shed')).intr.on).toBe(false);
    expect(calculate(base('shed')).phases['Interior design']).toBeUndefined();
  });

  it('hand-worked: home, 2000 sq ft, standard level', () => {
    const R = calculate(base('home'));
    const row = (id) => R.intr.rows.find((x) => x.id === id);
    // false ceiling: 2000/1000 × 600 × f1 × m1 = 1200 sq ft × ₹110
    expect(row(1).qty).toBeCloseTo(1200, 6);
    expect(row(1).cost).toBeCloseTo(132000, 6);
    // kitchen: 2 × 0.8 = 1.6 nos × 180000
    expect(row(4).cost).toBeCloseTo(288000, 6);
    // office workstations are removed for a home
    expect(row(7)).toBeUndefined();
    expect(R.intr.cost).toBeCloseTo(R.intr.rows.reduce((a, x) => a + x.cost, 0), 6);
  });

  it('adds materials, carpenter labour and hours to the totals', () => {
    const on = calculate(base('home')), off = calculate(set(base('home'), 'mode', 'off'));
    expect(on.mc - off.mc).toBeCloseTo(on.intr.cost, 4);
    const wage = base('home').trades.carp.wage;
    expect(on.intr.lab).toBeCloseTo(on.intr.hours * wage, 4);
    expect(on.lc - off.lc).toBeCloseTo(on.intr.lab, 4);
    expect(on.hrs - off.hrs).toBeCloseTo(on.intr.hours, 6);
    expect(on.total).toBeGreaterThan(off.total);
    expect(on.phases['Interior design'].rows.length).toBe(on.intr.rows.length);
    expect(on.bom.filter((b) => b.cat === 'Interior design').length).toBe(on.intr.rows.length);
  });

  it('quality level scales the cost but not the hours', () => {
    const std = calculate(base('office')).intr, lux = calculate(set(base('office'), 'level', 'luxury')).intr;
    expect(lux.cost / std.cost).toBeCloseTo(INTERIOR_LEVELS.luxury.mult, 9);
    expect(lux.hours).toBeCloseTo(std.hours, 9);
  });

  it('Include forces it on for any type and Do not include forces it off', () => {
    expect(calculate(set(base('shed'), 'mode', 'on')).intr.rows.length).toBeGreaterThan(0);
    expect(calculate(set(base('home'), 'mode', 'off')).intr.on).toBe(false);
  });

  it('scales with built-up area (two floors doubles the quantities)', () => {
    const one = calculate(base('home')).intr.cost, two = calculate(base('home', { floors: '2' })).intr.cost;
    expect(two / one).toBeCloseTo(2, 9);
  });

  it('every item can be edited, added and deleted', () => {
    let s = reducer(base('home'), { type: 'updateInteriorItem', id: 1, field: 'rate', value: '200' });
    expect(calculate(s).intr.rows.find((x) => x.id === 1).cost).toBeCloseTo(1200 * 200, 6);
    s = reducer(s, { type: 'addInteriorItem', name: 'Home theatre' });
    const id = s.interior.items.at(-1).id;
    expect(s.interior.items.at(-1).name).toBe('Home theatre');
    expect(calculate(s).intr.rows.find((x) => x.id === id)).toBeUndefined(); // quantity 0 until set
    s = reducer(reducer(reducer(s, { type: 'updateInteriorItem', id, field: 'q', value: '2' }), { type: 'updateInteriorItem', id, field: 'rate', value: '1000' }), { type: 'updateInteriorItem', id, field: 'hpu', value: '0.5' });
    const row = calculate(s).intr.rows.find((x) => x.id === id);
    expect([row.qty, row.cost, row.hours]).toEqual([4, 4000, 2]);
    s = reducer(s, { type: 'deleteInteriorItem', id });
    expect(s.interior.items.some((x) => x.id === id)).toBe(false);
    s = reducer(s, { type: 'updateInteriorItem', id: 1, field: 'q', value: '-5' });
    expect(s.interior.items.find((x) => x.id === 1).q).toBe(0);
    expect(reducer(s, { type: 'resetInterior' }).interior).toEqual(createInitialState().interior);
  });

  it('interior labour is counted in the labour limit', () => {
    const R = calculate(base('office'));
    expect(R.labPct).toBeCloseTo(R.lc / R.total, 12);
  });

  it('presets only reference existing items and sane factors', () => {
    const ids = createInitialState().interior.items.map((x) => x.id);
    for (const [k, p] of Object.entries(INTERIOR_BY_TYPE)) {
      expect(p.f, k).toBeGreaterThan(0);
      for (const id of Object.keys(p.m)) expect(ids, k).toContain(Number(id));
    }
  });

  it('an empty built-up area gives no interior and no NaN', () => {
    const e = interiorEstimate(base('home'), 0);
    expect(e.cost).toBe(0);
    expect(e.rows).toEqual([]);
  });
});
