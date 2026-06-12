import { AudioSynthesizer } from './AudioSynthesizer';
import { AccentLevel, WorkerMessage, MainMessage } from './types';

/**
 * メインスレッドからオーディオエンジンを制御するためのコントローラークラス
 */
export class AudioEngineController {
  private ctx: AudioContext;
  private synthesizer: AudioSynthesizer;
  private worker: Worker;
  private tickCallbacks: Set<(beatIndex: number) => void> = new Set();

  constructor() {
    // AudioContextの初期化
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // シンセサイザーの初期化
    this.synthesizer = new AudioSynthesizer(this.ctx);
    
    // Workerの初期化
    this.worker = new Worker(
      new URL('./worker/index.ts', import.meta.url),
      { type: 'module' }
    );

    // Workerからのメッセージハンドリング
    this.worker.onmessage = (event: MessageEvent<MainMessage>) => {
      const message = event.data;
      if (message.type === 'TICK') {
        // 音声のスケジュール
        this.synthesizer.scheduleClick(message.time, message.accent);
        
        // コールバックの実行
        this.tickCallbacks.forEach((callback) => callback(message.beatIndex));
      }
    };
  }

  /**
   * メトロノームを開始する
   */
  start(): void {
    // ユーザーインタラクションなしでAudioContextが中断されている場合を考慮
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    const message: WorkerMessage = {
      type: 'START',
      startTime: this.ctx.currentTime
    };
    this.worker.postMessage(message);
  }

  /**
   * メトロノームを停止する
   */
  stop(): void {
    const message: WorkerMessage = {
      type: 'STOP'
    };
    this.worker.postMessage(message);
  }

  /**
   * テンポ (BPM) を設定する
   * @param bpm Beats Per Minute
   */
  setTempo(bpm: number): void {
    const message: WorkerMessage = {
      type: 'CONFIG',
      config: { bpm }
    };
    this.worker.postMessage(message);
  }

  /**
   * 拍子の構造（アクセントの配列）を設定する
   * @param accents アクセントレベルの配列
   */
  setMeter(accents: AccentLevel[]): void {
    const message: WorkerMessage = {
      type: 'CONFIG',
      config: { accents }
    };
    this.worker.postMessage(message);
  }

  /**
   * マスターボリュームを設定する
   * @param volume 0.0 - 1.0
   */
  setVolume(volume: number): void {
    this.synthesizer.setMasterVolume(volume);
  }

  /**
   * 拍が鳴るたびに実行されるコールバックを登録する
   * @param callback 拍のインデックスを受け取るコールバック関数
   */
  onTick(callback: (beatIndex: number) => void): void {
    this.tickCallbacks.add(callback);
  }

  /**
   * 登録されたコールバックを解除する
   * @param callback 解除するコールバック関数
   */
  offTick(callback: (beatIndex: number) => void): void {
    this.tickCallbacks.delete(callback);
  }
}
