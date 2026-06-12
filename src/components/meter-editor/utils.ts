import { AccentLevel } from './types';

/**
 * 次のアクセントレベルを返します。
 * 'strong' → 'medium' → 'weak' → 'none' → 'strong' の順で循環します。
 */
export const getNextAccentLevel = (current: AccentLevel): AccentLevel => {
  const transition: Record<AccentLevel, AccentLevel> = {
    strong: 'medium',
    medium: 'weak',
    weak: 'none',
    none: 'strong',
  };
  return transition[current];
};
