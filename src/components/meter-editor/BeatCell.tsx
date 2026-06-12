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
  /**
   * 削除ボタンがクリックされた時のコールバック。
   * 指定されない場合、削除ボタンは表示されません。
   */
  onDelete?: () => void;
}

/**
 * 各ビートを表示し、アクセントレベルを視覚的に表現するコンポーネント。
 */
export const BeatCell: React.FC<BeatCellProps> = ({ accent, onClick, onDelete }) => {
  // アクセントレベルに応じたスタイルの定義
  // 形状（高さ）と色を変化させることで視覚的に区別する
  const accentStyles = {
    strong: 'bg-blue-600 h-16',
    medium: 'bg-blue-400 h-12',
    weak: 'bg-blue-200 h-8',
    none: 'bg-slate-200 h-2',
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center justify-end w-12 h-24 p-1 cursor-pointer hover:bg-slate-50 rounded transition-colors group relative"
      data-testid="beat-cell"
      data-accent={accent}
    >
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-0 right-0 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete beat"
          data-testid="delete-beat-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      <div
        className={`w-full rounded-sm transition-all duration-200 ${accentStyles[accent]} group-hover:ring-2 group-hover:ring-blue-300`}
        aria-label={`Accent level: ${accent}`}
      />
    </div>
  );
};
