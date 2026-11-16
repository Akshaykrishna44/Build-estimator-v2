import { createInitialState } from '../state/initial.js';
import { reducer } from '../state/reducer.js';
import { calculate } from '../engine/calc.js';
import { SQM } from '../engine/units.js';

export { SQM };
export const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

/** A state with the given inputs changed (through the reducer, so conversions and basis rules apply). */
export function stateWith(inputs = {}, basis = 'mkt') {
  let s = reducer(createInitialState(), { type: 'loadSample' });
  s = reducer(s, { type: 'setInterior', field: 'mode', value: 'off' });
  s = reducer(s, { type: 'setPower', field: 'mode', value: 'off' });
  s = reducer(s, { type: 'setSolar', field: 'mode', value: 'off' });
  s = reducer(s, { type: 'input', name: 'basis', value: basis });
  for (const [name, value] of Object.entries(inputs)) s = reducer(s, { type: 'input', name, value });
  return s;
}

/** Use a project type where every work item is 0 except the ids in keep. */
export function onlyItems(state, keep) {
  const mult = {};
  for (let i = 0; i <= 14; i++) mult[i] = 0;
  Object.assign(mult, keep);
  return { ...state, ctypes: [{ key: 't1', name: 'Test', mult }], inputs: { ...state.inputs, type: 't1' } };
}

export const noDoors = (s) => ({ ...s, doors: s.doors.map((d) => ({ ...d, n: 0 })) });
export const calc = (s) => calculate(s);
export const pickGrade = (s, key, name) => reducer(s, { type: 'selectGrade', key, index: s.catalog[key].findIndex((o) => o.name === name) });

/** The initial state with the example project loaded. */
export const sampleState = () => reducer(createInitialState(), { type: 'loadSample' });
