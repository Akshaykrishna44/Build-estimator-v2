import React, { useState } from 'react';
import { ConfirmButton, H2, Note } from './common.jsx';
import { TYPE_GROUPS } from '../data/types.js';

export default function ProjectTypes({ state, dispatch }) {
  const [name, setName] = useState('');
  const [from, setFrom] = useState('shed');
  return (
    <>
      <H2 id="sec-types">Add your own project type</H2>
      <Note style={{ marginTop: 0 }}>Create a project type that is not in the list. Choose a similar type to start from, then set how much of each work item it needs: 1 keeps the default amount, 0 removes the item, 2 doubles it. Your types appear under Your project types in the Project type list.</Note>
      <div className="panel">
        <div className="er4">
          <label>Name of the new type<input id="ctn" placeholder="For example Solar module factory" value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label>Start from
            <select id="ctf" value={from} onChange={(e) => setFrom(e.target.value)}>
              {TYPE_GROUPS.map((g) => <optgroup key={g.label} label={g.label}>{g.options.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</optgroup>)}
              {state.ctypes.length > 0 && <optgroup label="Your project types">{state.ctypes.map((t) => <option key={t.key} value={t.key}>{t.name}</option>)}</optgroup>}
            </select>
          </label>
        </div>
        <button type="button" className="btn" style={{ marginTop: 10 }} onClick={() => { if (!name.trim()) return; dispatch({ type: 'addType', name: name.trim(), from }); setName(''); }}>Add project type</button>
        <div id="cts">
          {state.ctypes.length === 0 && <p className="note">You have not added any project types yet.</p>}
          {state.ctypes.map((t) => (
            <details key={t.key} style={{ marginTop: 12 }}>
              <summary>{t.name}</summary>
              <label style={{ marginTop: 10 }}>Name<input aria-label={`Name of ${t.name}`} value={t.name} onChange={(e) => dispatch({ type: 'renameType', key: t.key, name: e.target.value })} /></label>
              <div className="scroll">
                <table className="cat" style={{ marginTop: 8 }}>
                  <thead><tr><th>Work item</th><th>Section</th><th>Amount multiplier</th></tr></thead>
                  <tbody>
                    {state.items.map((it) => (
                      <tr key={it.id}><td>{it.n}</td><td>{it.ph}</td>
                        <td><input type="number" step="0.1" min="0" aria-label={`Multiplier of ${it.n} for ${t.name}`} value={t.mult[it.id] === undefined ? 1 : t.mult[it.id]} onChange={(e) => dispatch({ type: 'setTypeMult', key: t.key, id: it.id, value: e.target.value })} /></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 10 }}><ConfirmButton onConfirm={() => dispatch({ type: 'deleteType', key: t.key })}>Delete this project type</ConfirmButton></div>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
