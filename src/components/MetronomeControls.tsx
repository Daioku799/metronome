import React from 'react';

export interface MetronomeControlsProps {
  bpm: number;
  isPlaying: boolean;
  onBpmChange: (bpm: number) => void;
  onTogglePlay: () => void;
  onTap: () => void;
}

/**
 * MetronomeControls component provides UI for tempo adjustment and playback control.
 * It includes a slider, a number input for BPM, a tap tempo button, and a play/stop toggle.
 */
export const MetronomeControls: React.FC<MetronomeControlsProps> = ({
  bpm,
  isPlaying,
  onBpmChange,
  onTogglePlay,
  onTap,
}) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBpmChange(Number(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    // We allow values outside range while typing, but typically the parent will enforce limits or we can handle it here.
    // Given the requirement 2.1: "40から300 BPMの間でテンポを調整可能にする"
    onBpmChange(value);
  };

  const handleInputBlur = () => {
    if (bpm < 40) onBpmChange(40);
    if (bpm > 300) onBpmChange(300);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex items-center justify-between w-full max-w-xs">
          <label htmlFor="bpm-input" className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Tempo
          </label>
          <div className="flex items-baseline gap-1">
            <input
              id="bpm-input"
              type="number"
              min="40"
              max="300"
              value={bpm === 0 ? '' : bpm}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-20 text-3xl font-bold text-center border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
            />
            <span className="text-sm font-bold text-gray-400">BPM</span>
          </div>
        </div>
        
        <input
          id="bpm-slider"
          type="range"
          min="40"
          max="300"
          value={bpm}
          onChange={handleSliderChange}
          className="w-full max-w-sm h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={onTap}
          className="px-6 py-3 text-sm font-bold text-blue-600 uppercase tracking-widest transition-all bg-blue-50 rounded-full hover:bg-blue-100 active:scale-95 active:bg-blue-200"
          aria-label="Tap Tempo"
        >
          Tap
        </button>
        <button
          onClick={onTogglePlay}
          className={`px-12 py-4 text-xl font-black text-white uppercase tracking-tighter transition-all rounded-full shadow-lg active:scale-95 ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600 shadow-red-200 hover:shadow-red-300'
              : 'bg-green-500 hover:bg-green-600 shadow-green-200 hover:shadow-green-300'
          }`}
          aria-label={isPlaying ? 'Stop Metronome' : 'Start Metronome'}
        >
          {isPlaying ? 'Stop' : 'Start'}
        </button>
      </div>
    </div>
  );
};
