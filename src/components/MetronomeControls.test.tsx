import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MetronomeControls } from './MetronomeControls';

describe('MetronomeControls', () => {
  const defaultProps = {
    bpm: 120,
    isPlaying: false,
    onBpmChange: vi.fn(),
    onTogglePlay: vi.fn(),
    onTap: vi.fn(),
  };

  it('renders correctly with initial values', () => {
    render(<MetronomeControls {...defaultProps} />);
    
    const input = screen.getByLabelText('Tempo');
    expect(input).toHaveValue(120);
    expect(screen.getByRole('slider')).toHaveValue('120');
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('calls onBpmChange when slider is moved', () => {
    render(<MetronomeControls {...defaultProps} />);
    
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '140' } });
    
    expect(defaultProps.onBpmChange).toHaveBeenCalledWith(140);
  });

  it('calls onBpmChange when number input is changed', () => {
    render(<MetronomeControls {...defaultProps} />);
    
    const input = screen.getByLabelText('Tempo');
    fireEvent.change(input, { target: { value: '140' } });
    
    expect(defaultProps.onBpmChange).toHaveBeenCalledWith(140);
  });

  it('enforces range on blur', () => {
    const onBpmChange = vi.fn();
    const { rerender } = render(<MetronomeControls {...defaultProps} bpm={20} onBpmChange={onBpmChange} />);
    
    const input = screen.getByLabelText('Tempo');
    fireEvent.blur(input);
    expect(onBpmChange).toHaveBeenCalledWith(40);

    rerender(<MetronomeControls {...defaultProps} bpm={400} onBpmChange={onBpmChange} />);
    fireEvent.blur(input);
    expect(onBpmChange).toHaveBeenCalledWith(300);
  });

  it('calls onTogglePlay when start/stop button is clicked', () => {
    render(<MetronomeControls {...defaultProps} />);
    
    const button = screen.getByText('Start');
    fireEvent.click(button);
    
    expect(defaultProps.onTogglePlay).toHaveBeenCalled();
  });

  it('shows "Stop" when isPlaying is true', () => {
    render(<MetronomeControls {...defaultProps} isPlaying={true} />);
    
    expect(screen.getByText('Stop')).toBeInTheDocument();
  });

  it('calls onTap when tap button is clicked', () => {
    render(<MetronomeControls {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /tap tempo/i });
    fireEvent.click(button);
    
    expect(defaultProps.onTap).toHaveBeenCalled();
  });
});
