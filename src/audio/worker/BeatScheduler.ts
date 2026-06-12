import { AccentLevel, AudioConfig } from '../types';

/**
 * 拍のタイミングとアクセントを計算するクラス
 */
export class BeatScheduler {
  private bpm: number = 120;
  private accents: AccentLevel[] = ['strong', 'weak', 'weak', 'weak'];
  private currentBeatIndex: number = 0;
  private nextBeatTime: number = 0;

  constructor(config?: Partial<AudioConfig>) {
    if (config) {
      this.updateConfig(config);
    }
  }

  /**
   * 設定を更新する
   * @param config 更新する設定項目
   */
  updateConfig(config: Partial<AudioConfig>): void {
    if (config.bpm !== undefined && config.bpm > 0) {
      this.bpm = config.bpm;
    }
    if (config.accents !== undefined && config.accents.length > 0) {
      this.accents = config.accents;
      // アクセントシーケンスが変わった場合、現在のインデックスが範囲外ならリセットする
      if (this.currentBeatIndex >= this.accents.length) {
        this.currentBeatIndex = 0;
      }
    }
  }

  /**
   * スケジューラーをリセットする
   * @param startTime 次の拍の開始基準時間 (AudioContext.currentTime)
   */
  reset(startTime: number): void {
    this.currentBeatIndex = 0;
    this.nextBeatTime = startTime;
  }

  /**
   * 次の拍の情報を取得し、内部状態を更新する
   * @returns 拍の時間、アクセント、およびインデックス
   */
  getNextBeatInfo(): { time: number; accent: AccentLevel; index: number } {
    const accent = this.accents[this.currentBeatIndex];
    const time = this.nextBeatTime;
    const index = this.currentBeatIndex;

    // 次の拍の時間を計算 (60秒 / BPM)
    const secondsPerBeat = 60.0 / this.bpm;
    this.nextBeatTime += secondsPerBeat;

    // インデックスを進める（循環）
    this.currentBeatIndex = (this.currentBeatIndex + 1) % this.accents.length;

    return { time, accent, index };
  }

  /**
   * 次にスケジュールすべき拍の時間
   */
  get nextScheduleTime(): number {
    return this.nextBeatTime;
  }
}
