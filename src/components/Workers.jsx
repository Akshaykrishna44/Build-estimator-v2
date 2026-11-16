import React from 'react';
import { H2, Note } from './common.jsx';
import { fmt, num, fq } from '../engine/format.js';

export function WorkersSection({ state, R }) {
  const mx = Math.max(...R.tr.map((t) => t[2]), 1);
  return (
    <>
      <H2 id="sec-workers">Workers required by trade</H2>
      <div className="panel scroll">
        <table id="labor">
          <thead><tr><th>Trade</th><th>Man-hours</th><th>Workers needed</th><th>Labourers planned</th><th>Days needed with planned</th><th style={{ width: '16%' }} /><th>Labour cost</th><th>Share of budget</th></tr></thead>
          <tbody>
            {R.tr.map(([k, t, w, c]) => {
              const pl = state.trades[k].count || 0, dn = pl > 0 ? Math.ceil(t / (pl * R.H)) : null, over = dn !== null && dn > R.D;
              return (
                <tr key={k}>
                  <td>{state.trades[k].name}</td><td>{num(t)}</td><td><b>{w}</b></td><td>{pl > 0 ? pl : 'Not set'}</td>
                  <td>{dn === null ? '-' : dn + (over ? ` (over by ${dn - R.D})` : '')}</td>
                  <td><div className="bar" style={{ width: `${(w / mx) * 100}%` }} /></td><td>{fmt(c)}</td><td>{R.total > 0 ? (c / R.total * 100).toFixed(1) : 0}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Note id="wstat">
        Workers needed for the {R.D}-day schedule: <b>{R.peak}</b> · Workers you plan to use: <b>{R.planTot}</b>
        {R.cap > 0 && <> · Site limit: <b>{R.cap}</b> ({R.planTot <= R.cap ? 'within the limit' : <b>over the limit by {R.planTot - R.cap}</b>})</>}. Set Labourers to use for a trade, or workers on a work item in the editor.
      </Note>
      <Note>Workers = man-hours ÷ (working days × hours per day), rounded up. This assumes each trade works across the full schedule; real projects stagger trades by phase.</Note>
    </>
  );
}

export function PhaseSummary({ R }) {
  const names = Object.keys(R.phases);
  const sq = (v) => (R.BS ? fmt(v / R.BS) : '-');
  return (
    <>
      <H2 id="sec-phases">Phase summary</H2>
      <div className="panel scroll">
        <table id="phases">
          <thead><tr><th>Phase</th><th>Materials</th><th>Man-hours</th><th>Labour</th><th>Equipment</th><th>Days with your crews</th><th>Cost per sq ft built-up</th></tr></thead>
          <tbody>
            {names.map((n) => { const p = R.phases[n]; return <tr key={n}><td>{n}</td><td>{fmt(p.m)}</td><td>{num(p.h)}</td><td>{fmt(p.l)}</td><td>{fmt(p.e)}</td><td>{p.dk ? 'Set workers' : p.d}</td><td>{sq(p.m + p.l + p.e)}</td></tr>; })}
            <tr><td><b>Overhead ({(R.ohv / (R.base || 1) * 100).toFixed(0)}%) and contingency ({(R.ctv / ((R.base + R.ohv) || 1) * 100).toFixed(0)}%)</b></td><td /><td /><td /><td>{fmt(R.ohv + R.ctv)}</td><td /><td>{sq(R.ohv + R.ctv)}</td></tr>
            <tr><td><b>GST ({(R.GS * 100).toFixed(0)}%)</b></td><td /><td /><td /><td>{fmt(R.gv)}</td><td /><td>{sq(R.gv)}</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export function MaterialsByPhase({ R }) {
  return (
    <>
      <H2 id="sec-matlist">Materials list, base to finished</H2>
      <div className="panel scroll">
        <table id="mats">
          <thead><tr><th className="l">Material</th><th className="l">Used in</th><th>Quantity</th><th className="l">Unit</th><th>Rate</th><th>Cost</th></tr></thead>
          <tbody>
            {Object.keys(R.phases).filter((n) => R.phases[n].rows.length).map((n) => (
              <React.Fragment key={n}>
                <tr className="ph"><td colSpan={6}>{n}</td></tr>
                {R.phases[n].rows.map((r, i) => <tr key={i}><td className="l">{r[0]}</td><td className="l">{r[5]}</td><td>{fq(r[2])}</td><td className="l">{r[1]}</td><td>{fmt(r[3])}</td><td>{fmt(r[4])}</td></tr>)}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
