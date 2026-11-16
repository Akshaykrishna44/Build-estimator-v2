import React from 'react';
import { pieSlices } from '../engine/report.js';

export default function PieChart({ parts, total }) {
  const slices = pieSlices(parts, total, 'var(--surf)');
  return (
    <svg className="pie" viewBox="0 0 200 200" role="img" aria-label="Cost split pie chart">
      {slices.map((s) => (s.circle
        ? <circle key={s.i} cx="100" cy="100" r="90" fill={s.fill} />
        : <path key={s.i} d={s.d} fill={s.fill} style={{ stroke: s.stroke, strokeWidth: 2 }} />))}
    </svg>
  );
}
