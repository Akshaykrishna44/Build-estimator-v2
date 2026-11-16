import { describe, it, expect } from 'vitest';
import { buildKpis, labourMessage } from '../kpis.js';
import { calculate } from '../../engine/calc.js';
import { sampleState } from '../../test/helpers.js';
import { createInitialState } from '../../state/initial.js';
import { reducer } from '../../state/reducer.js';

const R0 = (inputs = {}) => {
  let s = sampleState();
  for (const [name, value] of Object.entries(inputs)) s = reducer(s, { type: 'input', name, value });
  return calculate(s);
};

describe('summary cards', () => {
  it('start with the total and always include labour share and cost per sq ft', () => {
    const k = buildKpis(R0());
    expect(k[0]).toMatchObject({ cls: 'main', label: 'Total estimate' });
    expect(k.map((x) => x.label)).toEqual(expect.arrayContaining(['Materials', 'Labour', 'Equipment', 'Man-hours', 'Cost per sq ft built-up']));
    expect(k.find((x) => x.label.startsWith('Labour share')).cls).toBe('ok');
  });
  it('land cards appear only with a land price', () => {
    expect(buildKpis(R0()).some((x) => x.label === 'Total with land')).toBe(false);
    expect(buildKpis(R0({ landPrice: '2000' })).some((x) => x.label === 'Total with land')).toBe(true);
  });
  it('duration is "Not set" until every item has a crew', () => {
    expect(buildKpis(R0()).find((x) => x.label.startsWith('Duration')).value).toBe('Not set');
  });
});

describe('labour message', () => {
  it('within the limit', () => {
    const m = labourMessage(R0());
    expect(m.cls).toBe('ok');
    expect(m.head).toBe('Labour is within the 35% limit.');
    expect(m.body).toContain('of room');
  });
  it('over the limit names the amount and the way to fix it', () => {
    const m = labourMessage(R0({ lablim: '5' }));
    expect(m.cls).toBe('over');
    expect(m.head).toBe('Labour is above the 5% limit.');
    expect(m.body).toContain('over');
    expect(m.body).toContain('ready-mix concrete');
  });
});
