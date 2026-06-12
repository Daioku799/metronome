import { MeterConfig, AccentLevel } from '../components/meter-editor/types';

/**
 * MeterConfig から音声エンジン用のアクセント配列（AccentLevel[]）を抽出します。
 */
export const toAccents = (config: MeterConfig): AccentLevel[] => {
  return config.beats;
};

/**
 * 各拍の強弱（AccentLevel）をエンジンが解釈可能な数値配列へマッピングします。
 * 3: strong, 2: medium, 1: weak, 0: none
 */
export const toNumericAccents = (config: MeterConfig): number[] => {
  const mapping: Record<AccentLevel, number> = {
    strong: 3,
    medium: 2,
    weak: 1,
    none: 0,
  };
  return config.beats.map((accent) => mapping[accent]);
};

/**
 * groupIndices から各グループの拍数（グループサイズ）の配列を計算します。
 * groupIndices はセパレーターが配置されるビートの 0-based index です（そのビートの直後にセパレーターが入る）。
 * 例: groupIndices = [1, 4], totalBeats = 7 => [2, 3, 2]
 */
export const toGroupSizes = (config: MeterConfig): number[] => {
  const { groupIndices, beats } = config;
  const totalBeats = beats.length;

  if (totalBeats === 0) return [];
  if (groupIndices.length === 0) return [totalBeats];

  const sizes: number[] = [];
  let lastSeparatorIndex = -1;

  // groupIndices がソートされていることを保証
  const sortedIndices = [...groupIndices].sort((a, b) => a - b);

  for (const index of sortedIndices) {
    // 有効な範囲内かつ、直前のセパレーターより後であることを確認
    // (UI上、最後のビートの後にはセパレーターを置けない)
    if (index < 0 || index >= totalBeats - 1 || index <= lastSeparatorIndex) continue;
    
    sizes.push(index - lastSeparatorIndex);
    lastSeparatorIndex = index;
  }

  // 最後のグループを追加
  sizes.push(totalBeats - 1 - lastSeparatorIndex);

  return sizes;
};
