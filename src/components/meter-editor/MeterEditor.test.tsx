import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MeterEditor } from './index';

describe('MeterEditor', () => {
  it('cycles accent levels of a beat when clicked', () => {
    const initialBeats = ['strong'];
    render(<MeterEditor initialConfig={{ beats: initialBeats as any, groupIndices: [] }} />);
    
    const cell = screen.getByTestId('beat-cell');
    
    // Initial: strong
    expect(cell).toHaveAttribute('data-accent', 'strong');
    
    // Click 1: strong -> medium
    fireEvent.click(cell);
    expect(cell).toHaveAttribute('data-accent', 'medium');
    
    // Click 2: medium -> weak
    fireEvent.click(cell);
    expect(cell).toHaveAttribute('data-accent', 'weak');
    
    // Click 3: weak -> none
    fireEvent.click(cell);
    expect(cell).toHaveAttribute('data-accent', 'none');
    
    // Click 4: none -> strong
    fireEvent.click(cell);
    expect(cell).toHaveAttribute('data-accent', 'strong');
  });

  it('calls onChange when a beat is clicked', () => {
    const handleChange = vi.fn();
    render(<MeterEditor onChange={handleChange} />);
    
    const cells = screen.getAllByTestId('beat-cell');
    fireEvent.click(cells[0]);
    
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      beats: expect.arrayContaining(['medium'])
    }));
  });

  it('toggles group separator when clicked', () => {
    const handleChange = vi.fn();
    const initialConfig = {
      beats: ['strong', 'weak'] as any[],
      groupIndices: []
    };
    render(<MeterEditor initialConfig={initialConfig} onChange={handleChange} />);
    
    const separator = screen.getByTestId('group-separator');
    expect(separator).toHaveAttribute('data-active', 'false');
    
    // Toggle ON
    fireEvent.click(separator);
    expect(separator).toHaveAttribute('data-active', 'true');
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      groupIndices: [0]
    }));
    
    // Toggle OFF
    fireEvent.click(separator);
    expect(separator).toHaveAttribute('data-active', 'false');
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      groupIndices: []
    }));
  });
});
