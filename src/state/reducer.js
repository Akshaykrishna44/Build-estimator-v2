import { createInitialState, SAMPLE_PROJECT } from './initial.js';
import { applyBasis } from './basis.js';
import { BASES } from '../data/bases.js';
import { TYPE_MULT } from '../data/types.js';
import { convertArea, convertPrice } from '../engine/units.js';

const nextId = (list, from = 100) => Math.max(from, ...list.map((x) => Number(x.id) || 0)) + 1;
const nextKey = (obj, prefix) => prefix + (1 + Math.max(0, ...Object.keys(obj).filter((k) => new RegExp(`^${prefix}\\d+$`).test(k)).map((k) => +k.slice(prefix.length))));
const setItem = (state, id, fn) => ({ ...state, items: state.items.map((it) => (it.id === id ? fn(it) : it)) });

export function reducer(state, a) {
  switch (a.type) {
    case 'reset': return createInitialState();
    case 'load': return a.state;
    case 'loadSample': return { ...state, inputs: { ...state.inputs, ...SAMPLE_PROJECT } };

    // ---------------- inputs
    case 'input': {
      let inputs = { ...state.inputs, [a.name]: a.value };
      if (a.name === 'landUnit') inputs.land = String(convertArea(state.inputs.land, state.inputs.landUnit, a.value));
      if (a.name === 'landPriceUnit' && state.inputs.landPrice !== '') inputs.landPrice = String(convertPrice(state.inputs.landPrice, state.inputs.landPriceUnit, a.value));
      if (a.name === 'basis') {
        inputs.gst = String(BASES[a.value].gst);
        return applyBasis({ ...state, inputs }, a.value);
      }
      return { ...state, inputs };
    }

    // ---------------- materials and grades
    case 'selectGrade': {
      const o = state.catalog[a.key][a.index];
      return { ...state, materials: { ...state.materials, [a.key]: { ...state.materials[a.key], sel: a.index, rate: o.rate } } };
    }
    case 'setRate': return { ...state, materials: { ...state.materials, [a.key]: { ...state.materials[a.key], rate: Number(a.value) || 0 } } };
    case 'setOverride': return { ...state, materials: { ...state.materials, [a.key]: { ...state.materials[a.key], ovr: Math.max(0, Number(a.value) || 0) } } };
    case 'addGrade': {
      const list = [...state.catalog[a.key], { name: a.name, spec: 'Custom grade', rate: Number(a.rate) || 0, custom: true }];
      return { ...state, catalog: { ...state.catalog, [a.key]: list }, materials: { ...state.materials, [a.key]: { ...state.materials[a.key], sel: list.length - 1, rate: list[list.length - 1].rate } } };
    }
    case 'deleteGrade': {
      const m = state.materials[a.key], list = state.catalog[a.key];
      if (!list[m.sel] || !list[m.sel].custom || list.length < 2) return state;
      const nl = list.filter((_, i) => i !== m.sel);
      return { ...state, catalog: { ...state.catalog, [a.key]: nl }, materials: { ...state.materials, [a.key]: { ...m, sel: 0, rate: nl[0].rate } } };
    }
    case 'addMaterial': {
      const key = nextKey(state.materials, 'c');
      return {
        ...state,
        materials: { ...state.materials, [key]: { name: a.name, unit: a.unit || 'nos', waste: (Number(a.waste) || 0) / 100, custom: true, sel: 0, rate: Number(a.rate) || 0, ovr: 0 } },
        catalog: { ...state.catalog, [key]: [{ name: a.name, spec: 'Custom material', rate: Number(a.rate) || 0, custom: true }] },
      };
    }
    case 'deleteMaterial': {
      const { [a.key]: _m, ...materials } = state.materials, { [a.key]: _c, ...catalog } = state.catalog;
      return { ...state, materials, catalog, items: state.items.map((it) => ({ ...it, m: it.m.filter((r) => r[0] !== a.key) })) };
    }

    // ---------------- work items
    case 'addSection': case 'addItem': {
      const id = nextId(state.items);
      const item = { id, ph: a.name || a.phase || 'Other', n: 'New work item', u: 'm²', q: 0.1, plan: 0, dig: 0, drv: '', m: [], l: [['civil', 1]], e: [] };
      return { ...state, items: [...state.items, item] };
    }
    case 'updateItem': return setItem(state, a.id, (it) => {
      const v = a.field === 'q' ? Number(a.value) || 0 : a.field === 'dig' ? (a.value ? 1 : 0) : a.field === 'ph' ? String(a.value).trim() || 'Other' : a.value;
      const next = { ...it, [a.field]: v };
      if (a.field === 'drv') next.plan = a.value === 'plan' ? 1 : 0;
      return next;
    });
    case 'deleteItem': return { ...state, items: state.items.filter((it) => it.id !== a.id) };
    case 'deleteSection': return { ...state, items: state.items.filter((it) => it.ph !== a.phase) };
    case 'addRow': return setItem(state, a.id, (it) => {
      const row = a.kind === 'm' ? [Object.keys(state.materials)[0], 1] : a.kind === 'l' ? [Object.keys(state.trades)[0], 1] : ['Equipment', 0.1, 1000];
      return { ...it, [a.kind]: [...it[a.kind], row] };
    });
    case 'updateRow': return setItem(state, a.id, (it) => ({
      ...it,
      [a.kind]: it[a.kind].map((r, i) => {
        if (i !== a.index) return r;
        const row = [...r];
        row[a.col] = a.col === 0 ? a.value : Math.max(0, Number(a.value) || 0);
        return row;
      }),
    }));
    case 'deleteRow': return setItem(state, a.id, (it) => ({ ...it, [a.kind]: it[a.kind].filter((_, i) => i !== a.index) }));

    // ---------------- trades
    case 'updateTrade': return { ...state, trades: { ...state.trades, [a.key]: { ...state.trades[a.key], [a.field]: a.field === 'name' ? a.value || state.trades[a.key].name : Math.max(0, a.field === 'count' ? Math.floor(Number(a.value) || 0) : Number(a.value) || 0) } } };
    case 'addTrade': {
      const key = nextKey(state.trades, 'x');
      return { ...state, trades: { ...state.trades, [key]: { name: a.name, wage: Number(a.wage) || 0, count: Math.max(0, Math.floor(Number(a.count) || 0)) } } };
    }
    case 'deleteTrade': {
      if (Object.keys(state.trades).length < 2) return state;
      const { [a.key]: _t, ...trades } = state.trades;
      return { ...state, trades, items: state.items.map((it) => ({ ...it, l: it.l.filter((r) => r[0] !== a.key) })) };
    }

    // ---------------- your own project types
    case 'addType': {
      const found = state.ctypes.find((t) => t.key === a.from);
      const src = found ? found.mult : TYPE_MULT[a.from] || {};
      const key = nextKey(Object.fromEntries(state.ctypes.map((t) => [t.key, 1])), 't');
      const mult = {};
      for (const it of state.items) if (src[it.id] !== undefined) mult[it.id] = src[it.id];
      return { ...state, ctypes: [...state.ctypes, { key, name: a.name, mult }], inputs: { ...state.inputs, type: key } };
    }
    case 'renameType': return { ...state, ctypes: state.ctypes.map((t) => (t.key === a.key ? { ...t, name: a.name || t.name } : t)) };
    case 'setTypeMult': return { ...state, ctypes: state.ctypes.map((t) => (t.key === a.key ? { ...t, mult: { ...t.mult, [a.id]: a.value === '' ? 1 : Math.max(0, Number(a.value) || 0) } } : t)) };
    case 'deleteType': return { ...state, ctypes: state.ctypes.filter((t) => t.key !== a.key), inputs: { ...state.inputs, type: state.inputs.type === a.key ? '' : state.inputs.type } };

    // ---------------- doors and windows
    // ---------------- interior design
    case 'setInterior': return { ...state, interior: { ...state.interior, [a.field]: a.value } };
    case 'addInteriorItem': return { ...state, interior: { ...state.interior, items: [...state.interior.items, { id: nextId(state.interior.items, 0), name: a.name || 'New interior item', unit: 'sq ft', q: 0, rate: 0, hpu: 0 }] } };
    case 'updateInteriorItem': return { ...state, interior: { ...state.interior, items: state.interior.items.map((r) => (r.id === a.id ? { ...r, [a.field]: a.field === 'name' || a.field === 'unit' ? a.value : Math.max(0, Number(a.value) || 0) } : r)) } };
    case 'deleteInteriorItem': return { ...state, interior: { ...state.interior, items: state.interior.items.filter((r) => r.id !== a.id) } };
    case 'resetInterior': return { ...state, interior: createInitialState().interior };

    // ---------------- electricity board, substation and solar
    case 'setPower': return { ...state, power: { ...state.power, [a.field]: a.value } };
    case 'addPowerItem': return { ...state, power: { ...state.power, items: [...state.power.items, { id: nextId(state.power.items, 0), grp: a.grp === 'sub' ? 'sub' : 'eb', cls: 'all', basis: 'fix', name: a.name || 'New power item', unit: 'lot', q: 1, rate: 0, hpu: 0 }] } };
    case 'updatePowerItem': return { ...state, power: { ...state.power, items: state.power.items.map((r) => (r.id === a.id ? { ...r, [a.field]: ['name', 'unit', 'cls', 'basis'].includes(a.field) ? a.value : Math.max(0, Number(a.value) || 0) } : r)) } };
    case 'deletePowerItem': return { ...state, power: { ...state.power, items: state.power.items.filter((r) => r.id !== a.id) } };
    case 'resetPower': { const f = createInitialState(); return { ...state, power: f.power }; }
    case 'setSolar': return { ...state, solar: { ...state.solar, [a.field]: a.value } };
    case 'updateSolarType': return { ...state, solar: { ...state.solar, types: { ...state.solar.types, [a.key]: { ...state.solar.types[a.key], [a.field]: a.field === 'name' || a.field === 'note' ? a.value : Math.max(0, Number(a.value) || 0) } } } };
    case 'addSolarType': {
      const key = nextKey(state.solar.types, 's');
      return { ...state, solar: { ...state.solar, sys: key, types: { ...state.solar.types, [key]: { name: a.name || 'My solar type', note: 'Your own type', rate: 0, hpk: 14, fee: 0, battery: false } } } };
    }
    case 'deleteSolarType': {
      if (Object.keys(state.solar.types).length < 2) return state;
      const { [a.key]: _s, ...types } = state.solar.types;
      return { ...state, solar: { ...state.solar, types, sys: state.solar.sys === a.key ? Object.keys(types)[0] : state.solar.sys } };
    }
    case 'updateSolarMount': return { ...state, solar: { ...state.solar, mounts: { ...state.solar.mounts, [a.key]: { ...state.solar.mounts[a.key], [a.field]: a.field === 'name' ? a.value : Math.max(0, Number(a.value) || 0) } } } };
    case 'resetSolar': { const f = createInitialState(); return { ...state, solar: f.solar }; }

    case 'addDoor': return { ...state, doors: [...state.doors, { id: nextId(state.doors), name: 'New door or window', type: Object.keys(state.doorTypes)[0], n: 1, w: 3, h: 7, rate: 0 }] };
    case 'updateDoor': return { ...state, doors: state.doors.map((r) => (r.id === a.id ? { ...r, [a.field]: a.field === 'name' || a.field === 'type' ? a.value : Math.max(0, Number(a.value) || 0) } : r)) };
    case 'deleteDoor': return { ...state, doors: state.doors.filter((r) => r.id !== a.id) };
    case 'fillDoors': {
      const bs = a.bs || 0, count = { 1: Math.max(1, bs / 5000), 2: bs / 800, 3: bs / 400, 4: bs / 600, 5: bs / 10000 };
      return { ...state, doors: state.doors.map((r) => (count[r.id] !== undefined ? { ...r, n: Math.max(0, Math.round(count[r.id])) } : r)) };
    }
    case 'addDoorType': {
      const key = nextKey(state.doorTypes, 'y');
      return { ...state, doorTypes: { ...state.doorTypes, [key]: { name: a.name, spec: a.spec || 'Custom type', rate: Math.max(0, Number(a.rate) || 0), cft: 0 } } };
    }
    case 'updateDoorType': return { ...state, doorTypes: { ...state.doorTypes, [a.key]: { ...state.doorTypes[a.key], [a.field]: a.field === 'name' || a.field === 'spec' ? a.value : Math.max(0, Number(a.value) || 0) } } };
    case 'deleteDoorType': {
      if (Object.keys(state.doorTypes).length < 2) return state;
      const { [a.key]: _d, ...doorTypes } = state.doorTypes, first = Object.keys(doorTypes)[0];
      return { ...state, doorTypes, doors: state.doors.map((r) => (r.type === a.key ? { ...r, type: first } : r)) };
    }
    default: return state;
  }
}
