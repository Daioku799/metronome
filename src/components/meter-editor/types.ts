export type AccentLevel = 'strong' | 'medium' | 'weak' | 'none';

export interface MeterConfig {
  /**
   * Flat array of accent levels for audio-engine.
   */
  beats: AccentLevel[];
  /**
   * Indices where a group ends.
   * For visual grouping in UI, e.g. [2, 5] for (2+3+2) would mean
   * separators after beat index 1 and 4 (if we use 1-based or 0-based boundary logic).
   * Based on design.md: "groupIndices: number[] (区切りが入るビートの0-based index)"
   */
  groupIndices: number[];
}
