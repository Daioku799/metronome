import React from 'react';
import { AccentLevel } from './types';

interface BeatCellProps {
  /**
   * アクセントレベル ('strong', 'medium', 'weak', 'none')
   */
  accent: AccentLevel;
  /**
   * セルがクリックされた時のコールバック
   */
  onClick: () => void;
}

/**
 * 各ビートを表示し、アクセントレベルを視覚的に表現するコンポーネント。
 */
export const BeatCell: React.FC<BeatCellProps> = ({ accent, onClick }) => {
  // アクセントレベルに応じたスタイルの定義
  // 形状（高さ）と色を変化させることで視覚的に区別する
  const accentStyles = {
    strong: 'bg-blue-600 h-16',
    medium: 'bg-blue-400 h-12',
    weak: 'bg-blue-200 h-8',
    none: 'bg-slate-200 h-2',
  };

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center justify-end w-12 h-20 p-1 cursor-pointer hover:bg-slate-50 rounded transition-colors group"
      data-testid="beat-cell"
      data-accent={accent}
    >
      <div
        className={`w-full rounded-sm transition-all duration-200 ${accentStyles[accent]} group-hover:ring-2 group-hover:ring-blue-300`}
        aria-label={`Accent level: ${accent}`}
      />
    </div>
  );
};
