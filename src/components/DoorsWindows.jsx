import React, { useState } from 'react';
import { ConfirmButton, H2, Note } from './common.jsx';
import { fmt, num } from '../engine/format.js';

export default function DoorsWindows({ state, dispatch, R }) {
  const [t, setT] = useState({ name: '', spec: '', rate: '' });
  const types = Object.entries(state.doorTypes);
  const upd = (id, field) => (e) => dispatch({ type: 'updateDoor', id, field, value: e.target.value });
  const updT = (key, field) => (e) => dispatch({ type: 'updateDoorType', key, field, value: e.target.value });
  const byId = Object.fromEntries(R.dwRows.map((x) => [x.r.id, x]));
  return (
    <>
      <H2 id="sec-doors">Doors and windows</H2>
      <Note style={{ marginTop: 0 }}>List the doors, windows, ventilators and shutters in the building. Choose the type (wood, UPVC, aluminium, steel, glass and more) and set the number and size in feet. Cost is area × rate per sq ft, supplied and fixed, and fixing labour is added. Leave the rate empty to use the type's rate. Rates are indicative.</Note>
      <div className="panel" id="dwbox">
        <div className="scroll">
          <table className="cat" id="dwt">
            <thead><tr><th>Door or window</th><th>Type</th><th>Number</th><th>Width (ft)</th><th>Height (ft)</th><th>Area each (sq ft)</th><th>Rate (₹ per sq ft)</th><th>Cost</th><th /></tr></thead>
            <tbody>
              {state.doors.map((r) => {
                const x = byId[r.id];
                return (
                  <tr key={r.id} data-dw={r.id}>
                    <td><input aria-label="Door or window name" value={r.name} onChange={upd(r.id, 'name')} /></td>
                    <td><select aria-label={`Type for ${r.name}`} value={r.type} onChange={upd(r.id, 'type')}>{types.map(([k, d]) => <option key={k} value={k}>{d.name}</option>)}</select></td>
                    <td><input type="number" min="0" step="1" aria-label={`Number of ${r.name}`} value={r.n} onChange={upd(r.id, 'n')} /></td>
                    <td><input type="number" min="0" step="any" aria-label={`Width of ${r.name}`} value={r.w} onChange={upd(r.id, 'w')} /></td>
                    <td><input type="number" min="0" step="any" aria-label={`Height of ${r.name}`} value={r.h} onChange={upd(r.id, 'h')} /></td>
                    <td>{(r.w * r.h).toFixed(1)}</td>
                    <td><input type="number" min="0" step="any" placeholder={x ? String(x.t.rate) : 'Type rate'} aria-label={`Rate for ${r.name}`} value={r.rate || ''} onChange={upd(r.id, 'rate')} /></td>
                    <td>{x ? fmt(x.c) : '-'}</td>
                    <td><ConfirmButton onConfirm={() => dispatch({ type: 'deleteDoor', id: r.id })} aria-label={`Delete ${r.name}`}>Delete</ConfirmButton></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot><tr className="ph"><td colSpan={2}>Total</td><td>{num(R.dwN)}</td><td /><td /><td>{num(R.dwA)}</td><td /><td>{fmt(R.dwCost)}</td><td /></tr></tfoot>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <button type="button" className="btn" onClick={() => dispatch({ type: 'addDoor' })}>Add door or window</button>
          <button type="button" className="btn ghost" onClick={() => dispatch({ type: 'fillDoors', bs: R.BS })}>Suggest numbers from built-up area</button>
        </div>
        <details style={{ marginTop: 14 }}>
          <summary>Types and rates (edit or add types)</summary>
          <div className="scroll">
            <table className="cat" id="dwty" style={{ marginTop: 10 }}>
              <thead><tr><th>Type</th><th>Specification</th><th>Rate (₹ per sq ft)</th><th>Wood in it (cft per sq ft)</th><th /></tr></thead>
              <tbody>
                {types.map(([k, d]) => (
                  <tr key={k}>
                    <td><input aria-label={`Type name ${d.name}`} value={d.name} onChange={updT(k, 'name')} /></td>
                    <td><input aria-label={`Specification of ${d.name}`} value={d.spec} onChange={updT(k, 'spec')} /></td>
                    <td><input type="number" step="any" aria-label={`Rate of ${d.name}`} value={d.rate} onChange={updT(k, 'rate')} /></td>
                    <td><input type="number" step="any" aria-label={`Wood content of ${d.name}`} value={d.cft || 0} onChange={updT(k, 'cft')} /></td>
                    <td><ConfirmButton onConfirm={() => dispatch({ type: 'deleteDoorType', key: k })} aria-label={`Delete type ${d.name}`}>Delete</ConfirmButton></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="er4">
            <label>New type name<input value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} /></label>
            <label>Specification<input value={t.spec} onChange={(e) => setT({ ...t, spec: e.target.value })} /></label>
            <label>Rate (₹ per sq ft)<input type="number" value={t.rate} onChange={(e) => setT({ ...t, rate: e.target.value })} /></label>
          </div>
          <button type="button" className="btn" style={{ marginTop: 10 }} onClick={() => { if (!t.name.trim()) return; dispatch({ type: 'addDoorType', ...t, name: t.name.trim() }); setT({ name: '', spec: '', rate: '' }); }}>Add type</button>
        </details>
      </div>
    </>
  );
}
