import React, { useState } from 'react';
import { ConfirmButton, H2, Note } from './common.jsx';

const HEADS = { m: ['Material', 'Quantity per unit of work', ''], l: ['Trade', 'Hours per unit', 'Workers (optional)', ''], e: ['Equipment', 'Hours per unit', 'Rate per hour (₹)', ''] };

function RowHead({ kind }) {
  return <div className={`er erh${kind === 'm' ? '' : ' e'}`} aria-hidden="true">{HEADS[kind].map((h, i) => <span key={i}>{h}</span>)}</div>;
}

function Rows({ item, kind, dispatch, state, R }) {
  const rows = item[kind];
  const upd = (index, col) => (e) => dispatch({ type: 'updateRow', id: item.id, kind, index, col, value: e.target.value });
  if (!rows.length) return null;
  return [<RowHead key="head" kind={kind} />].concat(rows.map((r, i) => (
    <div key={i} className={`er${kind === 'm' ? '' : ' e'}`}>
      {kind === 'm' && <select aria-label="Material" value={r[0]} onChange={upd(i, 0)}>{Object.entries(state.materials).map(([k, m]) => <option key={k} value={k}>{`${m.name} (${m.unit})`}</option>)}</select>}
      {kind === 'l' && <select aria-label="Trade" value={r[0]} onChange={upd(i, 0)}>{Object.entries(state.trades).map(([k, t]) => <option key={k} value={k}>{t.name}</option>)}</select>}
      {kind === 'e' && <input aria-label="Equipment name" value={r[0]} onChange={upd(i, 0)} />}
      <input type="number" step="any" aria-label={kind === 'm' ? 'Quantity per unit of work' : 'Hours per unit of work'} value={r[1]} onChange={upd(i, 1)} />
      {kind === 'l' && <input type="number" step="any" aria-label="Workers on this item (optional)" value={r[2] || ''} onChange={upd(i, 2)} />}
      {kind === 'e' && <input type="number" step="any" aria-label="Rate per hour" value={r[2]} onChange={upd(i, 2)} />}
      <button type="button" className="sm" onClick={() => dispatch({ type: 'deleteRow', id: item.id, kind, index: i })}>Remove</button>
    </div>
  )));
}

function ItemCard({ item, dispatch, state, R }) {
  const days = R.ITD[item.id];
  const set = (field) => (e) => dispatch({ type: 'updateItem', id: item.id, field, value: field === 'dig' ? e.target.checked : e.target.value });
  const drv = item.drv || (item.plan ? 'plan' : '');
  return (
    <details>
      <summary>{item.n} <span className="mu">per {item.u}{item.dig ? ' · land digging' : ''}</span>
        <span className="mu" data-itd={item.id}>{days === undefined ? '' : days === null ? ' · workers not set' : ` · ${days} ${days === 1 ? 'day' : 'days'} with your crew`}</span></summary>
      <div className="ef">
        <label>Section<input value={item.ph} onChange={set('ph')} /></label>
        <label>Work item name<input value={item.n} onChange={set('n')} /></label>
        <label>Unit<input value={item.u} onChange={set('u')} /></label>
        <label>Quantity per m² of that area<input type="number" step="any" value={item.q} onChange={set('q')} /></label>
        <label>Quantity based on
          <select value={drv} onChange={set('drv')}>
            <option value="">Built-up area</option><option value="plan">One floor’s plan area</option><option value="wall">Length, width and height (wall area)</option>
          </select>
        </label>
        <label className="ck"><input type="checkbox" checked={!!item.dig} onChange={set('dig')} /> Counts as land digging</label>
      </div>
      <b className="sl">Materials: quantity per unit of work</b>
      <Rows item={item} kind="m" dispatch={dispatch} state={state} R={R} />
      <button type="button" className="sm" onClick={() => dispatch({ type: 'addRow', id: item.id, kind: 'm' })}>Add material</button>
      <b className="sl">Labour: trade, hours per unit of work, workers on this item (optional)</b>
      <Rows item={item} kind="l" dispatch={dispatch} state={state} R={R} />
      <button type="button" className="sm" onClick={() => dispatch({ type: 'addRow', id: item.id, kind: 'l' })}>Add trade</button>
      <b className="sl">Equipment: name, hours per unit, rate per hour (₹)</b>
      <Rows item={item} kind="e" dispatch={dispatch} state={state} R={R} />
      <button type="button" className="sm" onClick={() => dispatch({ type: 'addRow', id: item.id, kind: 'e' })}>Add equipment</button>
      <div style={{ marginTop: 12 }}><ConfirmButton onConfirm={() => dispatch({ type: 'deleteItem', id: item.id })}>Delete this work item</ConfirmButton></div>
    </details>
  );
}

export default function WorkItems({ state, dispatch, R }) {
  const [name, setName] = useState('');
  const phases = [...new Set(state.items.map((i) => i.ph))];
  const slug = (p) => 'wi-' + phases.indexOf(p);
  return (
    <>
      <H2 id="sec-items">Edit sections and work items</H2>
      <Note>Change any norm, add or delete work items, materials, trades and equipment, or add and delete whole sections. The estimate updates as you type. Your edits are kept in this browser only.</Note>
      <div className="secs" id="ed">
        <div className="panel">
          <div className="addrow">
            <input id="newph" aria-label="New section name" placeholder="New section name, for example Fire fighting" value={name} onChange={(e) => setName(e.target.value)} />
            <button type="button" className="btn" onClick={() => { if (!name.trim()) return; dispatch({ type: 'addSection', name: name.trim() }); setName(''); }}>Add section</button>
          </div>
        </div>
        {phases.length === 0 && <p className="note">No work items. Add a section above to start.</p>}
        {phases.map((p) => (
          <section key={p} id={slug(p)} className="panel secbox">
            <div className="ph2">
              <h3 className="eh">{p}</h3>
              <span className="acts">
                <button type="button" className="sm" onClick={() => dispatch({ type: 'addItem', phase: p })}>Add work item</button>
                <ConfirmButton onConfirm={() => dispatch({ type: 'deleteSection', phase: p })}>Delete section</ConfirmButton>
              </span>
            </div>
            {state.items.filter((i) => i.ph === p).map((it) => <ItemCard key={it.id} item={it} dispatch={dispatch} state={state} R={R} />)}
          </section>
        ))}
      </div>
    </>
  );
}
