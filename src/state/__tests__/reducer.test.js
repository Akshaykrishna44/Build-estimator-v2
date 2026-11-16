import { describe, it, expect } from 'vitest';
import { reducer } from '../reducer.js';
import { sampleState } from '../../test/helpers.js';
import { createInitialState } from '../initial.js';
import { loadState, saveState, STORAGE_KEY } from '../../engine/storage.js';

const init = () => sampleState();
const run = (s, ...actions) => actions.reduce((st, a) => reducer(st, a), s);

describe('inputs', () => {
  it('changing the land unit keeps the area', () => {
    const s = run(init(), { type: 'input', name: 'landUnit', value: 'cent' });
    expect(s.inputs.landUnit).toBe('cent');
    expect(Number(s.inputs.land)).toBeCloseTo(229.5684, 3);
  });
  it('changing the price unit keeps the price', () => {
    const s = run(init(), { type: 'input', name: 'landPrice', value: '2000' }, { type: 'input', name: 'landPriceUnit', value: 'cent' });
    expect(Number(s.inputs.landPrice)).toBe(871200);
  });
  it('an empty price stays empty when its unit changes', () => {
    expect(run(init(), { type: 'input', name: 'landPriceUnit', value: 'acre' }).inputs.landPrice).toBe('');
  });
  it('switching the basis sets GST, grades, wages and equipment', () => {
    let s = run(init(), { type: 'input', name: 'basis', value: 'cpwd' });
    expect([s.inputs.gst, s.materials.cem.rate, s.trades.mech.wage]).toEqual(['18', 257.8, 112]);
    s = run(s, { type: 'input', name: 'basis', value: 'mkt' });
    expect([s.inputs.gst, s.materials.cem.rate, s.trades.mech.wage, s.items[1].e[0][2]]).toEqual(['0', 375, 450, 1800]);
    s = run(s, { type: 'input', name: 'basis', value: 'tn' });
    expect([s.materials.cem.rate, s.trades.mech.wage]).toEqual([280.13, 130]);
  });
});

describe('materials and grades', () => {
  it('select a grade, edit the rate, set a quantity', () => {
    let s = run(init(), { type: 'selectGrade', key: 'cem', index: 1 });
    expect([s.materials.cem.sel, s.materials.cem.rate]).toEqual([1, 420]);
    s = run(s, { type: 'setRate', key: 'cem', value: '430' }, { type: 'setOverride', key: 'cem', value: '5000' });
    expect([s.materials.cem.rate, s.materials.cem.ovr]).toEqual([430, 5000]);
    expect(run(s, { type: 'setOverride', key: 'cem', value: '-4' }).materials.cem.ovr).toBe(0);
  });
  it('add and delete a custom grade; built-in grades cannot be deleted', () => {
    let s = run(init(), { type: 'addGrade', key: 'cem', name: 'My cement', rate: '333' });
    const list = s.catalog.cem;
    expect(list[list.length - 1]).toMatchObject({ name: 'My cement', rate: 333, custom: true });
    expect(s.materials.cem.rate).toBe(333);
    s = run(s, { type: 'deleteGrade', key: 'cem' });
    expect(s.catalog.cem.length).toBe(list.length - 1);
    const before = s.catalog.cem.length;
    expect(run(s, { type: 'deleteGrade', key: 'cem' }).catalog.cem.length).toBe(before);
  });
  it('add a material, use it in a work item, then delete it everywhere', () => {
    let s = run(init(), { type: 'addMaterial', name: 'Test cable', unit: 'm', waste: '5', rate: '55' });
    expect(s.materials.c1).toMatchObject({ name: 'Test cable', waste: 0.05, custom: true, rate: 55 });
    s = run(s, { type: 'addRow', id: 9, kind: 'm' }, { type: 'updateRow', id: 9, kind: 'm', index: 3, col: 0, value: 'c1' });
    expect(s.items.find((i) => i.id === 9).m.some((r) => r[0] === 'c1')).toBe(true);
    s = run(s, { type: 'deleteMaterial', key: 'c1' });
    expect(s.materials.c1).toBeUndefined();
    expect(s.items.find((i) => i.id === 9).m.some((r) => r[0] === 'c1')).toBe(false);
  });
});

