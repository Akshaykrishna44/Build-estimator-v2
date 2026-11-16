import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmButton } from '../common.jsx';
import PieChart from '../PieChart.jsx';

afterEach(() => vi.useRealTimers());

describe('ConfirmButton', () => {
  it('only acts on the second click', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<ConfirmButton onConfirm={fn}>Delete</ConfirmButton>);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(fn).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Click again to confirm' }));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
  it('disarms itself after a few seconds', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    render(<ConfirmButton onConfirm={fn}>Delete</ConfirmButton>);
    act(() => { screen.getByRole('button', { name: 'Delete' }).click(); });
    expect(screen.getByRole('button', { name: 'Click again to confirm' })).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(4000); });
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('PieChart', () => {
  it('draws a labelled chart with a slice per part', () => {
    const { container } = render(<PieChart parts={[['a', 60], ['b', 40], ['c', 0]]} total={100} />);
    expect(screen.getByRole('img', { name: 'Cost split pie chart' })).toBeInTheDocument();
    expect(container.querySelectorAll('path')).toHaveLength(2);
  });
  it('draws nothing when the total is zero', () => {
    const { container } = render(<PieChart parts={[['a', 0]]} total={0} />);
    expect(container.querySelectorAll('path,circle')).toHaveLength(0);
  });
});
