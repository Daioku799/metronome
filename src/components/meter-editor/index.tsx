import React, { useState, useCallback } from 'react';
import { AccentLevel, MeterConfig } from './types';
import { BeatCell } from './BeatCell';
import { getNextAccentLevel } from './utils';

interface MeterEditorProps {
  initialConfig?: MeterConfig;
  onChange?: (config: MeterConfig) => void;
}

/**
 * メーター（拍子）を視覚的に編集するメインコンポーネント。
 */
export const MeterEditor: React.FC<MeterEditorProps> = ({
  initialConfig = { beats: ['strong', 'weak', 'weak', 'weak'], groupIndices: [] },
  onChange,
}) => {
  const [beats, setBeats] = useState<AccentLevel[]>(initialConfig.beats);
  const [groupIndices, setGroupIndices] = useState<number[]>(initialConfig.groupIndices);

  const handleBeatClick = useCallback((index: number) => {
    const newBeats = [...beats];
    newBeats[index] = getNextAccentLevel(newBeats[index]);
    setBeats(newBeats);
    
    if (onChange) {
      onChange({ beats: newBeats, groupIndices });
    }
  }, [beats, groupIndices, onChange]);

  return (
    <div className="flex flex-wrap items-center gap-1 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="flex items-center gap-1">
        {beats.map((accent, index) => (
          <React.Fragment key={index}>
            <BeatCell
              accent={accent}
              onClick={() => handleBeatClick(index)}
            />
            {/* TODO: Add GroupSeparator here in future tasks */}
          </React.Fragment>
        ))}
      </div>
      {/* TODO: Add "Add Beat" button here in future tasks */}
    </div>
  );
};
