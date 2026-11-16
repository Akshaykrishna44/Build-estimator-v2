import { fmt, num } from '../engine/format.js';

/** The summary cards, as plain data so they can be tested. cls: 'main' | 'ok' | 'over' | ''. */
export function buildKpis(R) {
  const limit = +(R.LIM * 100).toFixed(2), over = R.labOver > 0;
  return [
    { cls: 'main', value: fmt(R.total), label: 'Total estimate' },
    { value: fmt(R.mc), label: 'Materials' },
    { value: fmt(R.lc), label: 'Labour' },
    { value: fmt(R.ec), label: 'Equipment' },
    { value: num(R.hrs), label: 'Man-hours' },
    { value: String(R.peak), label: 'Workers across all trades' },
    { cls: over ? 'over' : 'ok', value: (R.labPct * 100).toFixed(1) + '%', label: `Labour share of budget, limit ${limit}% (${over ? 'over' : 'within'})` },
    { value: R.projDays === null ? 'Not set' : R.projDays + ' days', label: `Duration with your crews, items one after another (schedule ${R.D} days)` },
    { value: R.BS ? fmt(R.total / R.BS) : '-', label: 'Cost per sq ft built-up' },
    ...(R.LCOST > 0 ? [
      { value: fmt(R.LCOST), label: `Land cost (₹${R.LPS.toFixed(2)} per sq ft)` },
      { value: fmt(R.total + R.LCOST), label: 'Total with land' },
      { value: R.BS ? fmt((R.total + R.LCOST) / R.BS) : '-', label: 'Cost per sq ft built-up with land' },
    ] : []),
  ];
}

/** The labour-limit message under the cards. */
export function labourMessage(R) {
  const limit = +(R.LIM * 100).toFixed(2), pct = (R.labPct * 100).toFixed(1);
  if (R.labOver > 0) {
    return {
      cls: 'over',
      head: `Labour is above the ${limit}% limit.`,
      body: ` Labour cost ${fmt(R.lc)} is ${pct}% of the total budget of ${fmt(R.total)} (excluding land). The limit allows ${fmt(R.labMax)}, so labour is ${fmt(R.labOver)} over: labour would have to come down by about ${(R.labOver / R.lc * 100).toFixed(0)}%. Ways to get there: use ready-mix concrete, precast or ready-made components, mechanised excavation, a crew plan with fewer idle hours, or recheck the labour norms and wages.`,
    };
  }
  return {
    cls: 'ok',
    head: `Labour is within the ${limit}% limit.`,
    body: ` Labour cost ${fmt(R.lc)} is ${pct}% of the total budget of ${fmt(R.total)} (excluding land). The limit allows up to ${fmt(R.labMax)}, leaving ${fmt(-R.labOver)} of room.`,
  };
}
