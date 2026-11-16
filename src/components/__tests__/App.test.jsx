import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App.jsx';
import { fireEvent } from '@testing-library/react';

const total = () => document.querySelector('.kpi.main b').textContent;
const openEdit = (user) => user.click(screen.getByRole('tab', { name: /Edit work items/ }));
const openEstimate = (user) => user.click(screen.getByRole('tab', { name: 'Estimate' }));
const labelled = (name) => screen.getByLabelText(name);
const setValue = async (user, name, value) => { const el = labelled(name); await user.clear(el); if (value !== '') await user.type(el, value); };

const renderReady = () => { const r = render(<App />); fireEvent.click(screen.getByRole('button', { name: 'Try an example project' })); return r; };

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:test');
  URL.revokeObjectURL = vi.fn();
});

describe('App', () => {
  it('shows the title, the total and the rate basis', () => {
    renderReady();
    expect(screen.getByRole('heading', { level: 1, name: 'Build Estimator' })).toBeInTheDocument();
    expect(total()).toMatch(/^₹[\d,]+$/);
    expect(screen.getByText(/Tamil Nadu PWD Schedule of Rates 2025-26/)).toBeInTheDocument();
    expect(document.querySelectorAll('#type option').length).toBe(30);
  });

  it('changing the land unit converts the number, not the area', async () => {
    const user = userEvent.setup();
    renderReady();
    expect(labelled('Land area value')).toHaveValue(100000);
    await user.selectOptions(labelled('Land area unit'), 'cent');
    expect(Number(labelled('Land area value').value)).toBeCloseTo(229.5684, 3);
    expect(document.querySelector('#landeq').textContent).toContain('1,00,000 sq ft');
    await user.selectOptions(labelled('Land area unit'), 'acre');
    expect(Number(labelled('Land area value').value)).toBeCloseTo(2.2957, 3);
  });

  it('a land price adds land cost cards', async () => {
    const user = userEvent.setup();
    renderReady();
    await user.type(labelled('Land price value'), '2000');
    expect(screen.getByText('Total with land')).toBeInTheDocument();
    expect(document.querySelector('#landeq').textContent).toContain('₹20,00,00,000');
  });

  it('switching to CPWD shows the station choice and changes the total', async () => {
    const user = userEvent.setup();
    renderReady();
    const tn = total();
    expect(screen.queryByLabelText('CPWD station')).toBeNull();
    await user.selectOptions(labelled('Rate basis'), 'cpwd');
    expect(labelled('CPWD station')).toBeInTheDocument();
    expect(total()).not.toBe(tn);
    expect(document.querySelector('#rbinfo').textContent).toContain('= +15%');
    await user.selectOptions(labelled('CPWD station'), 'custom');
    expect(labelled('Cost index')).toBeInTheDocument();
  });

  it('the labour limit turns the card and banner red when exceeded', async () => {
    const user = userEvent.setup();
    renderReady();
    expect(document.querySelector('#labnote')).toHaveClass('ok');
    await setValue(user, 'Labour limit percent', '5');
    expect(document.querySelector('#labnote')).toHaveClass('over');
    expect(document.querySelector('.kpi.over')).toBeInTheDocument();
    expect(screen.getByText('Labour is above the 5% limit.')).toBeInTheDocument();
  });

  it('typing a length changes the estimate and the geometry line', async () => {
    const user = userEvent.setup();
    renderReady();
    const before = total();
    await setValue(user, 'Length of the building', '400');
    expect(total()).not.toBe(before);
    expect(document.querySelector('#geo').textContent).toContain('43,200 sq ft');
  });

  it('quantity to use changes the material cost', async () => {
    const user = userEvent.setup();
    renderReady();
    const row = () => document.querySelector('[data-material="cem"]');
    const cost = () => row().querySelectorAll('td')[7].textContent;
    const before = cost();
    await user.type(labelled('Quantity to use for Cement'), '9000');
    expect(cost()).not.toBe(before);
    expect(within(document.querySelector('#tot')).getAllByText('9,000').length).toBeGreaterThan(0);
  });

  it('adds a section, a work item, and deletes with a second click', async () => {
    const user = userEvent.setup();
    renderReady();
    await openEdit(user);
    const count = () => document.querySelectorAll('#ed details').length;
    const n0 = count();
    await user.type(screen.getByPlaceholderText(/New section name/), 'Fire fighting');
    await user.click(screen.getByRole('button', { name: 'Add section' }));
    expect(count()).toBe(n0 + 1);
    expect(screen.getByRole('heading', { level: 3, name: 'Fire fighting' })).toBeInTheDocument();
    const del = screen.getAllByRole('button', { name: 'Delete this work item' }).at(-1);
    await user.click(del);
    expect(count()).toBe(n0 + 1);
    await user.click(del);
    expect(count()).toBe(n0);
  });

  it('doors and windows: add a row and see the total', async () => {
    const user = userEvent.setup();
    renderReady();
    const rows = () => document.querySelectorAll('#dwt tbody tr').length;
    const n0 = rows();
    await user.click(screen.getByRole('button', { name: 'Add door or window' }));
    expect(rows()).toBe(n0 + 1);
    const tfoot = document.querySelector('#dwt tfoot').textContent;
    expect(tfoot).toContain('Total');
    await user.click(screen.getByRole('button', { name: 'Suggest numbers from built-up area' }));
    expect(labelled('Number of Internal doors')).toHaveValue(27);
  });

  it('adds a trade and a project type of your own', async () => {
    const user = userEvent.setup();
    renderReady();
    await user.type(screen.getByPlaceholderText('For example Welder'), 'Welder');
    await user.click(within(document.querySelector('#rates')).getByRole('button', { name: 'Add trade' }));
    expect(labelled('Wage for Welder')).toBeInTheDocument();
    await openEdit(user);
    await user.type(screen.getByPlaceholderText(/For example Solar module factory/), 'Solar module factory');
    await user.click(screen.getByRole('button', { name: 'Add project type' }));
    await openEstimate(user);
    expect(within(document.querySelector('#type')).getByRole('option', { name: 'Solar module factory' }).selected).toBe(true);
  });

  it('reset everything needs two clicks and returns to the empty start', async () => {
    const user = userEvent.setup();
    renderReady();
    expect(total()).toMatch(/^₹[\d,]+$/);
    await user.click(screen.getByRole('button', { name: 'Reset everything' }));
    expect(document.querySelector('.kpi.main')).not.toBeNull();
    await user.click(screen.getByRole('button', { name: 'Click again to confirm' }));
    expect(document.querySelector('.kpi.main')).toBeNull();
    expect(screen.getByText('Start your estimate')).toBeInTheDocument();
    expect(labelled('Length of the building')).toHaveValue(null);
  });

  it('starts empty: no estimate, a list of what is missing, and no NaN', () => {
    render(<App />);
    expect(screen.getByText('Start your estimate')).toBeInTheDocument();
    expect(document.querySelector('.kpi.main')).toBeNull();
    expect(labelled('Length of the building')).toHaveValue(null);
    expect(document.querySelector('#type').value).toBe('');
    for (const m of ['project type', 'building length', 'building breadth', 'building height', 'number of floors', 'construction period']) expect(screen.getByText(m)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/NaN|Infinity|undefined/);
  });

  it('the estimate appears once every required input is given, without the example', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(document.querySelector('#type'), 'home');
    await setValue(user, 'Length of the building', '40');
    await setValue(user, 'Breadth of the building', '30');
    await setValue(user, 'Height of the building', '10');
    expect(document.querySelector('.kpi.main')).toBeNull();
    await setValue(user, 'Floors', '2');
    await setValue(user, 'Schedule in working days', '200');
    expect(total()).toMatch(/^₹[\d,]+$/);
    expect(screen.queryByText('Start your estimate')).toBeNull();
  });

  it('the example button loads a project', () => {
    renderReady();
    expect(labelled('Length of the building')).toHaveValue(200);
    expect(document.querySelector('#type').value).toBe('shed');
  });

  it('keeps your edits when the page is opened again', async () => {
    const user = userEvent.setup();
    const first = renderReady();
    await setValue(user, 'Length of the building', '321');
    first.unmount();
    render(<App />);
    expect(labelled('Length of the building')).toHaveValue(321);
  });

  it('shows names containing HTML as plain text', async () => {
    const user = userEvent.setup();
    renderReady();
    await openEdit(user);
    const evil = '<img src=x onerror="window.__x=1">';
    await user.type(screen.getByPlaceholderText(/New section name/), evil);
    await user.click(screen.getByRole('button', { name: 'Add section' }));
    expect(document.querySelectorAll('img').length).toBe(0);
    expect(window.__x).toBeUndefined();
    expect(screen.getAllByText(evil).length).toBeGreaterThan(0);
  });

  it('download buttons create a file', async () => {
    const user = userEvent.setup();
    renderReady();
    await user.click(screen.getByRole('button', { name: 'Download report' }));
    await user.click(screen.getByRole('button', { name: 'Download PDF' }));
    await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalledTimes(2), { timeout: 5000 });
    const blobs = URL.createObjectURL.mock.calls.map((c) => c[0]);
    expect(blobs[0].type).toBe('text/html');
    expect(blobs[1].type).toBe('application/pdf');
  });

  it('every project type renders without a crash', async () => {
    const user = userEvent.setup();
    renderReady();
    const select = document.querySelector('#type');
    for (const o of [...select.options].filter((x) => x.value)) {
      await user.selectOptions(select, o.value);
      expect(total()).toMatch(/^₹[\d,]+$/);
    }
    expect(document.body.textContent).not.toMatch(/NaN|Infinity|undefined/);
  });

  it('interior design: on for an office, off for a shed, editable, adds to the total', async () => {
    const user = userEvent.setup();
    renderReady(); // the example is an industrial shed
    expect(document.querySelector('#intstatus').textContent).toMatch(/does not normally need/);
    expect(document.querySelectorAll('#intt tbody tr').length).toBe(12);
    const shedTotal = total();
    await user.selectOptions(document.querySelector('#type'), 'office');
    expect(document.querySelector('#intstatus').textContent).toMatch(/included because/);
    const officeTotal = total();
    await user.selectOptions(labelled('Interior design mode'), 'off');
    expect(total()).not.toBe(officeTotal);
    await user.selectOptions(labelled('Interior design mode'), 'auto');
    expect(total()).toBe(officeTotal);
    await user.selectOptions(labelled('Interior quality level'), 'luxury');
    expect(total()).not.toBe(officeTotal);
    await user.type(screen.getByPlaceholderText('New interior item name'), 'Meeting pods');
    await user.click(screen.getByRole('button', { name: 'Add interior item' }));
    expect(document.querySelectorAll('#intt tbody tr').length).toBe(13);
    expect(shedTotal).toMatch(/^₹/);
  });

  it('electricity board and solar: shown for the example, editable, change the total, delete rows', async () => {
    const user = userEvent.setup();
    renderReady(); // an industrial shed: substation and solar come with it
    expect(document.querySelector('#pwstatus').textContent).toMatch(/substation|LT supply/i);
    expect(document.querySelector('#pwkpis').textContent).toMatch(/kW/);
    expect(document.querySelector('#solstatus').textContent).toMatch(/industrial/);
    expect(document.querySelectorAll('#soltypes tbody tr').length).toBe(3);
    const before = total();
    await user.click(screen.getByRole('radio', { name: 'Use Hybrid (grid and battery)' }));
    expect(total()).not.toBe(before);
    const withEb = total();
    await user.selectOptions(labelled('Electricity board mode'), 'off');
    expect(total()).not.toBe(withEb);
    await user.selectOptions(labelled('Electricity board mode'), 'on');
    expect(total()).toBe(withEb);
    const rows = document.querySelectorAll('#pw-eb tbody tr').length;
    await user.click(screen.getByRole('button', { name: 'Delete Temporary power connection for construction' }));
    await user.click(screen.getByRole('button', { name: 'Delete Temporary power connection for construction' }));
    expect(document.querySelectorAll('#pw-eb tbody tr').length).toBe(rows - 1);
    await user.selectOptions(document.querySelector('#type'), 'office');
    expect(document.querySelector('#solstatus').textContent).toMatch(/not included by default/);
    await user.selectOptions(labelled('Solar mode'), 'on');
    expect(document.querySelector('#solkpis').textContent).toMatch(/kWp/);
  });

  it('the editors are on their own page, reached by a tab', async () => {
    const user = userEvent.setup();
    renderReady();
    expect(screen.getByRole('tab', { name: 'Estimate' })).toHaveAttribute('aria-selected', 'true');
    expect(document.querySelector('#ed')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Edit sections and work items' })).toBeNull();
    await openEdit(user);
    expect(screen.getByRole('tab', { name: /Edit work items/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Edit sections and work items' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Add your own project type' })).toBeInTheDocument();
    expect(document.querySelector('.kpi.main')).toBeNull();
    expect(document.querySelectorAll('.index a').length).toBeGreaterThan(10);
    await openEstimate(user);
    expect(document.querySelector('.kpi.main')).not.toBeNull();
  });

  it('the edit page works before any project is chosen', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openEdit(user);
    expect(screen.getByRole('heading', { name: 'Edit sections and work items' })).toBeInTheDocument();
  });

  it('table columns line up: text columns left, numbers right, header matches cells', () => {
    renderReady();
    for (const sel of ['#tot', '#wood']) {
      const heads = [...document.querySelectorAll(`${sel} thead th`)];
      const row = [...document.querySelector(`${sel} tbody tr:not(.ph)`).children];
      expect(row.length).toBe(heads.length);
      heads.forEach((h, i) => expect(h.classList.contains('l'), `${sel} column ${i}`).toBe(row[i].classList.contains('l')));
    }
  });

  it('section index: lists the sections, jumps to one and highlights it', async () => {
    const user = userEvent.setup();
    const jump = vi.fn();
    Element.prototype.scrollIntoView = jump;
    // jsdom has no layout: put the first section at the top of the window and the rest below it
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function () { return { top: this.id === 'sec-inputs' ? 0 : 5000 }; });
    renderReady();
    const nav = screen.getByRole('navigation', { name: 'On this page' });
    const links = within(nav).getAllByRole('link').map((a) => a.textContent);
    expect(links).toEqual(['Project inputs', 'Summary and cost split', 'Cost per measurement', 'Land digging', 'Material specifications', 'Materials required', 'Wood and timber', 'Doors and windows', 'Interior design', 'Electricity board and substation', 'Solar installation', 'Workers by trade', 'Phase summary', 'Materials, base to finished']);
    for (const a of within(nav).getAllByRole('link')) expect(document.getElementById(a.getAttribute('href').slice(1)), a.textContent).not.toBeNull();
    expect(within(nav).getByRole('link', { name: 'Project inputs' })).toHaveAttribute('aria-current', 'true');
    await user.click(within(nav).getByRole('link', { name: 'Wood and timber' }));
    expect(jump).toHaveBeenCalled();
    expect(within(nav).getByRole('link', { name: 'Wood and timber' })).toHaveAttribute('aria-current', 'true');
    expect(within(nav).getByRole('link', { name: 'Project inputs' })).not.toHaveAttribute('aria-current');
  });

  it('section index: only Project inputs before a project is chosen, so no index is shown', () => {
    render(<App />);
    expect(screen.queryByRole('navigation', { name: 'On this page' })).toBeNull();
  });

  it('section index on the edit page lists the project types, the editor and every work section', async () => {
    const user = userEvent.setup();
    renderReady();
    await openEdit(user);
    const nav = screen.getByRole('navigation', { name: 'Sections' });
    const links = within(nav).getAllByRole('link');
    expect(links.length).toBe(2 + document.querySelectorAll('#ed section').length);
    for (const a of links) expect(document.getElementById(a.getAttribute('href').slice(1)), a.textContent).not.toBeNull();
  });

  it('material table: a delete icon at the end of each row removes the material after a second click', async () => {
    const user = userEvent.setup();
    renderReady();
    const rows = () => document.querySelectorAll('#cat tr[data-material]').length;
    const before = rows(), cost = total();
    expect(document.querySelectorAll('#cat .icon-del').length).toBe(before); // one on every row
    await user.click(screen.getByRole('button', { name: 'Delete Cement' }));
    expect(rows()).toBe(before); // the first click only asks
    expect(screen.getByText('Delete?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete Cement' }));
    expect(rows()).toBe(before - 1);
    expect(document.querySelector('[data-material="cem"]')).toBeNull();
    expect(total()).not.toBe(cost);
  });
});
