import { AccentLevel } from './types';

/**
 * Web Audio APIを使用してクリック音を生成するクラス
 * このクラスはAudioContextが利用可能なメインスレッド（またはAudioWorklet）で動作することを想定しています。
 */
export class AudioSynthesizer {
  private ctx: AudioContext;
  private masterGain: GainNode;

  /**
   * @param ctx AudioContext インスタンス
   */
  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.connect(ctx.destination);
    // デフォルトボリューム
    this.masterGain.gain.value = 0.5;
  }

  /**
   * マスターボリュームを設定する
   * @param value 0.0 - 1.0
   */
  setMasterVolume(value: number): void {
    if (value < 0 || value > 1) {
      throw new Error('Volume must be between 0 and 1');
    }
    // 急激な変更によるノイズを防ぐため、ごく短い時間をかけて変更する
    // ctx.currentTime が利用可能であることを確認
    const currentTime = this.ctx.currentTime;
    this.masterGain.gain.setTargetAtTime(value, currentTime, 0.01);
  }

  /**
   * 指定した時刻にクリック音をスケジュールする
   * @param time AudioContext.currentTime 基準の秒
   * @param accent アクセントレベル
   */
  scheduleClick(time: number, accent: AccentLevel): void {
    if (accent === 'none') {
      return;
    }

    const osc = this.ctx.createOscillator();
    const envelope = this.ctx.createGain();

    // アクセントに応じた周波数の設定
    let frequency: number;
    switch (accent) {
      case 'strong':
        frequency = 880;
        break;
      case 'medium':
        frequency = 660;
        break;
      case 'weak':
      default:
        frequency = 440;
        break;
    }

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, time);

    // エンベロープの設定（短いクリック音）
    // 開始時にクリックノイズが出ないように、ごく短時間でアタックをかける
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(1, time + 0.002);
    // 指数関数的な減衰で自然な消音を実現
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(envelope);
    envelope.connect(this.masterGain);

    osc.start(time);
    // エンベロープの減衰が終わった後にオシレーターを停止してリソースを解放する
    osc.stop(time + 0.1);
  }
}
