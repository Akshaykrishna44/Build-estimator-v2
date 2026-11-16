const positive = (v) => Number(v) > 0;

/** Whether the inputs are enough to estimate. missing lists what the user still has to give. */
export function projectReady(inputs) {
  const missing = [];
  if (!inputs.type) missing.push('project type');
  if (!positive(inputs.len)) missing.push('building length');
  if (!positive(inputs.wid)) missing.push('building breadth');
  if (!positive(inputs.hgt)) missing.push('building height');
  if (!positive(inputs.floors)) missing.push('number of floors');
  if (!positive(inputs.days)) missing.push('construction period');
  return { ready: missing.length === 0, missing };
}
