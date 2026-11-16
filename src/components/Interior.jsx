import React, { useState } from 'react';
import { ConfirmButton, H2, Note } from './common.jsx';
import { fmt, num } from '../engine/format.js';
import { INTERIOR_LEVELS } from '../data/interior.js';

export default function Interior({ state, dispatch, R }) {
  const [name, setName] = useState('');
  const I = state.interior, X = R.intr;
  const byId = Object.fromEntries(X.rows.map((x) => [x.id, x]));
  const upd = (id, field) => (e) => dispatch({ type: 'updateInteriorItem', id, field, value: e.target.value });
  const status = X.on
    ? (X.preset ? 'Interior design is included because this building type normally needs it.' : 'Interior design is included.')
    : (I.mode === 'off' ? 'Interior design is switched off.' : 'This building type does not normally need interior design. Choose "Include" to add it.');
  return (
    <>
      <H2 id="sec-interior">Interior design</H2>
      <Note style={{ marginTop: 0 }}>Fit-out work inside the building: false ceilings, flooring upgrades, paneling, kitchen, wardrobes, furniture, partitions, lighting, curtains and bathrooms. Quantities are per 1,000 sq ft of built-up area for a typical building and are adjusted for the project type. Change any quantity, rate or man-hours, add your own items, and pick a quality level. Rates are indicative, supplied and fixed.</Note>
      <div className="panel" id="interior">
        <div className="row" style={{ marginBottom: 8 }}>
          <label>Interior design
            <select aria-label="Interior design mode" value={I.mode} onChange={(e) => dispatch({ type: 'setInterior', field: 'mode', value: e.target.value })}>
              <option value="auto">Automatic (by project type)</option>
              <option value="on">Include</option>
              <option value="off">Do not include</option>
            </select>
          </label>
          <label>Quality level
            <select aria-label="Interior quality level" value={I.level} onChange={(e) => dispatch({ type: 'setInterior', field: 'level', value: e.target.value })}>
              {Object.entries(INTERIOR_LEVELS).map(([k, l]) => <option key={k} value={k}>{l.name} (rates × {l.mult})</option>)}
            </select>
          </label>
        </div>
        <p className="note" id="intstatus">{status}</p>
        {X.on && (
          <div className="kpis">
            <div className="kpi"><span>Interior materials and fittings</span><b>{fmt(X.cost)}</b></div>
            <div className="kpi"><span>Interior fixing labour</span><b>{fmt(X.lab || 0)}</b></div>
            <div className="kpi"><span>Interior man-hours</span><b>{num(X.hours)}</b></div>
          </div>
        )}
        <div className="scroll">
          <table className="cat" id="intt">
            <thead><tr><th>Item</th><th>Unit</th><th>Quantity per 1,000 sq ft</th><th>Rate (₹ per unit)</th><th>Man-hours per unit</th><th>Quantity used</th><th>Cost</th><th /></tr></thead>
            <tbody>
              {I.items.map((r) => {
                const x = byId[r.id];
                return (
                  <tr key={r.id} data-int={r.id}>
                    <td><input aria-label="Interior item name" style={{ minWidth: 280 }} value={r.name} onChange={upd(r.id, 'name')} /></td>
                    <td><input aria-label={`Unit for ${r.name}`} value={r.unit} onChange={upd(r.id, 'unit')} style={{ width: 60 }} /></td>
                    <td><input type="number" min="0" step="any" aria-label={`Quantity per 1000 sq ft for ${r.name}`} value={r.q} onChange={upd(r.id, 'q')} /></td>
                    <td><input type="number" min="0" step="any" aria-label={`Rate for ${r.name}`} value={r.rate} onChange={upd(r.id, 'rate')} /></td>
                    <td><input type="number" min="0" step="any" aria-label={`Man-hours per unit for ${r.name}`} value={r.hpu} onChange={upd(r.id, 'hpu')} /></td>
                    <td>{x ? num(x.qty) : '-'}</td>
                    <td>{x ? fmt(x.cost) : '-'}</td>
                    <td><ConfirmButton onConfirm={() => dispatch({ type: 'deleteInteriorItem', id: r.id })} aria-label={`Delete ${r.name}`}>Delete</ConfirmButton></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <input placeholder="New interior item name" aria-label="New interior item name" value={name} onChange={(e) => setName(e.target.value)} />
          <button type="button" className="btn" onClick={() => { dispatch({ type: 'addInteriorItem', name: name.trim() }); setName(''); }}>Add interior item</button>
          <ConfirmButton className="btn ghost" onConfirm={() => dispatch({ type: 'resetInterior' })}>Reset interior items</ConfirmButton>
        </div>
      </div>
    </>
  );
}
