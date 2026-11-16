import React, { useState } from 'react';
import { ConfirmButton, DeleteIconButton, H2, Note } from './common.jsx';
import { fmt, num } from '../engine/format.js';

/** Solar installation: required for industries by default, optional for every other build. Includes the rooftop solar types. */
export default function Solar({ state, dispatch, R }) {
  const [name, setName] = useState('');
  const S = state.solar, X = R.sol;
  const set = (field) => (e) => dispatch({ type: 'setSolar', field, value: e.target.value });
  const status = X.on
    ? (X.auto && X.industrial ? 'Solar is included because this is an industrial project type.' : 'Solar is included.')
    : (S.mode === 'off' ? 'Solar is switched off.' : 'Solar is not included by default for this building type. Choose "Include" to add rooftop solar.');
  const mountKey = X.mountKey;
  return (
    <>
      <H2 id="sec-solar">Solar installation</H2>
      <Note style={{ marginTop: 0 }}>Solar panels on the roof (or on the ground) to produce power. Industrial project types include it automatically; every other building can add it. The size comes from the roof area, or enter your own kWp. Pick the system type and the roof type below and edit any rate. Rates are placeholders for 2026, so check local quotes.</Note>
      <div className="panel" id="solar">
        <div className="row" style={{ marginBottom: 8 }}>
          <label>Solar installation
            <select aria-label="Solar mode" value={S.mode} onChange={set('mode')}>
              <option value="auto">Automatic (industries only)</option><option value="on">Include</option><option value="off">Do not include</option>
            </select>
          </label>
          <label>Roof type
            <select aria-label="Solar mounting" value={S.mount} onChange={set('mount')}>
              <option value="auto">Automatic (by project type)</option>
              {Object.entries(S.mounts).map(([k, m]) => <option key={k} value={k}>{m.name}</option>)}
            </select>
          </label>
          <label>Size of the system
            <select aria-label="Solar size mode" value={S.sizeMode} onChange={set('sizeMode')}>
              <option value="roof">From the roof area</option><option value="manual">I will enter the kWp</option>
            </select>
          </label>
          {(S.sizeMode === 'manual' || mountKey === 'ground') && <label>Solar size (kWp)<input type="number" min="0" step="any" aria-label="Solar size in kWp" value={S.kwp} onChange={set('kwp')} /></label>}
          <label>Usable roof (%)<input type="number" min="0" max="100" step="1" aria-label="Usable roof percent" value={S.usable} onChange={set('usable')} /></label>
          <label>Units per kWp a year<input type="number" min="0" step="10" aria-label="Yearly units per kWp" value={S.yield} onChange={set('yield')} /></label>
        </div>
        <p className="note" id="solstatus">{status}</p>
        {X.warn.map((w) => <p className="note" key={w}>{w}</p>)}
        {X.on && X.kwp > 0 && (
          <div className="kpis" id="solkpis">
            <div className="kpi"><b>{num(X.kwp)} kWp</b><span>Solar size ({X.mountName})</span></div>
            <div className="kpi"><b>{fmt(X.cost)}</b><span>Solar supply and installation</span></div>
            <div className="kpi"><b>{num(X.hours)}</b><span>Solar man-hours</span></div>
            <div className="kpi"><b>{num(X.kwh)}</b><span>Units a year (kWh)</span></div>
            <div className="kpi"><b>{num(X.roofArea)} sq ft</b><span>Roof area used</span></div>
          </div>
        )}

        <h3 className="sub3">Rooftop solar types</h3>
        <p className="note" style={{ marginTop: 0 }}>Choose the type to install. Rates are per kWp of panels, excluding the mounting. Add your own type if yours differs.</p>
        <table className="cat fixed" id="soltypes">
          <colgroup><col style={{ width: '6%' }} /><col style={{ width: '21%' }} /><col style={{ width: '31%' }} /><col style={{ width: '11%' }} /><col style={{ width: '10%' }} /><col style={{ width: '12%' }} /><col style={{ width: '9%' }} /></colgroup>
          <thead><tr><th>Use</th><th>Type</th><th>About</th><th className="num">Rate (₹ per kWp)</th><th className="num">Man-hours per kWp</th><th className="num">Grid fees (₹)</th><th><span className="sr">Actions</span></th></tr></thead>
          <tbody>
            {Object.entries(S.types).map(([k, t]) => (
              <tr key={k} data-sol={k} className={S.sys === k ? 'picked' : ''}>
                <td data-label="Use"><input type="radio" name="soltype" aria-label={`Use ${t.name}`} checked={S.sys === k} onChange={() => dispatch({ type: 'setSolar', field: 'sys', value: k })} /></td>
                <td data-label="Type"><input aria-label={`Name of ${t.name}`} value={t.name} onChange={(e) => dispatch({ type: 'updateSolarType', key: k, field: 'name', value: e.target.value })} /></td>
                <td className="sp" data-label="About">{t.note}</td>
                <td className="num" data-label="Rate (₹ per kWp)"><input type="number" min="0" step="any" aria-label={`Rate for ${t.name}`} value={t.rate} onChange={(e) => dispatch({ type: 'updateSolarType', key: k, field: 'rate', value: e.target.value })} /></td>
                <td className="num" data-label="Man-hours per kWp"><input type="number" min="0" step="any" aria-label={`Man-hours for ${t.name}`} value={t.hpk} onChange={(e) => dispatch({ type: 'updateSolarType', key: k, field: 'hpk', value: e.target.value })} /></td>
                <td className="num" data-label="Grid fees (₹)"><input type="number" min="0" step="any" aria-label={`Grid fees for ${t.name}`} value={t.fee} onChange={(e) => dispatch({ type: 'updateSolarType', key: k, field: 'fee', value: e.target.value })} /></td>
                <td className="actcell"><div className="acts2"><DeleteIconButton label={`Delete ${t.name}`} onConfirm={() => dispatch({ type: 'deleteSolarType', key: k })} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="row" style={{ marginTop: 8 }}>
          <input placeholder="New solar type name" aria-label="New solar type name" value={name} onChange={(e) => setName(e.target.value)} />
          <button type="button" className="btn ghost" onClick={() => { dispatch({ type: 'addSolarType', name: name.trim() }); setName(''); }}>Add solar type</button>
        </div>

        <h3 className="sub3">Roof types for mounting</h3>
        <table className="cat fixed" id="solmounts">
          <colgroup><col style={{ width: '40%' }} /><col style={{ width: '20%' }} /><col style={{ width: '20%' }} /><col style={{ width: '20%' }} /></colgroup>
          <thead><tr><th>Roof type</th><th className="num">Roof area per kWp (sq ft)</th><th className="num">Mounting (₹ per kWp)</th><th className="num">Man-hours per kWp</th></tr></thead>
          <tbody>
            {Object.entries(S.mounts).map(([k, m]) => (
              <tr key={k} data-mount={k} className={mountKey === k ? 'picked' : ''}>
                <td data-label="Roof type">{m.name}{mountKey === k ? ' (in use)' : ''}</td>
                {['area', 'rate', 'hpk'].map((f) => (
                  <td className="num" key={f} data-label={{ area: 'Roof area per kWp (sq ft)', rate: 'Mounting (₹ per kWp)', hpk: 'Man-hours per kWp' }[f]}>
                    <input type="number" min="0" step="any" disabled={f === 'area' && !m.roof} aria-label={`${f} for ${m.name}`} value={m[f]} onChange={(e) => dispatch({ type: 'updateSolarMount', key: k, field: f, value: e.target.value })} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="row" style={{ marginTop: 8 }}>
          <ConfirmButton className="btn ghost" onConfirm={() => dispatch({ type: 'resetSolar' })}>Reset solar settings</ConfirmButton>
        </div>
      </div>
    </>
  );
}
