import { describe, it, expect } from 'vitest';
import { UF, SQM, convertArea, convertPrice, toNumber } from '../units.js';
import { num, fmt, fq, esc } from '../format.js';

describe('units', () => {
  it('constants', () => { expect(UF).toEqual({ sqft: 1, cent: 435.6, acre: 43560 }); expect(SQM).toBe(0.092903); });
  it('converts area without changing it', () => {
    expect(convertArea(1, 'acre', 'cent')).toBe(100);
    expect(convertArea(100000, 'sqft', 'cent')).toBeCloseTo(229.5684, 4);
    expect(convertArea(43560, 'sqft', 'acre')).toBe(1);
  });
  it('converts price per unit without changing it', () => {
    expect(convertPrice(2000, 'sqft', 'cent')).toBe(871200);
    expect(convertPrice(2000, 'sqft', 'acre')).toBe(87120000);
    expect(convertPrice(871200, 'cent', 'sqft')).toBe(2000);
  });
  it('toNumber treats bad input as 0', () => { expect([toNumber('x'), toNumber(''), toNumber('12.5'), toNumber(undefined)]).toEqual([0, 0, 12.5, 0]); });
});

describe('format', () => {
  it('Indian grouping', () => { expect(num(100000)).toBe('1,00,000'); expect(fmt(22377462)).toBe('₹2,23,77,462'); expect(num(999)).toBe('999'); });
  it('quantities', () => { expect(fq(4)).toBe('4'); expect(fq(4.26)).toBe('4.3'); expect(fq(4386.4)).toBe('4,386'); });
  it('escapes HTML', () => { expect(esc('<img src="x">&')).toBe('&lt;img src=&quot;x&quot;&gt;&amp;'); });
});
