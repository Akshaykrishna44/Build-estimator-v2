import { describe, it, expect, vi, afterEach } from 'vitest';
import { reportHtml, pieSlices, COLORS, download } from '../report.js';
import { calculate } from '../calc.js';
import { buildReportPdf } from '../pdf.js';
import { sampleState } from '../../test/helpers.js';
import { createInitialState } from '../../state/initial.js';
import { reducer } from '../../state/reducer.js';

const evil = '<img src=x onerror="window.__x=1">';
function evilState() {
  let s = sampleState();
  s = reducer(s, { type: 'addSection', name: evil });
  s = reducer(s, { type: 'updateItem', id: 101, field: 'n', value: evil });
  s = reducer(s, { type: 'addMaterial', name: evil, unit: '<b>m</b>', waste: '5', rate: '10' });
  s = reducer(s, { type: 'addTrade', name: evil, wage: '10', count: '1' });
  s = reducer(s, { type: 'addDoor' });
  s = reducer(s, { type: 'updateDoor', id: 101, field: 'name', value: evil });
  s = reducer(s, { type: 'addType', name: evil, from: 'shed' });
  return s;
}

describe('report html', () => {
  const s = sampleState(), R = calculate(s), html = reportHtml(s, R);
  it('has every section', () => {
    for (const k of ['Construction estimation report', 'Project', 'Summary', 'Cost per measurement', 'Wood and timber requirement', 'Cost split', 'Land digging', 'Phase summary', 'Workers by trade', 'Materials required (bill of materials)', 'Rate basis', 'Tamil Nadu PWD SOR 2025-26']) expect(html).toContain(k);
  });
  it('shows the total and has no NaN', () => {
    expect(html).toContain(Number(Math.round(R.total)).toLocaleString('en-IN'));
    expect(html).not.toMatch(/NaN|undefined|Infinity/);
  });
  it('escapes names so HTML in them is shown as text', () => {
    const e = evilState();
    const out = reportHtml(e, calculate(e));
    expect(out).not.toContain('<img src=x');
    expect(out).toContain('&lt;img src=x');
  });
  it('mentions the CPWD cost index on that basis', () => {
    const c = reducer(sampleState(), { type: 'input', name: 'basis', value: 'cpwd' });
    expect(reportHtml(c, calculate(c))).toContain('CPWD cost index over DSR 2023');
  });
});


describe('pie slices', () => {
  it('draws one slice per positive part, in order, with the palette', () => {
    const parts = [['a', 50], ['b', 30], ['c', 0], ['d', 20]];
    const sl = pieSlices(parts, 100);
    expect(sl.map((x) => x.label)).toEqual(['a', 'b', 'd']);
    expect(sl[0].fill).toBe(COLORS[0]);
    expect(sl.every((x) => x.d && x.d.startsWith('M100 100'))).toBe(true);
  });
  it('a single part is a full circle; nothing to draw for a zero total', () => {
    expect(pieSlices([['a', 10]], 10)[0].circle).toBe(true);
    expect(pieSlices([['a', 0]], 0)).toEqual([]);
  });
});

describe('download', () => {
  afterEach(() => { delete window.claude; });
  it('uses a link download by default', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:x'); URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    await download('a.csv', 'x', 'text/csv');
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });
  it('uses the Claude downloads capability when it is there', async () => {
    const save = vi.fn().mockResolvedValue({ status: 'saved' });
    window.claude = { use: vi.fn().mockResolvedValue({ save }) };
    URL.createObjectURL = vi.fn();
    await download('a.csv', 'x', 'text/csv');
    expect(save).toHaveBeenCalledWith({ filename: 'a.csv', data: 'x' });
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
  it('does nothing more when the viewer declines', async () => {
    window.claude = { use: vi.fn().mockResolvedValue({ save: vi.fn().mockRejectedValue({ code: 'declined' }) }) };
    URL.createObjectURL = vi.fn();
    await download('a.csv', 'x', 'text/csv');
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
  it('falls back to a link when the capability is unavailable', async () => {
    window.claude = { use: vi.fn().mockResolvedValue(null) };
    URL.createObjectURL = vi.fn(() => 'blob:x'); URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    await download('a.csv', 'x', 'text/csv');
    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });
});

describe('report pdf', () => {
  const s = sampleState(), R = calculate(s);
  it('makes a real multi-section PDF', () => {
    const doc = buildReportPdf(s, R), bytes = new Uint8Array(doc.output('arraybuffer'));
    expect(String.fromCharCode(...bytes.slice(0, 5))).toBe('%PDF-');
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(2);
  });
  it('contains the key figures and no NaN', () => {
    const txt = Buffer.from(buildReportPdf(s, R).output('arraybuffer')).toString('latin1');
    expect(txt).not.toMatch(/NaN|undefined|Infinity/);
    expect(buildReportPdf(s, R).internal.pages.flat().join(' ')).toContain('Construction estimation report');
  });
  it('works for interior design, land price and CPWD too', () => {
    let t = reducer(reducer(s, { type: 'input', name: 'type', value: 'office' }), { type: 'input', name: 'landPrice', value: '2000' });
    t = reducer(t, { type: 'input', name: 'basis', value: 'cpwd' });
    const doc = buildReportPdf(t, calculate(t));
    expect(doc.internal.pages.flat().join(' ')).toMatch(/Interior design|False ceiling/);
  });
});
