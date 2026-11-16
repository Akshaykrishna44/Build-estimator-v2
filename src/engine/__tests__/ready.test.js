import { describe, it, expect } from 'vitest';
import { projectReady } from '../ready.js';
import { DEFAULT_INPUTS, SAMPLE_PROJECT } from '../../state/initial.js';

describe('projectReady', () => {
  it('an empty project is not ready and lists all six items', () => {
    const r = projectReady(DEFAULT_INPUTS);
    expect(r.ready).toBe(false);
    expect(r.missing).toHaveLength(6);
  });
  it('the example project is ready', () => {
    expect(projectReady({ ...DEFAULT_INPUTS, ...SAMPLE_PROJECT })).toEqual({ ready: true, missing: [] });
  });
  it('lists only what is missing; zero, negative and text do not count', () => {
    const I = { ...DEFAULT_INPUTS, ...SAMPLE_PROJECT };
    expect(projectReady({ ...I, len: '0' }).missing).toEqual(['building length']);
    expect(projectReady({ ...I, wid: '-5', days: 'abc' }).missing).toEqual(['building breadth', 'construction period']);
    expect(projectReady({ ...I, type: '' }).missing).toEqual(['project type']);
  });
  it('land is optional', () => {
    expect(projectReady({ ...DEFAULT_INPUTS, ...SAMPLE_PROJECT, land: '' }).ready).toBe(true);
  });
});
