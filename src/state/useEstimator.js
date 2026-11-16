import { useEffect, useMemo, useReducer } from 'react';
import { reducer } from './reducer.js';
import { calculate } from '../engine/calc.js';
import { loadState, saveState } from '../engine/storage.js';

/** The app state, the calculated estimate, and a dispatch function. The state is saved in this browser. */
export function useEstimator() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const result = useMemo(() => calculate(state), [state]);
  useEffect(() => { saveState(state); }, [state]);
  return { state, dispatch, result };
}
