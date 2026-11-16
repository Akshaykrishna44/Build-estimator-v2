import { describe, it, expect } from 'vitest';
import { reducer } from '../../state/reducer.js';
import { createInitialState } from '../../state/initial.js';
import { calculate } from '../calc.js';
import { powerEstimate, solarEstimate, transformerFor } from '../power.js';
import { stateWith } from '../../test/helpers.js';
import { buildReportPdf } from '../pdf.js';
import { reportHtml } from '../report.js';

const on = (type, extra = {}) => {
  let s = stateWith({ type, ...extra });
  s = reducer(s, { type: 'setPower', field: 'mode', value: 'on' });
  return s;
};
const withSolar = (s, mode = 'auto') => reducer(s, { type: 'setSolar', field: 'mode', value: mode });

describe('electricity board charges and substation', () => {
  it('picks the next standard transformer, and several units above the largest', () => {
    expect(transformerFor(0)).toEqual({ kva: 0, units: 0 });
    expect(transformerFor(60)).toEqual({ kva: 63, units: 1 });
    expect(transformerFor(251)).toEqual({ kva: 315, units: 1 });
    expect(transformerFor(2500)).toEqual({ kva: 2500, units: 1 });
    expect(transformerFor(3000)).toEqual({ kva: 5000, units: 2 });
  });

  it('an industrial plant needs a substation; a small home does not', () => {
    const f = calculate(on('manuf'));
    expect(f.pw.loadKw).toBeCloseTo((200 * 108 * 12) / 1000, 6);
    expect(f.pw.substation).toBe(true);
    expect(f.pw.cls).toBe('ht');
    expect(f.pw.trfKva).toBeGreaterThanOrEqual(f.pw.kva);
    const h = calculate(on('home', { len: '40', wid: '30', floors: '2' }));
    expect(h.pw.substation).toBe(false);
    expect(h.pw.trfKva).toBe(0);
    expect(h.pw.ebRows.some((r) => /HT/.test(r.name))).toBe(false);
    expect(h.pw.ebRows.some((r) => /LT/.test(r.name))).toBe(true);
  });

  it('data centres and energy buildings always get a substation, even when small', () => {
    for (const t of ['dc', 'pwr', 'semi']) expect(calculate(on(t, { len: '20', wid: '20', floors: '1' })).pw.substation).toBe(true);
  });

  it('the substation choice and the manual kW can be overridden', () => {
    let s = reducer(on('home', { len: '40', wid: '30', floors: '2' }), { type: 'setPower', field: 'subMode', value: 'yes' });
    expect(calculate(s).pw.substation).toBe(true);
    s = reducer(on('manuf'), { type: 'setPower', field: 'subMode', value: 'no' });
    const r = calculate(s).pw;
    expect(r.substation).toBe(false);
    expect(r.warn.length).toBe(1);
    s = reducer(reducer(on('home'), { type: 'setPower', field: 'loadMode', value: 'manual' }), { type: 'setPower', field: 'loadKw', value: '500' });
    expect(calculate(s).pw.loadKw).toBe(500);
  });

  it('demand follows the demand factor, power factor and margin', () => {
    let s = reducer(on('manuf'), { type: 'setPower', field: 'loadMode', value: 'manual' });
    s = reducer(s, { type: 'setPower', field: 'loadKw', value: '900' });
    const r = calculate(s).pw;
    expect(r.demandKva).toBeCloseTo((900 * 0.7) / 0.9, 6);
    expect(r.kva).toBe(Math.ceil(r.demandKva * 1.2));
  });

  it('EB charges are outside overhead and GST; substation works are inside', () => {
    const s = on('manuf');
    const R = calculate(s), off = calculate(reducer(s, { type: 'setPower', field: 'mode', value: 'off' }));
    expect(R.ebv).toBeCloseTo(R.pw.ebCost, 6);
    expect(R.ebv).toBeGreaterThan(0);
    // total grows by the EB charges plus the substation works with their overhead, contingency and GST
    const gross = (R.total - R.ebv) / R.base;
    const contractor = R.pw.subCost + R.pw.lab;
    expect(R.total - off.total).toBeCloseTo(R.ebv + contractor * gross, 4);
    expect(off.total).toBe(calculate(stateWith({ type: 'manuf' })).total);
  });

  it('electrician hours of the substation count in the labour share', () => {
    const R = calculate(on('manuf'));
    expect(R.pw.hours).toBeGreaterThan(0);
    expect(R.phases['Electrical substation and incoming supply']).toBeTruthy();
    expect(R.tr.find(([k]) => k === 'elec')[1]).toBeGreaterThanOrEqual(R.pw.hours);
    expect(R.parts.at(-1)[0]).toBe('Electricity board charges');
    expect(R.parts.reduce((a, [, v]) => a + v, 0)).toBeCloseTo(R.total, 4);
  });

  it('items are editable, can be added and deleted, and reset', () => {
    let s = reducer(on('manuf'), { type: 'updatePowerItem', id: 3, field: 'rate', value: '0' });
    expect(calculate(s).pw.ebRows.find((r) => r.id === 3).cost).toBe(0);
    s = reducer(s, { type: 'addPowerItem', grp: 'eb', name: 'Extra' });
    const id = s.power.items.at(-1).id;
    s = reducer(s, { type: 'updatePowerItem', id, field: 'rate', value: '1000' });
    expect(calculate(s).pw.ebRows.find((r) => r.id === id).cost).toBe(1000);
    s = reducer(s, { type: 'deletePowerItem', id });
    expect(s.power.items.some((r) => r.id === id)).toBe(false);
    expect(reducer(s, { type: 'resetPower' }).power).toEqual(createInitialState().power);
  });

  it('nothing is charged before a project type is chosen, or when switched off', () => {
    expect(powerEstimate(createInitialState(), 1000).on).toBe(false);
    expect(calculate(reducer(on('manuf'), { type: 'setPower', field: 'mode', value: 'off' })).pw.on).toBe(false);
  });
});

