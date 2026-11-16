import React, { useState } from 'react';
import { ConfirmButton, DeleteIconButton, H2, Note } from './common.jsx';
import { fmt, num } from '../engine/format.js';
import { LOAD_BY_TYPE, DEFAULT_LOAD } from '../data/power.js';

const BASIS = { kva: 'Demand kVA', trf: 'Transformer kVA', kw: 'Load kW', fix: 'Fixed' };

/** Electricity board (EB) charges and the substation: the kW and kVA the building needs, and the prices. */
export default function Power({ state, dispatch, R }) {
  const [name, setName] = useState('');
  const P = state.power, X = R.pw;
  const set = (field) => (e) => dispatch({ type: 'setPower', field, value: e.target.value });
  const upd = (id, field) => (e) => dispatch({ type: 'updatePowerItem', id, field, value: e.target.value });
  const rowOf = (list, id) => list.find((x) => x.id === id);
  const wpsf = LOAD_BY_TYPE[state.inputs.type] !== undefined ? LOAD_BY_TYPE[state.inputs.type] : DEFAULT_LOAD;

  const table = (grp, title, hint) => (
    <>
      <h3 className="sub3">{title}</h3>
      <p className="note" style={{ marginTop: 0 }}>{hint}</p>
      <table className="cat fixed" id={`pw-${grp}`}>
        <colgroup><col style={{ width: '27%' }} /><col style={{ width: '13%' }} /><col style={{ width: '15%' }} /><col style={{ width: '8%' }} /><col style={{ width: '11%' }} /><col style={{ width: '10%' }} /><col style={{ width: '11%' }} /><col style={{ width: '5%' }} /></colgroup>
        <thead><tr><th>Item</th><th>Applies to</th><th>Quantity of</th><th className="num">Multiplier</th><th className="num">Rate (₹ per unit)</th><th className="num">Quantity used</th><th className="num">Cost</th><th><span className="sr">Actions</span></th></tr></thead>
        <tbody>
          {P.items.filter((r) => r.grp === grp).map((r) => {
            const x = rowOf(grp === 'eb' ? X.ebRows : X.subRows, r.id);
            return (
              <tr key={r.id} data-pw={r.id} className={x ? '' : 'off'}>
                <td data-label="Item"><input aria-label="Power item name" title={r.name} value={r.name} onChange={upd(r.id, 'name')} /></td>
                <td data-label="Applies to">
                  <select aria-label={`Applies to for ${r.name}`} value={r.cls} onChange={upd(r.id, 'cls')}>
                    <option value="all">All</option><option value="lt">LT only</option><option value="ht">Substation</option>
                  </select>
                </td>
                <td data-label="Quantity based on">
                  <select aria-label={`Quantity basis for ${r.name}`} value={r.basis} onChange={upd(r.id, 'basis')}>
                    {Object.entries(BASIS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </td>
                <td className="num" data-label="Multiplier"><input type="number" min="0" step="any" aria-label={`Multiplier for ${r.name}`} value={r.q} onChange={upd(r.id, 'q')} /></td>
                <td className="num" data-label="Rate (₹ per unit)"><input type="number" min="0" step="any" aria-label={`Rate for ${r.name}`} value={r.rate} onChange={upd(r.id, 'rate')} /></td>
                <td className="num sp" data-label="Quantity used">{x ? `${num(x.qty)} ${x.unit}` : 'Not used'}</td>
                <td className="num sp" data-label="Cost">{x ? fmt(x.cost) : '-'}</td>
                <td className="actcell"><div className="acts2"><DeleteIconButton label={`Delete ${r.name}`} onConfirm={() => dispatch({ type: 'deletePowerItem', id: r.id })} /></div></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="row" style={{ marginTop: 8 }}>
        <button type="button" className="btn ghost" onClick={() => { dispatch({ type: 'addPowerItem', grp, name: name.trim() }); setName(''); }}>{grp === 'eb' ? 'Add EB charge' : 'Add substation item'}</button>
      </div>
    </>
  );

  return (
    <>
      <H2 id="sec-power">Electricity board charges and substation</H2>
      <Note style={{ marginTop: 0 }}>The electricity board (EB, TNPDCL in Tamil Nadu) charges for the connection and a security deposit, based on the kVA the building needs. A large load gets an HT supply and its own substation with a transformer. Change the load, the substation choice, any quantity or any rate. All rates are placeholders: check the board's current tariff order and its estimate.</Note>
      <div className="panel" id="power">
        <div className="row" style={{ marginBottom: 8 }}>
          <label>Electricity board charges
            <select aria-label="Electricity board mode" value={P.mode} onChange={set('mode')}>
              <option value="on">Include</option><option value="off">Do not include</option>
            </select>
          </label>
          <label>Substation
            <select aria-label="Substation mode" value={P.subMode} onChange={set('subMode')}>
              <option value="auto">Automatic (by project type and kVA)</option><option value="yes">Include a substation</option><option value="no">No substation (LT supply)</option>
            </select>
          </label>
          <label>Connected load
            <select aria-label="Connected load mode" value={P.loadMode} onChange={set('loadMode')}>
              <option value="auto">Estimated from the building ({wpsf} W per sq ft)</option><option value="manual">I will enter the kW</option>
            </select>
          </label>
          {P.loadMode === 'manual' && <label>Connected load (kW)<input type="number" min="0" step="any" aria-label="Connected load in kW" value={P.loadKw} onChange={set('loadKw')} /></label>}
        </div>
        <div className="row" style={{ marginBottom: 8 }}>
          <label>Demand factor<input type="number" min="0" step="0.05" aria-label="Demand factor" value={P.df} onChange={set('df')} /></label>
          <label>Power factor<input type="number" min="0.1" max="1" step="0.01" aria-label="Power factor" value={P.pf} onChange={set('pf')} /></label>
          <label>Future growth margin (%)<input type="number" min="0" step="1" aria-label="Growth margin" value={P.margin} onChange={set('margin')} /></label>
          <label>LT supply limit (kVA)<input type="number" min="0" step="1" aria-label="LT supply limit" value={P.threshold} onChange={set('threshold')} /></label>
        </div>
        {X.on ? (
          <>
            <p className="note" id="pwstatus">{X.whyAuto}</p>
            {X.warn.map((w) => <p className="note" key={w}>{w}</p>)}
            <div className="kpis" id="pwkpis">
              <div className="kpi"><b>{num(X.loadKw)} kW</b><span>Connected load required</span></div>
              <div className="kpi"><b>{num(X.kva)} kVA</b><span>Demand to apply to the board (with margin)</span></div>
              <div className="kpi"><b>{X.substation ? `${num(X.trfKva)} kVA` : 'None'}</b><span>{X.substation ? `Transformer${X.trfUnits > 1 ? ` (${X.trfUnits} units)` : ''}, HT supply` : 'Transformer, LT supply'}</span></div>
              <div className="kpi"><b>{fmt(X.ebCost)}</b><span>EB charges paid to the board ({fmt(X.refundable)} refundable deposit)</span></div>
              <div className="kpi"><b>{fmt(X.subCost)}</b><span>{X.substation ? 'Substation and incoming supply works' : 'Service cable and LT panel'}</span></div>
            </div>
          </>
        ) : <p className="note" id="pwstatus">Electricity board charges are switched off.</p>}
        <div className="tablewrap">
          {table('eb', 'Charges paid to the electricity board', 'Outside overhead, contingency and GST. The security deposit is refundable but is counted in the total.')}
          {table('sub', 'Substation and incoming supply works', "Built by the contractor, so these carry overhead, contingency and GST, and the electrician's man-hours count in the labour share.")}
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <input placeholder="New item name" aria-label="New power item name" value={name} onChange={(e) => setName(e.target.value)} />
          <ConfirmButton className="btn ghost" onConfirm={() => dispatch({ type: 'resetPower' })}>Reset electricity board settings</ConfirmButton>
        </div>
      </div>
    </>
  );
}
