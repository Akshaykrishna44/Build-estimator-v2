// Area units: 1 acre = 43,560 sq ft = 100 cents; 1 sq ft = 0.092903 m².
export const SQM = 0.092903;
export const UF = { sqft: 1, cent: 435.6, acre: 43560 };

export const toNumber = (v) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

/** Change a land area from one unit to another without changing the area itself. */
export const convertArea = (value, from, to) => +((toNumber(value) * UF[from]) / UF[to]).toFixed(4);

/** Change a land price per unit (per sq ft, cent or acre) without changing the price itself. */
export const convertPrice = (value, from, to) => +((toNumber(value) / UF[from]) * UF[to]).toFixed(2);
