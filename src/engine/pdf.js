import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { num, fq } from './format.js';
import { BASES } from '../data/bases.js';
import { stationLabel } from '../state/basis.js';
import { typeLabel } from './report.js';

// The built-in PDF fonts have no rupee sign, so the PDF writes "Rs." instead.
const rs = (n) => 'Rs. ' + num(n);
const NAVY = [20, 33, 61], GOLD = [242, 183, 5], GREY = [238, 240, 242];

/** The estimate as a PDF (jsPDF document). Numeric columns are right-aligned, text columns left-aligned. */
export function buildReportPdf(state, R) {
  const I = state.inputs;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth(), M = 40;
  let y = 48;

  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(...NAVY).text('Construction estimation report', M, y);
  y += 16;
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(90, 101, 119).text(`Generated ${new Date().toLocaleDateString('en-IN')}. Indicative estimate.`, M, y);
  y += 10;

  const section = (title) => {
    if (y > doc.internal.pageSize.getHeight() - 110) { doc.addPage(); y = 48; }
    y += 16;
    doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...NAVY).text(title, M, y);
    doc.setDrawColor(...GOLD).setLineWidth(1.5).line(M, y + 4, W - M, y + 4);
    y += 10;
  };
  // right: indexes of columns to right-align (numbers). Everything else is left-aligned text.
  const table = (head, body, right = [], opts = {}) => {
    const columnStyles = {};
    head.forEach((_, i) => { columnStyles[i] = { halign: right.includes(i) ? 'right' : 'left' }; });
    autoTable(doc, {
      startY: y, head: [head], body, margin: { left: M, right: M }, theme: 'grid', columnStyles,
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 4, textColor: NAVY, lineColor: [211, 216, 223], lineWidth: 0.4, overflow: 'linebreak' },
      headStyles: { fillColor: GREY, textColor: [60, 70, 90], fontStyle: 'bold', halign: 'left' },
      didParseCell: (d) => { if (d.section === 'head') d.cell.styles.halign = right.includes(d.column.index) ? 'right' : 'left'; },
      ...opts,
    });
    y = doc.lastAutoTable.finalY;
  };

  const base = BASES[I.basis];
  section('Project');
  table(['Item', 'Value'], [
    ['Project type', typeLabel(state)],
    ['Rate basis', base.label + (I.basis === 'cpwd' ? ', ' + stationLabel(I) : '')],
    ['Land area', `${num(R.LAND)} sq ft (${(R.LAND / 435.6).toFixed(2)} cents, ${(R.LAND / 43560).toFixed(3)} acres)`],
    ['Length x breadth x height', `${num(R.FL)} x ${num(R.WD)} x ${num(R.HT)} ft`],
    ['Built-up area', `${num(R.BS)} sq ft on ${R.F} floor${R.F > 1 ? 's' : ''} (plan ${num(R.PLAN)} sq ft)`],
    ['Schedule', `${R.D} working days, ${R.H} hours a day`],
  ]);

  section('Summary');
  table(['Item', 'Amount'], [
    ['Total estimate', rs(R.total)],
    ...(R.LCOST > 0 ? [['Land cost', rs(R.LCOST)], ['Total with land', rs(R.total + R.LCOST)]] : []),
    ['Materials', rs(R.mc)], ['Labour', rs(R.lc)], ['Equipment', rs(R.ec)],
    ...(R.ebv > 0 ? [['Electricity board charges (outside overhead and GST)', rs(R.ebv)]] : []),
    ['Overhead and contingency', rs(R.ohv + R.ctv)], [`GST (${(R.GS * 100).toFixed(0)}%)`, rs(R.gv)],
    ['Labour share of budget', `${(R.labPct * 100).toFixed(1)}% (limit ${(R.LIM * 100).toFixed(0)}%, ${R.labOver > 0 ? 'over by ' + rs(R.labOver) : 'within the limit'})`],
    ['Man-hours', num(R.hrs)], ['Cost per sq ft built-up', R.BS ? rs(R.total / R.BS) : '-'],
  ], [1]);

  section('Cost split');
  table(['Part', 'Amount', 'Share'], R.parts.map(([n, v]) => [n, rs(v), (R.total ? (v / R.total) * 100 : 0).toFixed(1) + '%']), [1, 2]);

  section('Cost per measurement');
  table(['Measurement', 'Size', 'Total cost per unit', 'Construction cost per unit'],
    R.pm.map((r) => [r.name, `${r.sizeUnit === 'cents' ? r.size.toFixed(2) : r.sizeUnit === 'acres' ? r.size.toFixed(3) : num(r.size)} ${r.sizeUnit}`, r.perTotal === null ? '-' : rs(r.perTotal) + ' ' + r.unit, r.perBase === null ? '-' : rs(r.perBase) + ' ' + r.unit]), [1, 2, 3]);

  section('Phase summary');
  table(['Phase', 'Materials', 'Man-hours', 'Labour', 'Equipment', 'Days'],
    Object.keys(R.phases).map((n) => { const p = R.phases[n]; return [n, rs(p.m), num(p.h), rs(p.l), rs(p.e), p.dk ? 'Not set' : String(p.d)]; }), [1, 2, 3, 4, 5]);

  section('Workers by trade');
  table(['Trade', 'Man-hours', 'Workers needed', 'Labourers planned', 'Labour cost'],
    R.tr.map(([k, h, w, c]) => { const pl = state.trades[k] ? state.trades[k].count || 0 : 0; return [state.trades[k] ? state.trades[k].name : k, num(h), String(w), pl > 0 ? String(pl) : 'Not set', rs(c)]; }), [1, 2, 3, 4]);

  section('Materials required (bill of materials)');
  table(['Material', 'Grade and specification', 'Quantity', 'Unit', 'Rate', 'Cost'],
    R.bom.map((x) => [x.name, x.grade, fq(x.qty), x.unit, rs(x.rate), rs(x.cost)])
      .concat([['Total materials and components', '', '', '', '', rs(R.bom.reduce((a, x) => a + x.cost, 0))]]), [2, 4, 5],
    { columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 150 }, 2: { halign: 'right' }, 3: { halign: 'left' }, 4: { halign: 'right' }, 5: { halign: 'right' } } });

  section('Wood and timber requirement');
  table(['Source', 'Material', 'Quantity', 'Unit', 'Cost'],
    R.wl.map((x) => [x.src, x.mat, fq(x.q), x.u, x.k === 'dw' ? 'Included' : rs(x.c)])
      .concat([['Total timber', '', fq(R.tcft), 'cft', ''], ['Total plywood and boards', '', fq(R.tsq), 'sq ft', ''], ['Total wood cost (excluding doors and windows)', '', '', '', rs(R.twc)]]), [2, 4],
    { columnStyles: { 0: { cellWidth: 170 }, 2: { halign: 'right' }, 3: { halign: 'left' }, 4: { halign: 'right' } } });

  if (R.pw.on) {
    section('Electricity board charges and substation');
    table(['Item', 'Value'], [
      ['Connected load', `${num(R.pw.loadKw)} kW`], ['Demand applied for', `${num(R.pw.kva)} kVA`],
      ['Supply', R.pw.substation ? `HT supply with a ${num(R.pw.trfKva)} kVA transformer` : 'LT supply, no substation'],
    ]);
    y += 8;
    table(['Charge paid to the board', 'Quantity', 'Rate', 'Cost'], R.pw.ebRows.map((x) => [x.name + (x.refund ? ' (refundable)' : ''), `${num(x.qty)} ${x.unit}`, rs(x.rate), rs(x.cost)])
      .concat([['Total electricity board charges', '', '', rs(R.pw.ebCost)]]), [1, 2, 3]);
    if (R.pw.subRows.length) {
      y += 8;
      table(['Substation and incoming supply works', 'Quantity', 'Rate', 'Cost'], R.pw.subRows.map((x) => [x.name, `${num(x.qty)} ${x.unit}`, rs(x.rate), rs(x.cost)])
        .concat([['Total substation and supply works', '', '', rs(R.pw.subCost)]]), [1, 2, 3]);
    }
  }
  if (R.sol.on && R.sol.kwp > 0) {
    section('Solar installation');
    table(['Item', 'Value'], [['System', R.sol.sysName], ['Roof type', R.sol.mountName], ['Size', `${num(R.sol.kwp)} kWp`], ['Units a year', `${num(R.sol.kwh)} kWh`]]);
    y += 8;
    table(['Item', 'Quantity', 'Rate', 'Cost'], R.sol.rows.map((x) => [x.name, `${num(x.qty)} ${x.unit}`, rs(x.rate), rs(x.cost)])
      .concat([['Total solar installation', '', '', rs(R.sol.cost)]]), [1, 2, 3]);
  }

  y += 18;
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(90, 101, 119);
  const note = doc.splitTextToSize('This is an indicative estimate, not a quotation, a tender bill of quantities or engineering advice. Norms and rates are illustrative. Check them against local rates and a qualified engineer before making financial decisions.', W - 2 * M);
  if (y + note.length * 10 > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); y = 48; }
  doc.text(note, M, y);

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i).setFontSize(8).setTextColor(120, 130, 145);
    doc.text(`Page ${i} of ${pages}`, W - M, doc.internal.pageSize.getHeight() - 20, { align: 'right' });
  }
  return doc;
}
