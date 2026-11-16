import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import SectionIndex, { currentSection } from '../SectionIndex.jsx';

describe('currentSection', () => {
  const tops = (m) => (id) => m[id];
  it('is the first section at the top of the page', () => {
    expect(currentSection(['a', 'b', 'c'], tops({ a: 300, b: 900, c: 1500 }))).toBe('a');
  });
  it('is the last section whose top has passed the top of the window', () => {
    expect(currentSection(['a', 'b', 'c'], tops({ a: -1200, b: -300, c: 400 }))).toBe('b');
    expect(currentSection(['a', 'b', 'c'], tops({ a: -2000, b: -900, c: -50 }))).toBe('c');
  });
  it('at the very bottom of the page the last section is current, even if it cannot reach the top', () => {
    expect(currentSection(['a', 'b', 'c'], tops({ a: -2000, b: -300, c: 350 }), true)).toBe('c');
    expect(currentSection(['a', 'b', 'c'], tops({ a: -2000, b: -300, c: 350 }), false)).toBe('b');
  });
  it('ignores sections that are not on the page', () => {
    expect(currentSection(['a', 'b'], tops({ a: -10, b: null }))).toBe('a');
  });
});

describe('SectionIndex', () => {
  const items = [{ id: 's1', label: 'One' }, { id: 's2', label: 'Two' }, { id: 's3', label: 'Three', sub: true }];
  const mount = () => render(<div><SectionIndex items={items} /><div id="s1" /><div id="s2" /><div id="s3" /></div>);
  afterEach(() => { vi.restoreAllMocks(); });

  it('follows the scroll position', async () => {
    const pos = { s1: 0, s2: 700, s3: 1400 };
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function () { return { top: pos[this.id] ?? 0 }; });
    mount();
    expect(screen.getByRole('link', { name: 'One' })).toHaveAttribute('aria-current', 'true');
    Object.assign(pos, { s1: -800, s2: -100, s3: 600 });
    await act(async () => { window.dispatchEvent(new Event('scroll')); await new Promise((r) => setTimeout(r, 40)); });
    expect(screen.getByRole('link', { name: 'Two' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'One' })).not.toHaveAttribute('aria-current');
  });

  it('a clicked entry stays highlighted while the page scrolls, and the reader can take over', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    Element.prototype.scrollIntoView = vi.fn();
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function () { return { top: this.id === 's1' ? 0 : 5000 }; });
    mount();
    await user.click(screen.getByRole('link', { name: 'Two' }));
    expect(screen.getByRole('link', { name: 'Two' })).toHaveAttribute('aria-current', 'true');
    await act(async () => { window.dispatchEvent(new Event('scroll')); await new Promise((r) => setTimeout(r, 40)); });
    expect(screen.getByRole('link', { name: 'Two' })).toHaveAttribute('aria-current', 'true'); // not pulled back to One while scrolling
    await act(async () => { window.dispatchEvent(new Event('wheel')); await new Promise((r) => setTimeout(r, 40)); });
    expect(screen.getByRole('link', { name: 'One' })).toHaveAttribute('aria-current', 'true'); // the reader scrolled: follow the page again
  });

  it('marks sub-entries and renders nothing for a single section', () => {
    mount();
    expect(screen.getByRole('link', { name: 'Three' }).parentElement).toHaveClass('subitem');
    const { container } = render(<SectionIndex items={[items[0]]} />);
    expect(container.querySelector('nav')).toBeNull();
  });

  it('removes its listeners when it is closed', () => {
    const off = vi.spyOn(window, 'removeEventListener');
    mount().unmount();
    expect(off).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
