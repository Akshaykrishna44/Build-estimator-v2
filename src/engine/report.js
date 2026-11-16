import { fmt, num, fq, esc } from './format.js';
import { BASES } from '../data/bases.js';
import { stationLabel } from '../state/basis.js';
import { TYPE_GROUPS } from '../data/types.js';

const rbName = (inputs) => BASES[inputs.basis].label + (inputs.basis === 'cpwd' ? ', ' + stationLabel(inputs) : '');
const tbl = (head, rows) => `<table><tr>${head.map((c, i) => `<th class="${i ? 'r' : ''}">${c}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c, i) => `<td class="${i ? 'r' : ''}">${c}</td>`).join('')}</tr>`).join('')}</table>`;
const COLORS = ['#3a5a8c', '#f2b705', '#2f9e7a', '#7a8aa3', '#c9d0db', '#e07a5f'];

/** SVG paths for a pie of [label, value] parts. */
export function pieSlices(parts, total, stroke = '#fff') {
  let a0 = -Math.PI / 2;
  const out = [];
  parts.forEach(([label, v], i) => {
    if (!(v > 0) || !(total > 0)) return;
    const a1 = a0 + (v / total) * 2 * Math.PI;
    if (v / total > 0.9999) out.push({ i, label, circle: true, fill: COLORS[i] });
    else {
      const p = (a, r) => [(100 + r * Math.cos(a)).toFixed(2), (100 + r * Math.sin(a)).toFixed(2)];
      const [x0, y0] = p(a0, 90), [x1, y1] = p(a1, 90);
      out.push({ i, label, fill: COLORS[i], stroke, d: `M100 100 L${x0} ${y0} A90 90 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1} Z` });
    }
    a0 = a1;
  });
  return out;
}
export { COLORS };
const pieSvg = (parts, total) => pieSlices(parts, total).map((s) => (s.circle ? `<circle cx="100" cy="100" r="90" fill="${s.fill}"/>` : `<path d="${s.d}" fill="${s.fill}" style="stroke:#fff;stroke-width:2"/>`)).join('');

