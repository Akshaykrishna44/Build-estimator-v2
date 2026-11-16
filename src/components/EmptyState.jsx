import React from 'react';
import { ConfirmButton } from './common.jsx';

export default function EmptyState({ missing, dispatch }) {
  return (
    <div className="panel empty" id="empty">
      <h2>Start your estimate</h2>
      <p>Choose the project type and give the building length, breadth and height in feet, the number of floors and the construction period. The estimate appears as soon as these are filled in.</p>
      <p>Still needed:</p>
      <ul>{missing.map((m) => <li key={m}>{m}</li>)}</ul>
      <div className="row">
        <button type="button" className="btn" onClick={() => dispatch({ type: 'loadSample' })}>Try an example project</button>
        <ConfirmButton className="btn ghost" onConfirm={() => dispatch({ type: 'reset' })}>Reset everything</ConfirmButton>
      </div>
    </div>
  );
}
