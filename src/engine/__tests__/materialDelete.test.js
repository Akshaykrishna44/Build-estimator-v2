import { describe, it, expect } from 'vitest';
import { reducer } from '../../state/reducer.js';
import { calculate } from '../calc.js';
import { sampleState } from '../../test/helpers.js';
import { TYPE_GROUPS } from '../../data/types.js';

const ok = (R) => [R.total, R.mc, R.lc, R.hrs, R.gv].every((v) => Number.isFinite(v));

describe('deleting a material', () => {
  const types = ['shed', 'home', 'office', 'hotel', 'hospital', 'mall', 'dc'];
  const keys = Object.keys(sampleState().materials);

  it('never breaks the estimate, whichever single material is deleted, for several project types', () => {
    for (const t of types) {
      const base = reducer(sampleState(), { type: 'input', name: 'type', value: t });
      for (const key of keys) {
        const s = reducer(base, { type: 'deleteMaterial', key });
        const R = calculate(s);
        expect(ok(R), `${t} without ${key}`).toBe(true);
        expect(R.bom.some((b) => b.name === base.materials[key].name), `${t} still lists ${key}`).toBe(false);
      }
    }
  });

  it('removes it from the work items, the catalog and the cost', () => {
    const base = sampleState(), s = reducer(base, { type: 'deleteMaterial', key: 'cem' });
    expect(s.materials.cem).toBeUndefined();
    expect(s.catalog.cem).toBeUndefined();
    expect(s.items.every((it) => it.m.every((r) => r[0] !== 'cem'))).toBe(true);
    expect(calculate(s).total).toBeLessThan(calculate(base).total);
  });

  it('works with every project type after deleting every material', () => {
    let s = sampleState();
    for (const key of keys) s = reducer(s, { type: 'deleteMaterial', key });
    for (const g of TYPE_GROUPS) for (const o of g.options) {
      const R = calculate(reducer(s, { type: 'input', name: 'type', value: o[0] }));
      expect(ok(R), o[0]).toBe(true);
    }
  });

  it('a deleted built-in material comes back after Reset', () => {
    const s = reducer(reducer(sampleState(), { type: 'deleteMaterial', key: 'cem' }), { type: 'reset' });
    expect(s.materials.cem).toBeDefined();
  });
});
