// Indian digit grouping (1,00,000) and small text helpers.
export const num = (n) => Math.round(n).toLocaleString('en-IN');
export const fmt = (n) => '₹' + num(n);
/** Quantity: whole numbers as is, small decimals to one place. */
export const fq = (q) => (Number.isInteger(q) ? num(q) : q < 10 ? q.toFixed(1) : num(q));
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
