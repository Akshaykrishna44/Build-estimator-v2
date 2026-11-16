import { describe, it, expect } from 'vitest';
import golden from '../../test/golden.json';
import { stateWith } from '../../test/helpers.js';
import { calculate } from '../calc.js';

// Golden values captured from the single-file version of the estimator (87 cases: 29 project types x 3 rate bases).
// The React engine must give the same numbers.
describe('parity with the single-file version', () => {
  it.each(golden.map((g) => [`${g.basis}/${g.type}`, g]))('%s', (_, g) => {
    const R = calculate(stateWith({ type: g.type }, g.basis));
    const rel = (a, b) => Math.abs(a - b) / Math.max(1, Math.abs(b));
    for (const [mine, theirs] of [[R.total, g.total], [R.mc, g.mc], [R.lc, g.lc], [R.ec, g.ec], [R.hrs, g.hrs], [R.labPct, g.labPct], [R.tcft, g.tcft], [R.tsq, g.tsq], [R.dg.l, g.dig]]) expect(rel(mine, theirs)).toBeLessThan(1e-9);
    expect(R.peak).toBe(g.peak);
  });
});