describe('work items', () => {
  it('add section, edit, delete', () => {
    let s = run(init(), { type: 'addSection', name: 'Fire fighting' });
    const item = s.items[s.items.length - 1];
    expect(item).toMatchObject({ ph: 'Fire fighting', id: 101 });
    s = run(s, { type: 'updateItem', id: 101, field: 'n', value: 'Sprinklers' }, { type: 'updateItem', id: 101, field: 'q', value: '0.5' }, { type: 'updateItem', id: 101, field: 'dig', value: true });
    expect(s.items.find((i) => i.id === 101)).toMatchObject({ n: 'Sprinklers', q: 0.5, dig: 1 });
    s = run(s, { type: 'updateItem', id: 101, field: 'drv', value: 'plan' });
    expect(s.items.find((i) => i.id === 101)).toMatchObject({ drv: 'plan', plan: 1 });
    s = run(s, { type: 'deleteItem', id: 101 });
    expect(s.items.some((i) => i.id === 101)).toBe(false);
  });
  it('delete a whole section', () => {
    const s = run(init(), { type: 'deleteSection', phase: 'Finishing' });
    expect(s.items.some((i) => i.ph === 'Finishing')).toBe(false);
    expect(s.items.length).toBe(init().items.length - 2);
  });
  it('material, labour and equipment rows', () => {
    let s = run(init(), { type: 'addRow', id: 4, kind: 'l' }, { type: 'updateRow', id: 4, kind: 'l', index: 2, col: 1, value: '0.5' }, { type: 'updateRow', id: 4, kind: 'l', index: 2, col: 2, value: '3' });
    expect(s.items.find((i) => i.id === 4).l[2]).toEqual(['design', 0.5, 3]);
    s = run(s, { type: 'deleteRow', id: 4, kind: 'l', index: 2 });
    expect(s.items.find((i) => i.id === 4).l).toHaveLength(2);
    s = run(s, { type: 'addRow', id: 4, kind: 'e' });
    expect(s.items.find((i) => i.id === 4).e.at(-1)).toEqual(['Equipment', 0.1, 1000]);
  });
});

describe('trades', () => {
  it('edit, add, delete (and remove its labour rows)', () => {
    let s = run(init(), { type: 'updateTrade', key: 'civil', field: 'wage', value: '200' }, { type: 'updateTrade', key: 'civil', field: 'count', value: '7.9' });
    expect([s.trades.civil.wage, s.trades.civil.count]).toEqual([200, 7]);
    s = run(s, { type: 'addTrade', name: 'Welder', wage: '150', count: '4' });
    expect(s.trades.x1).toEqual({ name: 'Welder', wage: 150, count: 4 });
    s = run(s, { type: 'addRow', id: 4, kind: 'l' }, { type: 'updateRow', id: 4, kind: 'l', index: 2, col: 0, value: 'x1' });
    s = run(s, { type: 'deleteTrade', key: 'x1' });
    expect(s.trades.x1).toBeUndefined();
    expect(s.items.find((i) => i.id === 4).l.some((r) => r[0] === 'x1')).toBe(false);
  });
  it('the last trade cannot be deleted', () => {
    let s = init();
    for (const k of Object.keys(s.trades).slice(1)) s = run(s, { type: 'deleteTrade', key: k });
    expect(Object.keys(s.trades)).toHaveLength(1);
    expect(run(s, { type: 'deleteTrade', key: Object.keys(s.trades)[0] }).trades).toEqual(s.trades);
  });
});

