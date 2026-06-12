import React from 'react';

interface GroupSeparatorProps {
  /**
   * 区切り線が有効かどうか
   */
  active: boolean;
  /**
   * セパレーターがクリックされた時のコールバック
   */
  onClick: () => void;
}

/**
 * ビート間のグループ区切りを制御するコンポーネント。
 * ビート間に配置される透明なクリック判定領域を持ち、有効化されると垂直線を表示する。
 */
export const GroupSeparator: React.FC<GroupSeparatorProps> = ({ active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center w-2 h-20 cursor-pointer group shrink-0"
      data-testid="group-separator"
      data-active={active}
    >
      {/* クリック判定領域（ホバー時にわずかに背景色を付ける） */}
      <div className="absolute inset-0 group-hover:bg-slate-100 transition-colors rounded-sm" />
      
      {/* 区切り線本体：有効な場合は実線、無効な場合は透明（ホバーで薄く表示） */}
      <div
        className={`w-0.5 h-16 transition-all duration-200 z-10 ${
          active ? 'bg-slate-400' : 'bg-transparent group-hover:bg-slate-200'
        }`}
      />
    </div>
  );
};
