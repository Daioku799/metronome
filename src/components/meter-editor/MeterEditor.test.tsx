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

  it('adds a beat when "Add Beat" button is clicked', () => {
    const handleChange = vi.fn();
    render(<MeterEditor initialConfig={{ beats: ['strong'], groupIndices: [] }} onChange={handleChange} />);
    
    const addButton = screen.getByTestId('add-beat-button');
    fireEvent.click(addButton);
    
    expect(screen.getAllByTestId('beat-cell')).toHaveLength(2);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      beats: ['strong', 'weak']
    }));
  });

  it('deletes a beat when delete button is clicked', () => {
    const handleChange = vi.fn();
    render(<MeterEditor initialConfig={{ beats: ['strong', 'medium'], groupIndices: [] }} onChange={handleChange} />);
    
    // Initially 2 cells
    expect(screen.getAllByTestId('beat-cell')).toHaveLength(2);
    
    const deleteButtons = screen.getAllByTestId('delete-beat-button');
    fireEvent.click(deleteButtons[1]); // Delete the second beat ('medium')
    
    expect(screen.getAllByTestId('beat-cell')).toHaveLength(1);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      beats: ['strong']
    }));
  });

  it('does not allow deleting the last beat', () => {
    render(<MeterEditor initialConfig={{ beats: ['strong'], groupIndices: [] }} />);
    
    expect(screen.queryByTestId('delete-beat-button')).not.toBeInTheDocument();
  });

  it('updates groupIndices correctly when a beat is deleted', () => {
    const handleChange = vi.fn();
    // Beats: [0, 1, 2], Separator between 1 and 2 (index 1)
    const initialConfig = {
      beats: ['strong', 'medium', 'weak'] as any[],
      groupIndices: [1]
    };
    render(<MeterEditor initialConfig={initialConfig} onChange={handleChange} />);
    
    const deleteButtons = screen.getAllByTestId('delete-beat-button');
    
    // Delete beat index 0. Separator at index 1 should shift to index 0.
    fireEvent.click(deleteButtons[0]);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      beats: ['medium', 'weak'],
      groupIndices: [0]
    }));
  });

  it('builds a complex "2+3+2" mixed meter from scratch', () => {
    const handleChange = vi.fn();
    // Start with 1 beat
    render(<MeterEditor initialConfig={{ beats: ['strong'], groupIndices: [] }} onChange={handleChange} />);
    
    // 1. Add beats to reach 7 beats (currently 1, add 6 more)
    const addButton = screen.getByTestId('add-beat-button');
    for (let i = 0; i < 6; i++) {
      fireEvent.click(addButton);
    }
    expect(screen.getAllByTestId('beat-cell')).toHaveLength(7);
    
    // Current beats: ['strong', 'weak', 'weak', 'weak', 'weak', 'weak', 'weak']
    
    // 2. Set accents for a typical 2+3+2 pattern (Strong on 0, 2, 5)
    // Beat 0 is already 'strong'
    const cells = screen.getAllByTestId('beat-cell');
    
    // Beat 2: 'weak' -> 'none' -> 'strong' (2 clicks)
    fireEvent.click(cells[2]);
    fireEvent.click(cells[2]);
    expect(cells[2]).toHaveAttribute('data-accent', 'strong');
    
    // Beat 5: 'weak' -> 'none' -> 'strong' (2 clicks)
    fireEvent.click(cells[5]);
    fireEvent.click(cells[5]);
    expect(cells[5]).toHaveAttribute('data-accent', 'strong');
    
    // 3. Set separators to create 2+3+2 (Separators after index 1 and 4)
    const separators = screen.getAllByTestId('group-separator');
    // separators[1] is between cells[1] and cells[2]
    // separators[4] is between cells[4] and cells[5]
    fireEvent.click(separators[1]);
    fireEvent.click(separators[4]);
    
    // 4. Verify the final config passed to onChange
    // The last call to onChange should contain the full config
    expect(handleChange).toHaveBeenLastCalledWith({
      beats: ['strong', 'weak', 'strong', 'weak', 'weak', 'strong', 'weak'],
      groupIndices: [1, 4]
    });
    
    // 5. Use delete operation as well (Task requirement: "Ensure all UI operations ... are used")
    // Delete the last beat to make it 2+3+1
    const deleteButtons = screen.getAllByTestId('delete-beat-button');
    fireEvent.click(deleteButtons[6]);
    
    expect(handleChange).toHaveBeenLastCalledWith({
      beats: ['strong', 'weak', 'strong', 'weak', 'weak', 'strong'],
      groupIndices: [1, 4]
    });
  });
});
