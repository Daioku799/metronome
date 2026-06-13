import React, { useState, useCallback } from 'react';
import { AccentLevel, MeterConfig } from './types';
import { BeatCell } from './BeatCell';
import { GroupSeparator } from './GroupSeparator';
import { getNextAccentLevel } from './utils';

interface MeterEditorProps {
  /**
   * 現在のメーター構成（制御モード用）
   */
  config?: MeterConfig;
  /**
   * 初期メーター構成（非制御モード用）
   */
  initialConfig?: MeterConfig;
  /**
   * 現在アクティブな拍のインデックス
   */
  activeBeatIndex?: number;
  /**
   * 構成が変更された時のコールバック
   */
  onChange?: (config: MeterConfig) => void;
}

/**
 * メーター（拍子）を視覚的に編集するメインコンポーネント。
 */
export const MeterEditor: React.FC<MeterEditorProps> = ({
  config,
  initialConfig,
  activeBeatIndex,
  onChange,
}) => {
  // 内部状態。configが渡されている場合はそちらを優先する（が、簡易化のため内部状態も同期させる）
  const defaultConfig = initialConfig || { beats: ['strong', 'weak', 'weak', 'weak'], groupIndices: [] };
  const [internalBeats, setInternalBeats] = useState<AccentLevel[]>(defaultConfig.beats);
  const [internalGroupIndices, setInternalGroupIndices] = useState<number[]>(defaultConfig.groupIndices);

  // configプロップが提供されている場合はそれを使用し、そうでなければ内部状態を使用する
  const beats = config ? config.beats : internalBeats;
  const groupIndices = config ? config.groupIndices : internalGroupIndices;

  const notifyChange = useCallback((newBeats: AccentLevel[], newGroupIndices: number[]) => {
    if (!config) {
      setInternalBeats(newBeats);
      setInternalGroupIndices(newGroupIndices);
    }
    if (onChange) {
      onChange({ beats: newBeats, groupIndices: newGroupIndices });
    }
  }, [config, onChange]);

  const handleBeatClick = useCallback((index: number) => {
    const newBeats = [...beats];
    newBeats[index] = getNextAccentLevel(newBeats[index]);
    notifyChange(newBeats, groupIndices);
  }, [beats, groupIndices, notifyChange]);

  const handleSeparatorClick = useCallback((index: number) => {
    const newGroupIndices = groupIndices.includes(index)
      ? groupIndices.filter(i => i !== index)
      : [...groupIndices, index].sort((a, b) => a - b);
    
    notifyChange(beats, newGroupIndices);
  }, [beats, groupIndices, notifyChange]);

  const handleAddBeat = useCallback(() => {
    const newBeats: AccentLevel[] = [...beats, 'weak'];
    notifyChange(newBeats, groupIndices);
  }, [beats, groupIndices, notifyChange]);

  const handleDeleteBeat = useCallback((index: number) => {
    if (beats.length <= 1) return;

    const newBeats = beats.filter((_, i) => i !== index);
    const newGroupIndices = groupIndices
      .filter(i => i !== index)
      .map(i => (i > index ? i - 1 : i));
    
    notifyChange(newBeats, newGroupIndices);
  }, [beats, groupIndices, notifyChange]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-200" data-testid="meter-editor">
      <div className="grid grid-flow-col auto-cols-max items-end gap-1 mb-4 overflow-x-auto pb-2">
        {beats.map((accent, index) => (
          <React.Fragment key={index}>
            <BeatCell
              accent={accent}
              isActive={activeBeatIndex === index}
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