describe('solar installation', () => {
  it('is automatic for industries and off for other buildings', () => {
    expect(calculate(withSolar(stateWith({ type: 'shed' }))).sol.on).toBe(true);
    expect(calculate(withSolar(stateWith({ type: 'office' }))).sol.on).toBe(false);
    expect(calculate(withSolar(stateWith({ type: 'office' }), 'on')).sol.on).toBe(true);
    expect(calculate(withSolar(stateWith({ type: 'shed' }), 'off')).sol.on).toBe(false);
  });

  it('sizes from the roof: plan area × usable % ÷ area per kWp, on a sheet roof for a shed', () => {
    const R = calculate(withSolar(stateWith({ type: 'shed' })));
    expect(R.sol.mountKey).toBe('sheet');
    expect(R.sol.kwp).toBeCloseTo((200 * 108 * 0.6) / 85, 6);
    expect(R.sol.cost).toBeCloseTo(R.sol.kwp * (45000 + 3000) + 25000, 4);
    expect(R.sol.kwh).toBeCloseTo(R.sol.kwp * 1450, 6);
    expect(R.phases['Solar installation']).toBeTruthy();
    expect(R.bom.some((b) => b.cat === 'Solar installation')).toBe(true);
  });

  it('every rooftop solar type can be chosen and changes the price', () => {
    const costs = {};
    for (const k of ['on', 'hybrid', 'off']) {
      const s = reducer(withSolar(stateWith({ type: 'office' }), 'on'), { type: 'setSolar', field: 'sys', value: k });
      costs[k] = calculate(s).sol.cost;
    }
    expect(costs.hybrid).toBeGreaterThan(costs.on);
    expect(costs.off).toBeGreaterThan(costs.hybrid);
    // an RCC roof for an office
    expect(calculate(withSolar(stateWith({ type: 'office' }), 'on')).sol.mountKey).toBe('rcc');
  });

  it('works for every project type when included', () => {
    const types = ['shed', 'dc', 'home', 'villa', 'apt', 'hospital', 'school', 'mall', 'hotel', 'carpark', 'transit', 'pwr'];
    for (const t of types) {
      const R = calculate(withSolar(stateWith({ type: t }), 'on'));
      expect(R.sol.on).toBe(true);
      expect(R.sol.kwp).toBeGreaterThan(0);
      expect(Number.isFinite(R.total)).toBe(true);
    }
  });

  it('manual size, ground mounting and warnings', () => {
    let s = reducer(withSolar(stateWith({ type: 'office' }), 'on'), { type: 'setSolar', field: 'mount', value: 'ground' });
    expect(calculate(s).sol.kwp).toBe(0);
    expect(calculate(s).sol.warn.length).toBe(1);
    s = reducer(s, { type: 'setSolar', field: 'kwp', value: '250' });
    expect(calculate(s).sol.kwp).toBe(250);
    s = reducer(reducer(s, { type: 'setSolar', field: 'mount', value: 'rcc' }), { type: 'setSolar', field: 'sizeMode', value: 'manual' });
    s = reducer(s, { type: 'setSolar', field: 'kwp', value: '99999' });
    expect(calculate(s).sol.warn.some((w) => /roof holds/.test(w))).toBe(true);
  });

  it('solar types can be edited, added and deleted; the last one cannot be deleted', () => {
    let s = withSolar(stateWith({ type: 'office' }), 'on');
    s = reducer(s, { type: 'updateSolarType', key: 'on', field: 'rate', value: '1' });
    expect(s.solar.types.on.rate).toBe(1);
    s = reducer(s, { type: 'addSolarType', name: 'Mine' });
    const k = s.solar.sys;
    expect(s.solar.types[k].name).toBe('Mine');
    s = reducer(s, { type: 'updateSolarMount', key: 'rcc', field: 'rate', value: '9000' });
    expect(s.solar.mounts.rcc.rate).toBe(9000);
    s = reducer(s, { type: 'deleteSolarType', key: k });
    expect(s.solar.types[k]).toBeUndefined();
    expect(s.solar.sys).not.toBe(k);
    for (const key of ['hybrid', 'off']) s = reducer(s, { type: 'deleteSolarType', key });
    s = reducer(s, { type: 'deleteSolarType', key: 'on' });
    expect(Object.keys(s.solar.types).length).toBe(1);
    expect(Number.isFinite(calculate(s).total)).toBe(true);
    expect(reducer(s, { type: 'resetSolar' }).solar).toEqual(createInitialState().solar);
  });

  it('solar labour counts in the labour share and the 35% rule uses the new total', () => {
    const R = calculate(withSolar(stateWith({ type: 'shed' })));
    expect(R.sol.hours).toBeGreaterThan(0);
    expect(R.labPct).toBeCloseTo(R.lc / R.total, 9);
  });

  it('solarEstimate handles a missing solar state', () => {
    const s = { ...createInitialState(), solar: undefined };
    expect(solarEstimate(s, 1000).on).toBe(false);
  });
});

describe('reports include electricity board and solar', () => {
  it('PDF and HTML report build with both sections', () => {
    const s = withSolar(on('manuf'), 'on');
    const R = calculate(s);
    expect(buildReportPdf(s, R).getNumberOfPages()).toBeGreaterThan(1);
    const h = reportHtml(s, R);
    expect(h).toContain('Electricity board charges and substation');
    expect(h).toContain('Solar installation');
    const none = reportHtml(stateWith({ type: 'manuf' }), calculate(stateWith({ type: 'manuf' })));
    expect(none).not.toContain('Electricity board charges and substation');
  });
});
