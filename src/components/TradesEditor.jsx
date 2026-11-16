import React, { useState } from 'react';
import { ConfirmButton } from './common.jsx';

export default function TradesEditor({ state, dispatch, R }) {
  const [f, setF] = useState({ name: '', wage: '', count: '' });
  const need = Object.fromEntries(R.tr.map(([k, , w]) => [k, w]));
  const upd = (key, field) => (e) => dispatch({ type: 'updateTrade', key, field, value: e.target.value });
  return (
    <div id="rates">
      <div className="scroll">
        <table className="cat">
          <thead><tr><th>Trade</th><th>Wage (₹ per hour)</th><th>Labourers to use</th><th>Needed for schedule</th><th /></tr></thead>
          <tbody>
            {Object.entries(state.trades).map(([k, t]) => (
              <tr key={k}>
                <td><input aria-label={`Trade name ${t.name}`} value={t.name} onChange={upd(k, 'name')} /></td>
                <td><input aria-label={`Wage for ${t.name}`} type="number" step="any" value={t.wage} onChange={upd(k, 'wage')} /></td>
                <td><input aria-label={`Labourers to use for ${t.name}`} type="number" min="0" step="1" placeholder="Not set" value={t.count || ''} onChange={upd(k, 'count')} /></td>
                <td data-need={k}>{need[k] || 0}</td>
                <td><ConfirmButton onConfirm={() => dispatch({ type: 'deleteTrade', key: k })} aria-label={`Delete trade ${t.name}`}>Delete</ConfirmButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="er4" style={{ marginTop: 10 }}>
        <label>New trade name<input value={f.name} placeholder="For example Welder" onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label>Wage (₹ per hour)<input type="number" value={f.wage} onChange={(e) => setF({ ...f, wage: e.target.value })} /></label>
        <label>Labourers to use<input type="number" min="0" placeholder="Optional" value={f.count} onChange={(e) => setF({ ...f, count: e.target.value })} /></label>
      </div>
      <button type="button" className="btn" style={{ marginTop: 10 }} onClick={() => { if (!f.name.trim()) return; dispatch({ type: 'addTrade', ...f, name: f.name.trim() }); setF({ name: '', wage: '', count: '' }); }}>Add trade</button>
      <p className="note">Labourers to use is how many people you plan to deploy for that trade. The Workers table compares it with the number the schedule needs and shows how many days the work takes with your number. Leave it empty to use the calculated number. After adding a trade, add it to a work item in the editor (Add trade) so it is included in the estimate.</p>
    </div>
  );
}
