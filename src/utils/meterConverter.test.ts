import { describe, it, expect } from 'vitest';
import { toAccents, toNumericAccents, toGroupSizes } from './meterConverter';
import { MeterConfig } from '../components/meter-editor/types';

describe('meterConverter', () => {
  describe('toAccents', () => {
    it('should extract beats as accents', () => {
      const config: MeterConfig = {
        beats: ['strong', 'weak', 'medium', 'weak'],
        groupIndices: [2]
      };
      expect(toAccents(config)).toEqual(['strong', 'weak', 'medium', 'weak']);
    });
  });

  describe('toNumericAccents', () => {
    it('should map AccentLevel to numeric values', () => {
      const config: MeterConfig = {
        beats: ['strong', 'medium', 'weak', 'none'],
        groupIndices: []
      };
      // 3: strong, 2: medium, 1: weak, 0: none
      expect(toNumericAccents(config)).toEqual([3, 2, 1, 0]);
    });
  });

  describe('toGroupSizes', () => {
    it('should return a single size if groupIndices is empty', () => {
      const config: MeterConfig = {
        beats: ['strong', 'weak', 'weak', 'weak'],
        groupIndices: []
      };
      expect(toGroupSizes(config)).toEqual([4]);
    });

    it('should calculate group sizes for mixed meter (2+3+2)', () => {
      const config: MeterConfig = {
        beats: new Array(7).fill('weak'),
        groupIndices: [1, 4]
      };
      expect(toGroupSizes(config)).toEqual([2, 3, 2]);
    });

    it('should calculate group sizes for (3+2)', () => {
      const config: MeterConfig = {
        beats: new Array(5).fill('weak'),
        groupIndices: [2]
      };
      expect(toGroupSizes(config)).toEqual([3, 2]);
    });

    it('should handle groupIndices containing 0 correctly', () => {
      const config: MeterConfig = {
        beats: new Array(4).fill('weak'),
        groupIndices: [0, 2]
      };
      // separator after 0, separator after 2
      // [0] | [1, 2] | [3]
      expect(toGroupSizes(config)).toEqual([1, 2, 1]);
    });

    it('should handle out of bounds indices (ignoring them)', () => {
      const config: MeterConfig = {
        beats: new Array(4).fill('weak'),
        groupIndices: [1, 10]
      };
      // separator after 1
      // [0, 1] | [2, 3]
      expect(toGroupSizes(config)).toEqual([2, 2]);
    });

    it('should handle unsorted indices', () => {
      const config: MeterConfig = {
        beats: new Array(7).fill('weak'),
        groupIndices: [4, 1]
      };
      expect(toGroupSizes(config)).toEqual([2, 3, 2]);
    });

    it('should return empty array for empty beats', () => {
      const config: MeterConfig = {
        beats: [],
        groupIndices: [1]
      };
      expect(toGroupSizes(config)).toEqual([]);
    });
  });
});
