import { renderHook, act } from '@testing-library/react';
import { useTapTempo } from './useTapTempo';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useTapTempo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2000, 1, 1, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初回タップ時にはコールバックが呼ばれないこと', () => {
    const onTempoCalculated = vi.fn();
    const { result } = renderHook(() => useTapTempo(onTempoCalculated));

    act(() => {
      result.current.tap();
    });

    expect(onTempoCalculated).not.toHaveBeenCalled();
  });

  it('2回目のタップ時にもコールバックが呼ばれないこと (最低3回必要)', () => {
    const onTempoCalculated = vi.fn();
    const { result } = renderHook(() => useTapTempo(onTempoCalculated));

    act(() => {
      result.current.tap(); // 1回目
      vi.advanceTimersByTime(500); // 120 BPM相当
      result.current.tap(); // 2回目
    });

    expect(onTempoCalculated).not.toHaveBeenCalled();
  });

  it('3回目のタップ時に平均BPMでコールバックが呼ばれること', () => {
    const onTempoCalculated = vi.fn();
    const { result } = renderHook(() => useTapTempo(onTempoCalculated));

    act(() => {
      result.current.tap(); // 0ms
      vi.advanceTimersByTime(500);
      result.current.tap(); // 500ms
      vi.advanceTimersByTime(500);
      result.current.tap(); // 1000ms
    });

    // 500ms間隔 -> 120 BPM
    expect(onTempoCalculated).toHaveBeenCalledWith(120);
  });

  it('複数回のタップから平均BPMを算出すること', () => {
    const onTempoCalculated = vi.fn();
    const { result } = renderHook(() => useTapTempo(onTempoCalculated));

    act(() => {
      result.current.tap(); // 0ms
      vi.advanceTimersByTime(400);
      result.current.tap(); // 400ms (150 BPM)
      vi.advanceTimersByTime(600);
      result.current.tap(); // 1000ms (100 BPM)
    });

    // 間隔: 400ms, 600ms. 平均: 500ms -> 120 BPM
    expect(onTempoCalculated).toHaveBeenCalledWith(120);
  });

  it('タップの間隔が長すぎるとリセットされること (2秒)', () => {
    const onTempoCalculated = vi.fn();
    const { result } = renderHook(() => useTapTempo(onTempoCalculated));

    act(() => {
      result.current.tap();
      vi.advanceTimersByTime(500);
      result.current.tap();
      vi.advanceTimersByTime(2100); // RESET_TIMEOUT (2000ms) を超過
      result.current.tap();
    });

    // 3回目のタップはリセット後の1回目として扱われるため、呼ばれない
    expect(onTempoCalculated).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
      result.current.tap(); // これで2回目
      vi.advanceTimersByTime(500);
      result.current.tap(); // これで3回目
    });

    expect(onTempoCalculated).toHaveBeenCalledWith(120);
  });

  it('reset()を呼ぶと手動でリセットされること', () => {
    const onTempoCalculated = vi.fn();
    const { result } = renderHook(() => useTapTempo(onTempoCalculated));

    act(() => {
      result.current.tap();
      vi.advanceTimersByTime(500);
      result.current.tap();
      
      result.current.reset();
      
      result.current.tap();
      vi.advanceTimersByTime(500);
      result.current.tap();
      vi.advanceTimersByTime(500);
      result.current.tap();
    });

    // リセット後の3タップ分だけが計算対象になる
    expect(onTempoCalculated).toHaveBeenCalledTimes(1);
    expect(onTempoCalculated).toHaveBeenCalledWith(120);
  });

  it('平均化に使用するタップ数は最大8回に制限されること', () => {
    const onTempoCalculated = vi.fn();
    const { result } = renderHook(() => useTapTempo(onTempoCalculated));

    act(() => {
      // 1000ms間隔 (60 BPM) で8回タップ
      for (let i = 0; i < 8; i++) {
        result.current.tap();
        if (i < 7) {
          vi.advanceTimersByTime(1000);
        }
      }
      // この時点で 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000 にタップ
      
      // 最後だけ 500ms間隔にする
      vi.advanceTimersByTime(500);
      result.current.tap(); // 7500ms
    });

    // タイムスタンプ保持数は最大8なので、最初の「0」が消える
    // 保持されるタイムスタンプ: [1000, 2000, 3000, 4000, 5000, 6000, 7000, 7500]
    // 間隔 (7つ): [1000, 1000, 1000, 1000, 1000, 1000, 500]
    // 合計: 6500ms. 平均: 6500 / 7 = 928.57...ms
    // BPM: 60000 / 928.57 = 64.6... -> 四捨五入して65
    expect(onTempoCalculated).toHaveBeenLastCalledWith(65);
  });

  it('40〜300 BPMの範囲外の計算結果は無視すること', () => {
    const onTempoCalculated = vi.fn();
    const { result } = renderHook(() => useTapTempo(onTempoCalculated));

    act(() => {
      // 速すぎるタップ (100ms = 600 BPM)
      result.current.tap();
      vi.advanceTimersByTime(100);
      result.current.tap();
      vi.advanceTimersByTime(100);
      result.current.tap();
    });
    expect(onTempoCalculated).not.toHaveBeenCalled();

    act(() => {
      result.current.reset();
      // 遅すぎるタップ (2000ms = 30 BPM)
      // 注意: 2000msちょうどはリセット条件(>2000)に当たらない
      result.current.tap();
      vi.advanceTimersByTime(2000);
      result.current.tap();
      vi.advanceTimersByTime(2000);
      result.current.tap();
    });
    expect(onTempoCalculated).not.toHaveBeenCalled();
  });
});
