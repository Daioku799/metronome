import { useState, useEffect, useCallback } from 'react';
import { AudioEngineController } from '../audio/AudioEngineController';
import { useLocalStorage } from './useLocalStorage';
import { MeterConfig } from '../components/meter-editor/types';
import { toAccents } from '../utils/meterConverter';

const DEFAULT_BPM = 120;
const DEFAULT_VOLUME = 0.7;
const DEFAULT_METER: MeterConfig = {
  beats: ['strong', 'weak', 'weak', 'weak'],
  groupIndices: [],
};

/**
 * useMetronome
 * 
 * メトロノームの主要なロジックを管理するカスタムフック。
 * AudioEngineController のライフサイクル管理、状態の永続化、
 * およびエンジンへのパラメータ反映を担当します。
 */
export function useMetronome() {
  // 状態の永続化 (BPM, 音量, メーター構成)
  const [bpm, setBpmState] = useLocalStorage<number>('metronome-bpm', DEFAULT_BPM);
  const [volume, setVolumeState] = useLocalStorage<number>('metronome-volume', DEFAULT_VOLUME);
  const [meterConfig, setMeterConfigState] = useLocalStorage<MeterConfig>('metronome-meter', DEFAULT_METER);

  // 再生状態と現在の拍
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);

  // AudioEngineController のインスタンスを初期化
  // コンポーネントのライフサイクルを通じて同一のインスタンスを保持する
  const [engine] = useState(() => new AudioEngineController());

  // 拍（tick）の購読設定
  useEffect(() => {
    const handleTick = (beatIndex: number) => {
      setCurrentBeatIndex(beatIndex);
    };

    engine.onTick(handleTick);
    
    return () => {
      engine.offTick(handleTick);
    };
  }, [engine]);

  // エンジンへのパラメータ反映（BPM）
  useEffect(() => {
    engine.setTempo(bpm);
  }, [engine, bpm]);

  // エンジンへのパラメータ反映（音量）
  useEffect(() => {
    engine.setVolume(volume);
  }, [engine, volume]);

  // エンジンへのパラメータ反映（メーター構成）
  useEffect(() => {
    engine.setMeter(toAccents(meterConfig));
  }, [engine, meterConfig]);

  // クリーンアップ: コンポーネントのアンマウント時に再生を停止
  useEffect(() => {
    return () => {
      engine.stop();
    };
  }, [engine]);

  // 再生開始
  const start = useCallback(() => {
    engine.start();
    setIsPlaying(true);
  }, [engine]);

  // 再生停止
  const stop = useCallback(() => {
    engine.stop();
    setIsPlaying(false);
    setCurrentBeatIndex(0); // 停止時はインデックスをリセット
  }, [engine]);

  // 再生/停止のトグル
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  // 各種設定の更新メソッド
  const setBpm = useCallback((newBpm: number) => {
    setBpmState(newBpm);
  }, [setBpmState]);

  const setMeter = useCallback((newConfig: MeterConfig) => {
    setMeterConfigState(newConfig);
  }, [setMeterConfigState]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
  }, [setVolumeState]);

  return {
    // 状態 (State)
    bpm,
    meterConfig,
    volume,
    isPlaying,
    currentBeatIndex,

    // 操作 (Actions)
    start,
    stop,
    togglePlay,
    setBpm,
    setMeter,
    setVolume,
  };
}
