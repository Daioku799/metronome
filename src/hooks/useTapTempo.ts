import { useCallback, useRef } from 'react';

export interface UseTapTempoResult {
  tap: () => void;
  reset: () => void;
}

const RESET_TIMEOUT = 2000; // 2秒間タップがなければリセット
const MIN_TAPS = 3; // 少なくとも3回のタップが必要（2つの間隔）
const MAX_TAPS = 8; // 平均化に利用する最大タップ数

/**
 * タップイベントの間隔から平均BPMを算出するカスタムフック
 * @param onTempoCalculated BPMが算出された時に呼び出されるコールバック
 */
export function useTapTempo(onTempoCalculated: (bpm: number) => void): UseTapTempoResult {
  const tapTimestamps = useRef<number[]>([]);

  const reset = useCallback(() => {
    tapTimestamps.current = [];
  }, []);

  const tap = useCallback(() => {
    const now = Date.now();
    const lastTap = tapTimestamps.current[tapTimestamps.current.length - 1];

    // 前回のタップから一定時間経過していたらリセット
    if (lastTap && now - lastTap > RESET_TIMEOUT) {
      tapTimestamps.current = [now];
      return;
    }

    tapTimestamps.current.push(now);

    // 最大保持数を超えたら古いものを削除
    if (tapTimestamps.current.length > MAX_TAPS) {
      tapTimestamps.current.shift();
    }

    // 規定回数以上のタップがあればBPMを計算
    if (tapTimestamps.current.length >= MIN_TAPS) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimestamps.current.length; i++) {
        intervals.push(tapTimestamps.current[i] - tapTimestamps.current[i - 1]);
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = 60000 / avgInterval;

      // 仕様に基づき40〜300 BPMの範囲内に収める
      if (bpm >= 40 && bpm <= 300) {
        onTempoCalculated(Math.round(bpm));
      }
    }
  }, [onTempoCalculated]);

  return { tap, reset };
}
