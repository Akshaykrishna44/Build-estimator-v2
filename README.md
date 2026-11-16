# Build Estimator

A React (JavaScript) app that estimates the cost, materials, man-hours, skilled workers, wood of a construction project, from foundation to finish, on **Tamil Nadu PWD** or **CPWD** schedule rates.

> Indicative estimates only. Not a quotation, a tender bill of quantities or engineering advice.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 194 unit and component tests
npm run coverage   # coverage report
npm run build      # production build in dist/
```

## What it does

- Project type (29 presets and your own), land area in sq ft / cents / acres, building length, breadth and height in feet, floors, schedule, overhead, contingency, GST.
- Cost, cost split (pie chart), cost per sq ft / per cent / per acre / per foot of height, land digging, labour share against the 35% rule of thumb.
- Material grades and prices (government options marked), quantity to use, bill of materials, wood and plywood requirement, roof types (truss with Galvalume sheet, RCC and more).
- Doors and windows by type (wood, UPVC, aluminium, steel, glass and more), your own types.
- Electricity board (EB) charges and substation: connected kW and kVA from the building, HT or LT supply, transformer size, EB connection charges and deposit (outside overhead and GST), substation works, all editable. A substation is added automatically for large loads and for data centres, energy buildings, fabs, EV plants and heavy industry.
- Solar installation: included automatically for industrial types and optional for every other build. Rooftop solar types (on-grid, hybrid, off-grid, or your own) and roof types (RCC, metal sheet, ground), sized from the roof area or your own kWp.
- Interior design: fit-out items (false ceiling, flooring, kitchen, wardrobes, furniture, partitions, lighting and more), automatic by building type, with quality levels and editable items.
- A new project starts empty; "Try an example project" loads a sample.
- Workers and days by trade, labourers to use, site limit, crews per work item.
- Edit every norm, add or delete sections, work items, materials, trades, door types and project types.
- Download a printable report (HTML) or a CSV. Edits are kept in your browser (localStorage).

## Rate bases

| Basis | Source |
|---|---|
| Tamil Nadu PWD SOR 2025-26 | Schedule of Rates 2025-26 Vol I, effective 22.07.2025, basic rates excluding GST (cement, sand, aggregate, steel, bricks, labour wages) |
| CPWD DAR/DSR 2023 | Delhi Analysis of Rates 2023 basic rates (01.04.2023, excluding GST), raised by the CPWD cost index of the chosen station (for example Chennai 115 on DPAR 2023) |
| Market (indicative) | Placeholder prices |

All other rates and every work norm are illustrative. Check them against current schedules and local quotes before relying on the numbers. Update `src/data/bases.js` and `src/data/materials.js` when a new schedule is issued.

## Project layout

```
src/data/      materials, work items, project types, trades, door types, rate bases (plain data)
src/engine/    calc.js (the whole estimate as a pure function), report.js, storage.js, units.js, format.js
src/state/     reducer.js (all edits), basis.js, initial.js, useEstimator.js
src/components React screens
src/test/      helpers and golden values captured from the earlier single-file version
```

`calculate(state)` in `src/engine/calc.js` has no React or browser code, so every number can be tested on its own.

## Tests

Vitest + React Testing Library.

- `engine/__tests__/calc.test.js` hand-worked cases (electrical-only project, GST, location factor, CPWD cost index, land units, wall area, wastage, formwork, roof types, doors, crews, labour limit), every project type on every basis, odd inputs.
- `engine/__tests__/parity.test.js` 87 golden cases from the single-file version.
- `state/__tests__` reducer actions, rate bases, saved state.
- `engine/__tests__/report.test.js` report and CSV, HTML escaping, pie slices.
- `components/__tests__` the whole app in a simulated browser: typing, unit changes, rate basis, labour limit, editing, deleting with confirmation, reset, saved edits, downloads.

## Publish on GitHub Pages

1. Push this folder to a GitHub repository (branch `main`).
2. In the repository open **Settings > Pages** and set the source to **GitHub Actions**.
3. Each push runs the tests and, if they pass, publishes the site.

## Not yet covered

Safari/Firefox and real-phone checks, screen-reader testing, the CPWD E&M DSR 2025 electrical rates, a Chennai cost index for 01.04.2026 (the newest found is 01.10.2025), and validation of the work norms against real projects.

## More
- `npm run build:single` builds one self-contained `dist/index.single.html` (no server needed).
- Download report (HTML) and Download PDF are in the toolbar. The PDF is built in the browser with jsPDF and shows amounts as "Rs." because the standard PDF fonts have no rupee sign.
- The Estimate page and the Edit work items and project types page are separate tabs.
- A sticky section index (side list on wide screens, a strip of chips on phones) jumps to each section and highlights the one you are reading, on both pages.