/** The estimate as a printable HTML document. All names are escaped. */
export function reportHtml(state, R) {
  const I = state.inputs;
  const typeName = typeLabel(state);
  const pct = (x) => (R.total ? ((x / R.total) * 100).toFixed(1) + '%' : '0%');
  const sw = (i) => `<span style="display:inline-block;width:10px;height:10px;background:${COLORS[i]};margin-right:6px"></span>`;
  const phaseRows = Object.keys(R.phases).map((n) => { const p = R.phases[n]; return [esc(n), fmt(p.m), num(p.h), fmt(p.l), fmt(p.e), p.dk ? 'Not set' : p.d, R.BS ? fmt((p.m + p.l + p.e) / R.BS) : '-']; });
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Construction estimation report</title><style>body{font:14px/1.5 Arial,sans-serif;color:#14213d;max-width:900px;margin:24px auto;padding:0 16px}h1{margin:0 0 4px}h2{margin:26px 0 8px;font-size:17px;border-bottom:2px solid #f2b705;padding-bottom:4px}table{width:100%;border-collapse:collapse;margin:6px 0}th,td{padding:6px 8px;border-bottom:1px solid #d3d8df;text-align:left}th{background:#eef0f2}.r{text-align:right}.pie{display:flex;gap:24px;align-items:center}.note{color:#5b6577;font-size:12px}@media print{body{margin:0}}</style></head><body>
<h1>Construction estimation report</h1><div class="note">Generated ${new Date().toLocaleDateString('en-IN')}. Indicative estimate.</div>
<h2>Project</h2>${tbl(['Item', 'Value'], [['Project type', esc(typeName)], ['Rate basis', esc(rbName(I))], ...(R.CIP > 0 ? [['CPWD cost index over DSR 2023', '+' + (R.CIP * 100).toFixed(0) + '%']] : []), ['Land area', `${num(R.LAND)} sq ft (${(R.LAND / 435.6).toFixed(2)} cents, ${(R.LAND / 43560).toFixed(3)} acres)`], ...(R.LPS > 0 ? [['Land price', `₹${R.LPS.toFixed(2)} per sq ft`]] : []), ['Length of the building', `${num(R.FL)} ft`], ['Breadth of the building', `${num(R.WD)} ft`], ['Height of the building', `${num(R.HT)} ft`], ['Plan area', `${num(R.PLAN)} sq ft`], ['Built-up area', `${num(R.BS)} sq ft (${num(R.A)} m²)`], ['Floors', R.F], ['External wall area', `${num(R.WALLFT)} sq ft`], ['Schedule', `${R.D} working days, ${R.H} hours a day`], ['Location cost factor', esc(I.loc)], ['Overhead', esc(I.oh) + '%'], ['Contingency', esc(I.ct) + '%']])}
<h2>Summary</h2>${tbl(['Item', 'Amount'], [['Total estimate', fmt(R.total)], ...(R.LCOST > 0 ? [['Land cost', fmt(R.LCOST)], ['Total with land', fmt(R.total + R.LCOST)]] : []), ['Materials', fmt(R.mc)], ['Labour', fmt(R.lc)], ['Equipment', fmt(R.ec)], ...(R.ebv > 0 ? [['Electricity board charges (outside overhead and GST)', fmt(R.ebv)]] : []), ['Overhead and contingency', fmt(R.ohv + R.ctv)], [`GST (${(R.GS * 100).toFixed(0)}%)`, fmt(R.gv)], ['Labour share of budget', `${(R.labPct * 100).toFixed(1)}% (limit ${(R.LIM * 100).toFixed(0)}%, ${R.labOver > 0 ? 'over by ' + fmt(R.labOver) : 'within the limit'})`], ['Man-hours', num(R.hrs)], ['Workers across all trades', R.peak], ['Duration with your crews', R.projDays === null ? 'Not set' : R.projDays + ' days'], ['Maximum workers on site', R.cap > 0 ? `${R.cap} (planned ${R.planTot})` : 'No limit'], ['Cost per sq ft built-up', R.BS ? fmt(R.total / R.BS) : '-']])}
<h2>Cost per measurement</h2>${tbl(['Measurement', 'Size', 'Unit', 'Total cost per unit', 'Construction cost per unit', 'Total with land per unit'], R.pm.map((r) => [esc(r.name), `${r.sizeUnit === 'cents' ? r.size.toFixed(2) : r.sizeUnit === 'acres' ? r.size.toFixed(3) : num(r.size)} ${r.sizeUnit}`, r.unit, r.perTotal === null ? '-' : fmt(r.perTotal), r.perBase === null ? '-' : fmt(r.perBase), R.LCOST > 0 && r.perWithLand !== null ? fmt(r.perWithLand) : '-']))}
<h2>Wood and timber requirement</h2>${tbl(['Source', 'Material', 'Type and grade', 'Quantity', 'Unit', 'Cost'], R.wl.map((x) => [esc(x.src), esc(x.mat), esc(x.grade), fq(x.q), x.u, x.k === 'dw' ? 'Included' : fmt(x.c)]).concat([['Total timber', '', '', fq(R.tcft), 'cft', ''], ['Total plywood and boards', '', '', fq(R.tsq), 'sq ft', ''], ['Total wood cost (excluding doors and windows)', '', '', '', '', fmt(R.twc)]]))}
<h2>Cost split</h2><div class="pie"><svg viewBox="0 0 200 200" width="180" height="180">${pieSvg(R.parts, R.total)}</svg><div style="flex:1">${tbl(['Part', 'Amount', 'Share'], R.parts.map(([nm, x], i) => [sw(i) + esc(nm), fmt(x), pct(x)]))}</div></div>
<h2>Land digging</h2>${R.dg.rows.length ? tbl(['Work', 'Quantity', 'Man-hours', 'Labour cost', 'Machine cost'], R.dg.rows.map((r) => [esc(r.n), `${num(r.q)} ${esc(r.u)}`, num(r.h), fmt(r.l), fmt(r.e)]).concat([['Total', '', '', fmt(R.dg.l), fmt(R.dg.e)]])) : '<p class="note">No work item is marked as land digging.</p>'}
<h2>Phase summary</h2>${tbl(['Phase', 'Materials', 'Man-hours', 'Labour', 'Equipment', 'Days with your crews', 'Cost per sq ft built-up'], phaseRows)}
<h2>Workers by trade</h2>${tbl(['Trade', 'Man-hours', 'Workers needed', 'Labourers planned', 'Days needed with planned', 'Labour cost'], R.tr.map(([k, h, w, c]) => { const pl = state.trades[k] ? state.trades[k].count || 0 : 0; return [esc(state.trades[k] ? state.trades[k].name : k), num(h), w, pl > 0 ? pl : 'Not set', pl > 0 ? Math.ceil(h / (pl * R.H)) : '-', fmt(c)]; }))}
<h2>Materials required (bill of materials)</h2>${tbl(['Category', 'Material', 'Grade and specification', 'Quantity used', 'Calculated quantity', 'Unit', 'Rate', 'Cost', 'Used in'], R.bom.map((x) => [esc(x.cat), esc(x.name), esc(x.grade), fq(x.qty), fq(x.calc), esc(x.unit), fmt(x.rate), fmt(x.cost), esc(x.used)]))}
${R.pw.on ? `<h2>Electricity board charges and substation</h2>${tbl(['Item', 'Value'], [['Connected load', num(R.pw.loadKw) + ' kW'], ['Demand applied for', num(R.pw.kva) + ' kVA'], ['Supply', R.pw.substation ? 'HT supply, ' + num(R.pw.trfKva) + ' kVA transformer' : 'LT supply, no substation']])}${tbl(['Charge paid to the board', 'Quantity', 'Rate', 'Cost'], R.pw.ebRows.map((x) => [esc(x.name) + (x.refund ? ' (refundable)' : ''), num(x.qty) + ' ' + esc(x.unit), fmt(x.rate), fmt(x.cost)]).concat([['Total electricity board charges', '', '', fmt(R.pw.ebCost)]]))}${R.pw.subRows.length ? tbl(['Substation and incoming supply works', 'Quantity', 'Rate', 'Cost'], R.pw.subRows.map((x) => [esc(x.name), num(x.qty) + ' ' + esc(x.unit), fmt(x.rate), fmt(x.cost)]).concat([['Total substation and supply works', '', '', fmt(R.pw.subCost)]])) : ''}` : ''}
${R.sol.on && R.sol.kwp > 0 ? `<h2>Solar installation</h2>${tbl(['Item', 'Value'], [['System', esc(R.sol.sysName)], ['Roof type', esc(R.sol.mountName)], ['Size', num(R.sol.kwp) + ' kWp'], ['Units a year', num(R.sol.kwh) + ' kWh']])}${tbl(['Item', 'Quantity', 'Rate', 'Cost'], R.sol.rows.map((x) => [esc(x.name), num(x.qty) + ' ' + esc(x.unit), fmt(x.rate), fmt(x.cost)]).concat([['Total solar installation', '', '', fmt(R.sol.cost)]]))}` : ''}
<p class="note">This is an indicative estimate, not a quotation, a tender bill of quantities or engineering advice. Norms and rates are illustrative. Check them against local rates and a qualified engineer before making financial decisions.</p></body></html>`;
}

export function typeLabel(state) {
  const c = state.ctypes.find((t) => t.key === state.inputs.type);
  if (c) return c.name;
  for (const g of TYPE_GROUPS) for (const [k, n] of g.options) if (k === state.inputs.type) return n;
  return state.inputs.type;
}

/**
 * Hand a file to the browser as a download. Inside the Claude artifact viewer the file is offered through its
 * "downloads" capability (a normal link download is blocked there); everywhere else a link download is used.
 */
export async function download(name, data, mime) {
  try {
    if (typeof window !== 'undefined' && window.claude && window.claude.use) {
      const d = await window.claude.use('downloads');
      if (d) { await d.save({ filename: name, data }); return; }
    }
  } catch (e) {
    if (e && e.code === 'declined') return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type: mime }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
