import { describe, it, expect } from 'vitest';
import { applyBasis, basisInfo, stationLabel } from '../basis.js';
import { sampleState } from '../../test/helpers.js';
import { createInitialState } from '../initial.js';
import { BASES, STATIONS } from '../../data/bases.js';
import { CATALOG } from '../../data/materials.js';

describe('applyBasis', () => {
  it('every named government grade exists in the catalogue', () => {
    for (const [bk, B] of Object.entries(BASES)) for (const [k, name] of Object.entries(B.mats)) expect(CATALOG[k].some((o) => o.name === name), `${bk}/${k}/${name}`).toBe(true);
  });
  it('can keep the wages and equipment the user set', () => {
    let s = sampleState();
    s = { ...s, trades: { ...s.trades, civil: { ...s.trades.civil, wage: 999 } } };
    expect(applyBasis(s, 'cpwd', { keepWages: true, keepEq: true }).trades.civil.wage).toBe(999);
    expect(applyBasis(s, 'cpwd').trades.civil.wage).toBe(100);
  });
  it('leaves custom trades and materials alone', () => {
    let s = sampleState();
    s = { ...s, trades: { ...s.trades, x1: { name: 'Welder', wage: 150, count: 0 } } };
    expect(applyBasis(s, 'cpwd').trades.x1.wage).toBe(150);
  });
});

describe('basis text', () => {
  it('names the basis and the GST', () => {
    expect(basisInfo({ basis: 'tn', gst: '18' })).toContain('22.07.2025');
    expect(basisInfo({ basis: 'tn', gst: '18' })).toContain('GST of 18%');
    expect(basisInfo({ basis: 'mkt', gst: '0' })).toContain('No GST is added');
    expect(basisInfo({ basis: 'cpwd', gst: '18', station: '115', customIndex: '115' })).toContain('= +15%');
  });
  it('station labels', () => {
    expect(stationLabel({ station: '115', customIndex: '' })).toContain('Chennai');
    expect(stationLabel({ station: 'custom', customIndex: '110' })).toContain('110');
    expect(STATIONS.length).toBe(28);
  });
});
