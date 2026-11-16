import React, { useState } from 'react';
import { ConfirmButton, DeleteIconButton, H2, Note } from './common.jsx';
import { fmt, fq } from '../engine/format.js';

function GradeEditor({ k, m, dispatch }) {
  const [g, setG] = useState({ name: '', rate: '' });
  return (
    <tr className="ex"><td colSpan={9}>
      <div className="er">
        <input placeholder="New grade name" aria-label={`New grade name for ${m.name}`} value={g.name} onChange={(e) => setG({ ...g, name: e.target.value })} />
        <input type="number" placeholder="₹ rate" aria-label={`New grade rate for ${m.name}`} value={g.rate} onChange={(e) => setG({ ...g, rate: e.target.value })} />
        <button type="button" className="sm" onClick={() => { if (!g.name.trim()) return; dispatch({ type: 'addGrade', key: k, name: g.name.trim(), rate: g.rate }); setG({ name: '', rate: '' }); }}>Add grade</button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
        <button type="button" className="sm" onClick={() => dispatch({ type: 'deleteGrade', key: k })}>Delete selected grade (custom only)</button>
        {m.custom && <ConfirmButton onConfirm={() => dispatch({ type: 'deleteMaterial', key: k })}>Delete this material</ConfirmButton>}
      </div>
    </td></tr>
  );
}

