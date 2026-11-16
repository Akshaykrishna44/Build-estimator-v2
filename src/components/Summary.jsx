import React from 'react';
import { ConfirmButton, H2 } from './common.jsx';
import PieChart from './PieChart.jsx';
import { buildKpis, labourMessage } from './kpis.js';
import { COLORS, download, reportHtml } from '../engine/report.js';
import { fmt, num } from '../engine/format.js';

export function Toolbar({ state, R, dispatch }) {
  return (
    <div className="toolbar">
      <button type="button" className="btn" onClick={() => download('Construction-estimation-report.html', reportHtml(state, R), 'text/html')}>Download report</button>
      <button type="button" className="btn ghost" onClick={async () => { const { buildReportPdf } = await import('../engine/pdf.js'); await download('Construction-estimation-report.pdf', buildReportPdf(state, R).output('arraybuffer'), 'application/pdf'); }}>Download PDF</button>
      <ConfirmButton className="btn ghost" onConfirm={() => dispatch({ type: 'reset' })}>Reset everything</ConfirmButton>
    </div>
  );
}

export function Kpis({ R }) {
  const msg = labourMessage(R);
  return (
    <>
      <div className="kpis" id="kpis">
        {buildKpis(R).map((k) => (
          <div key={k.label} className={`kpi ${k.cls || ''}`}><b title={k.value}>{k.value}</b><span>{k.label}</span></div>
        ))}
      </div>
      <p className={`labnote ${msg.cls}`} id="labnote" aria-live="polite"><b>{msg.head}</b>{msg.body}</p>
    </>
  );
}

export function CostSplit({ R }) {
  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <b>Cost split</b>
      <div className="piewrap">
        <PieChart parts={R.parts} total={R.total} />
        <div className="lgs">
          {R.parts.map(([name, v], i) => (
            <div className="lg" key={name}><s style={{ background: COLORS[i] }} /><span>{name}</span><b>{fmt(v)}</b><em>{R.total ? (v / R.total * 100).toFixed(1) : 0}%</em></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PerMeasurement({ R }) {
  const size = (r) => `${r.sizeUnit === 'cents' ? r.size.toFixed(2) : r.sizeUnit === 'acres' ? r.size.toFixed(3) : num(r.size)} ${r.sizeUnit}`;
  return (
    <>
      <H2 id="sec-measure">Cost per measurement</H2>
      <div className="panel scroll">
        <table id="pm">
          <thead><tr><th>Measurement</th><th>Size</th><th>Unit</th><th>Total cost per unit</th><th>Construction cost per unit</th><th>Total with land per unit</th></tr></thead>
          <tbody>
            {R.pm.map((r, i) => (
              <tr key={i}><td>{r.name}</td><td>{size(r)}</td><td>{r.unit}</td><td>{r.perTotal === null ? '-' : fmt(r.perTotal)}</td><td>{r.perBase === null ? '-' : fmt(r.perBase)}</td><td>{R.LCOST > 0 && r.perWithLand !== null ? fmt(r.perWithLand) : '-'}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="note">Total cost includes overhead, contingency and GST. Construction cost is materials, labour and equipment only.</p>
      </div>
    </>
  );
}

export function LandDigging({ state, dispatch, R }) {
  const dg = R.dg, dtot = dg.l + dg.e;
  const dvol = dg.rows.filter((r) => r.u === 'm³').reduce((a, r) => a + r.q, 0);
  const dw = Math.ceil(dg.h / (R.D * R.H)), dig = state.trades.dig;
  return (
    <>
      <H2 id="sec-digging">Land digging</H2>
      <div className="panel">
        <div className="er4" style={{ margin: '0 0 12px' }}>
          <label>Diggers (labourers) to use
            <input type="number" min="0" step="1" placeholder="Not set" disabled={!dig} value={dig && dig.count ? dig.count : ''}
              onChange={(e) => dispatch({ type: 'updateTrade', key: 'dig', field: 'count', value: e.target.value })} />
          </label>
        </div>
        <div id="dig">
          {dg.rows.length ? (
            <>
              <div className="kpis" style={{ margin: '0 0 12px' }}>
                <div className="kpi"><b>{num(dvol)} m³</b><span>Earthwork volume (digging and backfilling)</span></div>
                <div className="kpi"><b>{fmt(dg.l)}</b><span>Digging labour cost ({num(dg.h)} man-hours)</span></div>
                <div className="kpi"><b>{fmt(dg.e)}</b><span>Machine cost (excavator, compactor)</span></div>
                <div className="kpi"><b>{R.base ? (dtot / R.base * 100).toFixed(1) : 0}%</b><span>Share of base cost ({fmt(dtot)})</span></div>
              </div>
              <div className="scroll">
                <table>
                  <thead><tr><th>Work</th><th>Quantity</th><th>Man-hours</th><th>Labour cost</th><th>Machine cost</th></tr></thead>
                  <tbody>{dg.rows.map((r, i) => <tr key={i}><td>{r.n}</td><td>{num(r.q)} {r.u}</td><td>{num(r.h)}</td><td>{fmt(r.l)}</td><td>{fmt(r.e)}</td></tr>)}</tbody>
                </table>
              </div>
              <p className="note">Digging labour is {R.lc ? (dg.l / R.lc * 100).toFixed(1) : 0}% of all labour cost and needs about {dw} {dw === 1 ? 'worker' : 'workers'} over {R.D} days. {dig && dig.count > 0 ? `With ${dig.count} diggers the digging takes about ${Math.ceil(dg.h / (dig.count * R.H))} days. ` : ''}Edit the digging wage and the number of diggers under Edit labour wages and labourers, or in the box above. Tick Counts as land digging on any work item in the editor to include it here.</p>
            </>
          ) : <p className="note">No work item is marked as land digging.</p>}
        </div>
      </div>
    </>
  );
}
