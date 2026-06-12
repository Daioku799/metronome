import React, { useState, useCallback } from 'react';
import { AccentLevel, MeterConfig } from './types';
import { BeatCell } from './BeatCell';
import { GroupSeparator } from './GroupSeparator';
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

  const notifyChange = useCallback((newBeats: AccentLevel[], newGroupIndices: number[]) => {
    if (onChange) {
      onChange({ beats: newBeats, groupIndices: newGroupIndices });
    }
  }, [onChange]);

  const handleBeatClick = useCallback((index: number) => {
    const newBeats = [...beats];
    newBeats[index] = getNextAccentLevel(newBeats[index]);
    setBeats(newBeats);
    notifyChange(newBeats, groupIndices);
  }, [beats, groupIndices, notifyChange]);

  const handleSeparatorClick = useCallback((index: number) => {
    const newGroupIndices = groupIndices.includes(index)
      ? groupIndices.filter(i => i !== index)
      : [...groupIndices, index].sort((a, b) => a - b);
    
    setGroupIndices(newGroupIndices);
    notifyChange(beats, newGroupIndices);
  }, [beats, groupIndices, notifyChange]);

  const handleAddBeat = useCallback(() => {
    const newBeats: AccentLevel[] = [...beats, 'weak'];
    setBeats(newBeats);
    notifyChange(newBeats, groupIndices);
  }, [beats, groupIndices, notifyChange]);

  const handleDeleteBeat = useCallback((index: number) => {
    if (beats.length <= 1) return;

    const newBeats = beats.filter((_, i) => i !== index);
    // インデックスの再計算：削除されたビートより後のインデックスを1つ減らす
    // 削除されたインデックス自体にあるセパレーターも削除する
    const newGroupIndices = groupIndices
      .filter(i => i !== index)
      .map(i => (i > index ? i - 1 : i));
    
    setBeats(newBeats);
    setGroupIndices(newGroupIndices);
    notifyChange(newBeats, newGroupIndices);
  }, [beats, groupIndices, notifyChange]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="grid grid-flow-col auto-cols-max items-end gap-1 mb-4 overflow-x-auto pb-2">
        {beats.map((accent, index) => (
          <React.Fragment key={index}>
            <BeatCell
              accent={accent}
              onClick={() => handleBeatClick(index)}
              onDelete={beats.length > 1 ? () => handleDeleteBeat(index) : undefined}
            />
            {index < beats.length - 1 && (
              <GroupSeparator
                active={groupIndices.includes(index)}
                onClick={() => handleSeparatorClick(index)}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      <button
        onClick={handleAddBeat}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
        data-testid="add-beat-button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Beat</span>
      </button>
    </div>
  );
};
