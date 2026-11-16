import React, { useState } from 'react';
import { useEstimator } from './state/useEstimator.js';
import InputsPanel from './components/InputsPanel.jsx';
import { Toolbar, Kpis, CostSplit, PerMeasurement, LandDigging } from './components/Summary.jsx';
import { MaterialsSection } from './components/Materials.jsx';
import DoorsWindows from './components/DoorsWindows.jsx';
import { WorkersSection, PhaseSummary, MaterialsByPhase } from './components/Workers.jsx';
import ProjectTypes from './components/ProjectTypes.jsx';
import WorkItems from './components/WorkItems.jsx';
import Interior from './components/Interior.jsx';
import Power from './components/Power.jsx';
import Solar from './components/Solar.jsx';
import SectionIndex from './components/SectionIndex.jsx';
import EmptyState from './components/EmptyState.jsx';
import { projectReady } from './engine/ready.js';

export default function App() {
  const { state, dispatch, result: R } = useEstimator();
  const { ready, missing } = projectReady(state.inputs);
  const [page, setPage] = useState('estimate');
  const estimateIndex = [{ id: 'sec-inputs', label: 'Project inputs' },
    ...(ready ? [['sec-summary', 'Summary and cost split'], ['sec-measure', 'Cost per measurement'], ['sec-digging', 'Land digging'], ['sec-specs', 'Material specifications'], ['sec-bom', 'Materials required'], ['sec-wood', 'Wood and timber'], ['sec-doors', 'Doors and windows'], ['sec-interior', 'Interior design'], ['sec-power', 'Electricity board and substation'], ['sec-solar', 'Solar installation'], ['sec-workers', 'Workers by trade'], ['sec-phases', 'Phase summary'], ['sec-matlist', 'Materials, base to finished']].map(([id, label]) => ({ id, label })) : [])];
  const phases = [...new Set(state.items.map((i) => i.ph))];
  const editIndex = [{ id: 'sec-types', label: 'Add your own project type' }, { id: 'sec-items', label: 'Edit sections and work items' }, ...phases.map((p, i) => ({ id: 'wi-' + i, label: p, sub: true }))];
  return (
    <div className="wrap">
      <h1>Build Estimator</h1>
      <p className="sub">Enter a project and get materials from base to finish, man-hours, workers per trade, and cost.</p>
      <nav className="tabs" role="tablist" aria-label="Pages">
        <button type="button" role="tab" id="tab-estimate" aria-selected={page === 'estimate'} className={page === 'estimate' ? 'on' : ''} onClick={() => setPage('estimate')}>Estimate</button>
        <button type="button" role="tab" id="tab-edit" aria-selected={page === 'edit'} className={page === 'edit' ? 'on' : ''} onClick={() => setPage('edit')}>Edit work items and project types</button>
      </nav>
      <div className={`layout${page === 'edit' ? ' edit' : ''}`}>
        <SectionIndex key={page} items={page === 'estimate' ? estimateIndex : editIndex} label={page === 'estimate' ? 'On this page' : 'Sections'} />
        <main className="main">
      {page === 'estimate' ? (
        <div role="tabpanel" aria-labelledby="tab-estimate">
          <div id="sec-inputs"><InputsPanel state={state} dispatch={dispatch} R={R} /></div>
          {ready ? (
            <>
              <div id="sec-summary">
                <Toolbar state={state} R={R} dispatch={dispatch} />
                <Kpis R={R} />
                <CostSplit R={R} />
              </div>
              <PerMeasurement R={R} />
              <LandDigging state={state} dispatch={dispatch} R={R} />
              <MaterialsSection state={state} dispatch={dispatch} R={R} />
              <DoorsWindows state={state} dispatch={dispatch} R={R} />
              <Interior state={state} dispatch={dispatch} R={R} />
              <Power state={state} dispatch={dispatch} R={R} />
              <Solar state={state} dispatch={dispatch} R={R} />
              <WorkersSection state={state} R={R} />
              <PhaseSummary R={R} />
              <MaterialsByPhase R={R} />
            </>
          ) : <EmptyState missing={missing} dispatch={dispatch} />}
        </div>
      ) : (
        <div role="tabpanel" aria-labelledby="tab-edit">
          <ProjectTypes state={state} dispatch={dispatch} />
          <WorkItems state={state} dispatch={dispatch} R={R} />
        </div>
      )}
      <p className="note">Rates marked TN PWD SOR are basic rates from the Government of Tamil Nadu Schedule of Rates 2025-26 (effective 22.07.2025, excluding GST), and the labour wages follow the same schedule. CPWD rates are from the Delhi Analysis of Rates 2023. All other rates and all work norms are illustrative placeholders. Check the current edition and local quotes before relying on the numbers. Indicative estimates only, not a quotation or engineering advice.</p>
        </main>
      </div>
    </div>
  );
}