export function MaterialsTable({ state, dispatch, R }) {
  const [open, setOpen] = useState({});
  return (
    <div id="cat" className="scroll">
      <table className="cat fixed">
        <colgroup>{[12, 17, 12, 4, 9, 10, 10, 11, 15].map((w, i) => <col key={i} style={{ width: w + '%' }} />)}</colgroup>
        <thead><tr><th>Material</th><th>Grade or type</th><th>Specification</th><th>Unit</th><th className="num">Rate (₹)</th><th className="num">Quantity needed</th><th className="num">Quantity to use (edit)</th><th className="num">Cost</th><th><span className="sr">Actions</span></th></tr></thead>
        <tbody>
          {Object.entries(state.materials).map(([k, m]) => {
            const need = R.need[k] || 0, opts = state.catalog[k] || [];
            return (
              <React.Fragment key={k}>
                <tr data-material={k}>
                  <td data-label="Material"><b>{m.name}</b></td>
                  <td data-label="Grade or type"><select aria-label={`Grade for ${m.name}`} title={opts[m.sel] ? opts[m.sel].name : ''} value={m.sel} onChange={(e) => dispatch({ type: 'selectGrade', key: k, index: Number(e.target.value) })}>{opts.map((o, i) => <option key={i} value={i}>{o.name}</option>)}</select></td>
                  <td className="sp" data-label="Specification">{opts[m.sel] ? opts[m.sel].spec : ''}</td>
                  <td data-label="Unit">{m.unit}</td>
                  <td className="num" data-label="Rate (₹)"><input type="number" aria-label={`Rate for ${m.name}`} value={m.rate} onChange={(e) => dispatch({ type: 'setRate', key: k, value: e.target.value })} /></td>
                  <td className="num" data-label="Quantity needed">{fq(need)}</td>
                  <td className="num" data-label="Quantity to use (edit)"><input type="number" min="0" step="any" aria-label={`Quantity to use for ${m.name}`} placeholder={need ? fq(need) : '0'} value={m.ovr || ''} onChange={(e) => dispatch({ type: 'setOverride', key: k, value: e.target.value })} /></td>
                  <td className="num" data-label="Cost">{fmt((R.tot[k] || 0) * m.rate * R.L)}</td>
                  <td className="actcell"><div className="acts2">
                    <button type="button" className="sm" aria-label={`Edit grades for ${m.name}`} onClick={() => setOpen({ ...open, [k]: !open[k] })}>Edit grades</button>
                    <DeleteIconButton label={`Delete ${m.name}`} onConfirm={() => dispatch({ type: 'deleteMaterial', key: k })} />
                  </div></td>
                </tr>
                {open[k] && <GradeEditor k={k} m={m} dispatch={dispatch} />}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function AddMaterial({ dispatch }) {
  const [f, setF] = useState({ name: '', unit: '', waste: '5', rate: '' });
  return (
    <details style={{ marginTop: 14 }}>
      <summary>Add a new material</summary>
      <div className="er4">
        <label>Name<input id="nm" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label>Unit<input id="nu" placeholder="kg, m, nos" value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} /></label>
        <label>Wastage (%)<input id="nw" type="number" value={f.waste} onChange={(e) => setF({ ...f, waste: e.target.value })} /></label>
        <label>Rate (₹ per unit)<input id="nr" type="number" value={f.rate} onChange={(e) => setF({ ...f, rate: e.target.value })} /></label>
      </div>
      <button type="button" className="btn" style={{ marginTop: 10 }} onClick={() => { if (!f.name.trim()) return; dispatch({ type: 'addMaterial', ...f, name: f.name.trim(), unit: f.unit.trim() }); setF({ name: '', unit: '', waste: f.waste, rate: '' }); }}>Add material</button>
      <p className="note">A new material appears here and in the material list of every work item. Add it to a work item in the editor to include it in the estimate.</p>
    </details>
  );
}

export function BillOfMaterials({ R }) {
  const cats = [...new Set(R.bom.map((x) => x.cat))];
  return (
    <div className="panel scroll">
      <table id="tot" className="data fixed">
        <colgroup><col style={{ width: '14%' }} /><col style={{ width: '21%' }} /><col style={{ width: '9%' }} /><col style={{ width: '10%' }} /><col style={{ width: '8%' }} /><col style={{ width: '9%' }} /><col style={{ width: '11%' }} /><col style={{ width: '18%' }} /></colgroup>
        <thead><tr><th className="l">Material</th><th className="l">Grade and specification</th><th>Quantity used</th><th>Calculated quantity</th><th className="l">Unit</th><th>Rate</th><th>Cost</th><th className="l">Used in</th></tr></thead>
        <tbody>
          {cats.map((c) => {
            const it = R.bom.filter((x) => x.cat === c);
            return (
              <React.Fragment key={c}>
                <tr className="ph"><td colSpan={6}>{c}</td><td>{fmt(it.reduce((a, x) => a + x.cost, 0))}</td><td /></tr>
                {it.map((x, i) => (
                  <tr key={i}><td className="l">{x.name}</td><td className="l">{x.grade}</td><td>{fq(x.qty)}</td><td>{fq(x.calc)}</td><td className="l">{x.unit}</td><td>{fmt(x.rate)}</td><td>{fmt(x.cost)}</td><td className="l">{x.used}</td></tr>
                ))}
              </React.Fragment>
            );
          })}
          <tr className="ph"><td colSpan={6}>Total materials and components</td><td>{fmt(R.bom.reduce((a, x) => a + x.cost, 0))}</td><td /></tr>
        </tbody>
      </table>
    </div>
  );
}

export function WoodTable({ R }) {
  return (
    <div className="panel scroll">
      <table id="wood" className="data fixed">
        {R.wl.length ? (
          <>
            <colgroup><col style={{ width: '25%' }} /><col style={{ width: '20%' }} /><col style={{ width: '27%' }} /><col style={{ width: '9%' }} /><col style={{ width: '7%' }} /><col style={{ width: '12%' }} /></colgroup>
            <thead><tr><th className="l">Source</th><th className="l">Material</th><th className="l">Type and grade</th><th>Quantity</th><th className="l">Unit</th><th>Cost</th></tr></thead>
            <tbody>
              {R.wl.map((x, i) => <tr key={i}><td className="l">{x.src}</td><td className="l">{x.mat}</td><td className="l">{x.grade}</td><td>{fq(x.q)}</td><td className="l">{x.u}</td><td>{x.k === 'dw' ? 'Included' : fmt(x.c)}</td></tr>)}
              <tr className="ph"><td colSpan={3}>Total timber</td><td>{fq(R.tcft)}</td><td className="l">cft</td><td /></tr>
              <tr className="ph"><td colSpan={3}>Total plywood and boards</td><td>{fq(R.tsq)}</td><td className="l">sq ft</td><td /></tr>
              <tr className="ph"><td colSpan={5}>Total wood cost (excluding doors and windows)</td><td>{fmt(R.twc)}</td></tr>
            </tbody>
          </>
        ) : <tbody><tr><td>No wood is used in the current estimate.</td></tr></tbody>}
      </table>
    </div>
  );
}

export function MaterialsSection({ state, dispatch, R }) {
  return (
    <>
      <H2 id="sec-specs">Material specifications and prices</H2>
      <Note style={{ marginTop: 0 }}>Each row is one material: choose the grade or type, read its specification, and adjust the rate if needed. Options named TN PWD SOR or CPWD are government basic rates, excluding GST (see Rate basis in the inputs); all other prices are indicative.</Note>
      <div className="panel"><MaterialsTable state={state} dispatch={dispatch} R={R} /><AddMaterial dispatch={dispatch} /></div>
      <H2 id="sec-bom">Materials required (bill of materials)</H2>
      <Note style={{ marginTop: 0 }}>Every material and component the estimate needs, by category, with its grade, quantity, rate, cost and the work it is used in.</Note>
      <BillOfMaterials R={R} />
      <H2 id="sec-wood">Wood and timber requirement</H2>
      <Note style={{ marginTop: 0 }}>Timber (in cubic feet) and plywood and boards (in sq ft) needed, by source. Change the wood type and price in the materials table above (Timber / wood, Formwork plywood, Plywood and boards). Wood inside doors and windows is already in their cost.</Note>
      <WoodTable R={R} />
    </>
  );
}
