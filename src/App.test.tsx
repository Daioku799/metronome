import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import App from './App';

// AudioEngineController のモック
const mockOnTick = vi.fn();
const mockOffTick = vi.fn();
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockSetTempo = vi.fn();
const mockSetMeter = vi.fn();
const mockSetVolume = vi.fn();

vi.mock('./audio/AudioEngineController', () => {
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

describe('Metronome App Integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  describe('5.1 永続化と復元の統合テスト', () => {
    it('設定を変更し、再レンダリング後にそれらが維持されていること', () => {
      // 1. App をレンダリング
      const { unmount } = render(<App />);

      // 2. BPM を変更 (120 -> 150)
      const bpmInput = screen.getByRole('spinbutton', { name: /^Tempo$/i }) as HTMLInputElement;
      fireEvent.change(bpmInput, { target: { value: '150' } });
      fireEvent.blur(bpmInput);

      // 3. メーターを変更 (拍を追加)
      const addBeatButton = screen.getByTestId('add-beat-button');
      fireEvent.click(addBeatButton);

      // 4. LocalStorage が更新されているか確認
      expect(window.localStorage.getItem('metronome-bpm')).toBe('150');
      const savedMeter = JSON.parse(window.localStorage.getItem('metronome-meter') || '{}');
      expect(savedMeter.beats.length).toBe(5); // 初期 4 + 追加 1

      // 5. アンマウントして再レンダリング (リロードのシミュレーション)
      unmount();
      render(<App />);

      // 6. 状態が復元されていることを確認
      const restoredBpmInput = screen.getByRole('spinbutton', { name: /^Tempo$/i }) as HTMLInputElement;
      expect(restoredBpmInput.value).toBe('150');
      
      const beatCells = screen.getAllByTestId('beat-cell');
      expect(beatCells.length).toBe(5);
    });

    it('LocalStorage が空の場合、デフォルト設定が適用されること', () => {
      render(<App />);

      const bpmInput = screen.getByRole('spinbutton', { name: /^Tempo$/i }) as HTMLInputElement;
      expect(bpmInput.value).toBe('120');

      const beatCells = screen.getAllByTestId('beat-cell');
      expect(beatCells.length).toBe(4);
    });
  });

  describe('5.2 再生同期とメーター更新の統合テスト', () => {
    it('再生を開始すると UI が更新され、エンジンが開始されること', () => {
      render(<App />);

      const startButton = screen.getByRole('button', { name: /Start Metronome/i });
      expect(startButton.textContent).toBe('Start');

      // 再生開始
      fireEvent.click(startButton);

      // ラベルが「Stop」に変わっていること
      expect(startButton.textContent).toBe('Stop');
      expect(startButton.getAttribute('aria-label')).toBe('Stop Metronome');

      // エンジンの start が呼ばれていること
      expect(mockStart).toHaveBeenCalled();
    });

    it('再生中にメーター構成を変更すると、エンジンに反映されること', () => {
      render(<App />);

      const startButton = screen.getByRole('button', { name: /Start Metronome/i });
      fireEvent.click(startButton);

      // 拍を追加
      const addBeatButton = screen.getByTestId('add-beat-button');
      fireEvent.click(addBeatButton);

      // エンジンの setMeter が新しい構成で呼ばれていること
      // 初期(4拍) -> 追加(5拍)
      expect(mockSetMeter).toHaveBeenLastCalledWith(['strong', 'weak', 'weak', 'weak', 'weak']);
    });

    it('停止すると UI が元に戻り、エンジンが停止されること', () => {
      render(<App />);

      const toggleButton = screen.getByRole('button', { name: /Start Metronome/i });
      
      // 開始
      fireEvent.click(toggleButton);
      expect(mockStart).toHaveBeenCalled();

      // 停止
      fireEvent.click(toggleButton);
      
      expect(toggleButton.textContent).toBe('Start');
      expect(mockStop).toHaveBeenCalled();
    });
  });
});
