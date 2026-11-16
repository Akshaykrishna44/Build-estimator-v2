import React, { useState } from 'react';
import { Field, NumInput } from './common.jsx';
import TradesEditor from './TradesEditor.jsx';
import { TYPE_GROUPS } from '../data/types.js';
import { BASES, STATIONS } from '../data/bases.js';
import { basisInfo } from '../state/basis.js';
import { num } from '../engine/format.js';

export default function InputsPanel({ state, dispatch, R }) {
  const I = state.inputs;
  const set = (name) => (value) => dispatch({ type: 'input', name, value });
  const sel = (name) => (e) => set(name)(e.target.value);
  return (
    <div className="panel">
      <div className="inwrap">
        <div className="col1">
          <Field label="Project type">
            <select id="type" value={I.type} onChange={sel('type')}>
              <option value="">Select a project type</option>
              {TYPE_GROUPS.map((g) => (
                <optgroup key={g.label} label={g.label}>{g.options.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</optgroup>
              ))}
              {state.ctypes.length > 0 && (
                <optgroup label="Your project types">{state.ctypes.map((t) => <option key={t.key} value={t.key}>{t.name}</option>)}</optgroup>
              )}
            </select>
          </Field>
          <Field label="Land area">
            <span className="unitrow">
              <NumInput label="Land area value" min="0" step="any" value={I.land} onChange={set('land')} />
              <select aria-label="Land area unit" value={I.landUnit} onChange={sel('landUnit')}>
                <option value="sqft">sq ft</option><option value="cent">cents</option><option value="acre">acres</option>
              </select>
            </span>
          </Field>
          <Field label="Land price (optional)">
            <span className="unitrow">
              <NumInput label="Land price value" min="0" step="any" placeholder="Price in ₹" value={I.landPrice} onChange={set('landPrice')} />
              <select aria-label="Land price unit" value={I.landPriceUnit} onChange={sel('landPriceUnit')}>
                <option value="sqft">₹ per sq ft</option><option value="cent">₹ per cent</option><option value="acre">₹ per acre</option>
              </select>
            </span>
          </Field>
          <Field label="Length of the building (ft)"><NumInput label="Length of the building" min="1" step="any" value={I.len} onChange={set('len')} /></Field>
          <Field label="Breadth of the building (ft)"><NumInput label="Breadth of the building" min="1" step="any" value={I.wid} onChange={set('wid')} /></Field>
          <Field label="Height of the building (ft)"><NumInput label="Height of the building" min="1" step="any" value={I.hgt} onChange={set('hgt')} /></Field>
        </div>
        <div className="grid">
          <Field label="Floors"><NumInput label="Floors" min="1" max="20" value={I.floors} onChange={set('floors')} /></Field>
          <Field label="Schedule (working days)"><NumInput label="Schedule in working days" min="1" value={I.days} onChange={set('days')} /></Field>
          <Field label="Hours per day"><NumInput label="Hours per day" min="1" max="16" value={I.hpd} onChange={set('hpd')} /></Field>
          <Field label="Location cost factor"><NumInput label="Location cost factor" step="0.05" min="0.5" value={I.loc} onChange={set('loc')} /></Field>
          <Field label="Overhead (%)"><NumInput label="Overhead percent" min="0" value={I.oh} onChange={set('oh')} /></Field>
          <Field label="Contingency (%)"><NumInput label="Contingency percent" min="0" value={I.ct} onChange={set('ct')} /></Field>
          <Field label="Maximum workers on site (optional)"><NumInput label="Maximum workers on site" min="0" step="1" placeholder="No limit" value={I.cap} onChange={set('cap')} /></Field>
          <Field label="Rate basis">
            <select aria-label="Rate basis" value={I.basis} onChange={sel('basis')}>
              {Object.entries(BASES).map(([k, b]) => <option key={k} value={k}>{b.label}</option>)}
            </select>
          </Field>
          {I.basis === 'cpwd' && (
            <Field label="CPWD station and cost index">
              <select aria-label="CPWD station" value={I.station} onChange={sel('station')}>
                {STATIONS.map((s) => <option key={s.name} value={s.index}>{`${s.name} (${s.index}, ${s.date})`}</option>)}
                <option value="custom">Other station (enter the index)</option>
              </select>
            </Field>
          )}
          {I.basis === 'cpwd' && I.station === 'custom' && (
            <Field label="Cost index (DPAR 2023 base 100)"><NumInput label="Cost index" step="any" value={I.customIndex} onChange={set('customIndex')} /></Field>
          )}
          <Field label="GST on total (%)"><NumInput label="GST percent" min="0" step="any" value={I.gst} onChange={set('gst')} /></Field>
          <Field label="Labour limit (% of total budget)"><NumInput label="Labour limit percent" min="0" max="100" step="any" value={I.lablim} onChange={set('lablim')} /></Field>
        </div>
      </div>
      <p className="note" id="landeq" style={{ marginBottom: 0 }}>
        {R.LAND > 0
          ? <>Land <b>{num(R.LAND)} sq ft</b> = <b>{(R.LAND / 435.6).toFixed(2)} cents</b> = <b>{(R.LAND / 43560).toFixed(3)} acres</b> = {num(R.LAND * 0.092903)} m². Building footprint is <b>{(R.PLAN / R.LAND * 100).toFixed(1)}%</b> of the land{R.PLAN > R.LAND ? <b> (larger than the land: check the length and breadth)</b> : ''}.
            {R.LCOST > 0 && <> Land price <b>₹{R.LPS.toFixed(2)} per sq ft</b> = ₹{num(R.LPS * 435.6)} per cent = ₹{num(R.LPS * 43560)} per acre. Land cost <b>₹{num(R.LCOST)}</b>.</>}</>
          : 'Enter the land area.'}
      </p>
      <p className="note" id="geo">
        {R.PLAN > 0
          ? <>Plan area <b>{num(R.PLAN)} sq ft</b> ({num(R.PLAN * 0.092903)} m²) · Built-up area <b>{num(R.BS)} sq ft</b> ({num(R.A)} m²) · Height per floor <b>{(R.HT / R.F).toFixed(1)} ft</b> · External wall area <b>{num(R.WALLFT)} sq ft</b>
            {(R.HT / R.F < 8 || R.HT / R.F > 50) && <b> · Check the height: {(R.HT / R.F).toFixed(1)} ft per floor is unusual</b>}</>
          : 'Enter the length and width of the building in feet.'}
      </p>
      <p className="note" id="rbinfo"><b>Rate basis:</b> {basisInfo(I)}</p>
      <TradesDetails state={state} dispatch={dispatch} R={R} />
    </div>
  );
}

function TradesDetails({ state, dispatch, R }) {
  const [open, setOpen] = useState(false);
  return (
    <details open={open} onToggle={(e) => setOpen(e.target.open)}>
      <summary>Edit labour wages and labourers (add trades, set how many to use)</summary>
      <div style={{ marginTop: 10 }}><TradesEditor state={state} dispatch={dispatch} R={R} /></div>
    </details>
  );
}