describe('your own project types', () => {
  it('add from a built-in type, edit multipliers, rename, delete', () => {
    let s = run(init(), { type: 'addType', name: 'Solar module factory', from: 'manuf' });
    expect(s.inputs.type).toBe('t1');
    expect(s.ctypes[0].mult[9]).toBe(1.5);
    s = run(s, { type: 'setTypeMult', key: 't1', id: 9, value: '3' }, { type: 'renameType', key: 't1', name: 'Solar modules plant' });
    expect([s.ctypes[0].mult[9], s.ctypes[0].name]).toEqual([3, 'Solar modules plant']);
    s = run(s, { type: 'setTypeMult', key: 't1', id: 9, value: '' });
    expect(s.ctypes[0].mult[9]).toBe(1);
    s = run(s, { type: 'deleteType', key: 't1' });
    expect([s.ctypes.length, s.inputs.type]).toEqual([0, '']);
  });
});

describe('doors and windows', () => {
  it('add, edit, delete rows; suggest numbers', () => {
    let s = run(init(), { type: 'addDoor' });
    expect(s.doors.at(-1)).toMatchObject({ id: 101, n: 1, w: 3, h: 7 });
    s = run(s, { type: 'updateDoor', id: 101, field: 'name', value: 'Fire door' }, { type: 'updateDoor', id: 101, field: 'n', value: '4' });
    expect(s.doors.at(-1)).toMatchObject({ name: 'Fire door', n: 4 });
    s = run(s, { type: 'deleteDoor', id: 101 });
    expect(s.doors).toHaveLength(5);
    s = run(s, { type: 'fillDoors', bs: 21600 });
    expect(s.doors.map((d) => d.n)).toEqual([4, 27, 54, 36, 2]);
  });
  it('add, edit and delete a type; deleting reassigns rows', () => {
    let s = run(init(), { type: 'addDoorType', name: 'Bamboo', spec: 'Eco board', rate: '500' });
    expect(s.doorTypes.y1).toEqual({ name: 'Bamboo', spec: 'Eco board', rate: 500, cft: 0 });
    s = run(s, { type: 'updateDoorType', key: 'y1', field: 'cft', value: '0.05' }, { type: 'updateDoor', id: 3, field: 'type', value: 'y1' });
    expect(s.doorTypes.y1.cft).toBe(0.05);
    s = run(s, { type: 'deleteDoorType', key: 'y1' });
    expect(s.doorTypes.y1).toBeUndefined();
    expect(s.doors.find((d) => d.id === 3).type).toBe('hw');
  });
});

describe('empty start and example project', () => {
  it('a new project has no type, size or schedule', () => {
    const I = createInitialState().inputs;
    for (const k of ['type', 'land', 'len', 'wid', 'hgt', 'floors', 'days']) expect(I[k]).toBe('');
    expect(I.lablim).toBe('35');
  });
  it('loadSample fills the example and keeps other settings', () => {
    const s = reducer(run(createInitialState(), { type: 'input', name: 'oh', value: '12' }), { type: 'loadSample' });
    expect([s.inputs.type, s.inputs.len, s.inputs.wid, s.inputs.hgt, s.inputs.days, s.inputs.oh]).toEqual(['shed', '200', '108', '24', '120', '12']);
  });
});

describe('reset, load and unknown actions', () => {
  it('reset returns the defaults; unknown actions change nothing', () => {
    const s = run(init(), { type: 'addSection', name: 'X' }, { type: 'reset' });
    expect(s).toEqual(createInitialState());
    expect(s.inputs.type).toBe('');
    const t = init();
    expect(reducer(t, { type: 'nope' })).toBe(t);
  });
});

describe('storage', () => {
  it('round trip', () => {
    const s = run(init(), { type: 'addSection', name: 'Saved section' });
    saveState(s);
    expect(loadState().items.some((i) => i.ph === 'Saved section')).toBe(true);
  });
  it('falls back to defaults on corrupt or incomplete data', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadState()).toEqual(createInitialState());
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ inputs: {} }));
    expect(loadState()).toEqual(createInitialState());
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...createInitialState(), items: 'oops' }));
    expect(loadState()).toEqual(createInitialState());
  });
  it('fills inputs added in later versions', () => {
    const old = init();
    delete old.inputs.lablim;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(old));
    expect(loadState().inputs.lablim).toBe('35');
  });
});
