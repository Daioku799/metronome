import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BeatCell } from './BeatCell';
import { AccentLevel } from './types';

describe('BeatCell', () => {
  const accentLevels: AccentLevel[] = ['strong', 'medium', 'weak', 'none'];

  it.each(accentLevels)('renders with accent level %s', (accent) => {
    render(<BeatCell accent={accent} onClick={() => {}} />);
    const cell = screen.getByTestId('beat-cell');
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveAttribute('data-accent', accent);
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<BeatCell accent="strong" onClick={handleClick} />);
    const cell = screen.getByTestId('beat-cell');
    fireEvent.click(cell);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has different styles for different accent levels', () => {
    const { rerender } = render(<BeatCell accent="strong" onClick={() => {}} />);
    const indicatorStrong = screen.getByLabelText('Accent level: strong');
    const strongClasses = indicatorStrong.className;

    rerender(<BeatCell accent="none" onClick={() => {}} />);
    const indicatorNone = screen.getByLabelText('Accent level: none');
    const noneClasses = indicatorNone.className;

    expect(strongClasses).not.toBe(noneClasses);
    expect(strongClasses).toContain('h-16');
    expect(noneClasses).toContain('h-2');
  });
});
