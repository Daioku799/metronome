import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GroupSeparator } from './GroupSeparator';

describe('GroupSeparator', () => {
  it('renders correctly when inactive', () => {
    render(<GroupSeparator active={false} onClick={() => {}} />);
    const separator = screen.getByTestId('group-separator');
    expect(separator).toHaveAttribute('data-active', 'false');
  });

  it('renders correctly when active', () => {
    render(<GroupSeparator active={true} onClick={() => {}} />);
    const separator = screen.getByTestId('group-separator');
    expect(separator).toHaveAttribute('data-active', 'true');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<GroupSeparator active={false} onClick={handleClick} />);
    const separator = screen.getByTestId('group-separator');
    fireEvent.click(separator);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
