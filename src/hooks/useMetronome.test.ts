import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMetronome } from './useMetronome';
import { MeterConfig } from '../components/meter-editor/types';

// AudioEngineController のモック
const mockOnTick = vi.fn();
const mockOffTick = vi.fn();
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockSetTempo = vi.fn();
const mockSetMeter = vi.fn();
const mockSetVolume = vi.fn();

vi.mock('../audio/AudioEngineController', () => {
  return {
    AudioEngineController: vi.fn().mockImplementation(() => {
      return {
        onTick: mockOnTick,
        offTick: mockOffTick,
        start: mockStart,
        stop: mockStop,
        setTempo: mockSetTempo,
        setMeter: mockSetMeter,
        setVolume: mockSetVolume,
      };
    }),
  };
});

describe('useMetronome', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('初期値で正しく初期化されること', () => {
    const { result } = renderHook(() => useMetronome());

    expect(result.current.bpm).toBe(120);
    expect(result.current.volume).toBe(0.7);
    expect(result.current.meterConfig.beats).toEqual(['strong', 'weak', 'weak', 'weak']);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentBeatIndex).toBe(0);
  });

  it('初期化時にエンジンに設定が同期されること', () => {
    renderHook(() => useMetronome());

    expect(mockSetTempo).toHaveBeenCalledWith(120);
    expect(mockSetVolume).toHaveBeenCalledWith(0.7);
    expect(mockSetMeter).toHaveBeenCalledWith(['strong', 'weak', 'weak', 'weak']);
  });

  it('再生を開始・停止できること', () => {
    const { result } = renderHook(() => useMetronome());

    act(() => {
      result.current.start();
    });
    expect(result.current.isPlaying).toBe(true);
    expect(mockStart).toHaveBeenCalled();

    act(() => {
      result.current.stop();
    });
    expect(result.current.isPlaying).toBe(false);
    expect(mockStop).toHaveBeenCalled();
    expect(result.current.currentBeatIndex).toBe(0);
  });

  it('再生状態をトグルできること', () => {
    const { result } = renderHook(() => useMetronome());

    act(() => {
      result.current.togglePlay();
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.togglePlay();
    });
    expect(result.current.isPlaying).toBe(false);
  });

  it('エンジンからの tick 通知で currentBeatIndex が更新されること', () => {
    const { result } = renderHook(() => useMetronome());
    
    // onTick に登録されたコールバックを取得
    const tickCallback = mockOnTick.mock.calls.find(call => typeof call[0] === 'function')![0];

    act(() => {
      tickCallback(2);
    });

    expect(result.current.currentBeatIndex).toBe(2);
  });

  it('BPM を更新し、エンジンと LocalStorage に同期されること', () => {
    const { result } = renderHook(() => useMetronome());

    act(() => {
      result.current.setBpm(145);
    });

    expect(result.current.bpm).toBe(145);
    expect(mockSetTempo).toHaveBeenCalledWith(145);
    expect(window.localStorage.getItem('metronome-bpm')).toBe('145');
  });

  it('音量を更新し、エンジンと LocalStorage に同期されること', () => {
    const { result } = renderHook(() => useMetronome());

    act(() => {
      result.current.setVolume(0.5);
    });

    expect(result.current.volume).toBe(0.5);
    expect(mockSetVolume).toHaveBeenCalledWith(0.5);
    expect(window.localStorage.getItem('metronome-volume')).toBe('0.5');
  });

  it('メーター構成を更新し、エンジンと LocalStorage に同期されること', () => {
    const { result } = renderHook(() => useMetronome());
    const newConfig: MeterConfig = {
      beats: ['strong', 'weak', 'medium', 'weak', 'weak'],
      groupIndices: [1],
    };

    act(() => {
      result.current.setMeter(newConfig);
    });

    expect(result.current.meterConfig).toEqual(newConfig);
    expect(mockSetMeter).toHaveBeenCalledWith(newConfig.beats);
    expect(window.localStorage.getItem('metronome-meter')).toBe(JSON.stringify(newConfig));
  });

  it('アンマウント時に再生が停止されること', () => {
    const { unmount } = renderHook(() => useMetronome());
    unmount();
    expect(mockStop).toHaveBeenCalled();
  });
});
