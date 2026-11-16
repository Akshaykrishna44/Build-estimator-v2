import { createInitialState } from '../state/initial.js';

export const STORAGE_KEY = 'build-estimator-react-v2';

/** Save the state in this browser only. Failures (private mode, full storage) are ignored. */
export function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

const REQUIRED = ['inputs', 'items', 'trades', 'materials', 'catalog', 'doors', 'doorTypes', 'ctypes'];

/** The saved state if it looks complete, otherwise a fresh one. Missing newer fields are filled from the defaults. */
export function loadState() {
  const fresh = createInitialState();
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!s || REQUIRED.some((k) => s[k] === undefined || s[k] === null)) return fresh;
    if (!Array.isArray(s.items) || !Array.isArray(s.doors) || !Array.isArray(s.ctypes)) return fresh;
    return { ...fresh, ...s, inputs: { ...fresh.inputs, ...s.inputs } };
  } catch { return fresh; }
}
