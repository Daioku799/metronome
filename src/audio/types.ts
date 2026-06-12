/**
 * 拍子のアクセントレベル
 * 'strong': 強拍 (例: 1拍目)
 * 'medium': 中拍 (例: 混合拍子の中間の強調)
 * 'weak': 弱拍
 * 'none': 無音
 */
export type AccentLevel = 'strong' | 'medium' | 'weak' | 'none';

/**
 * オーディオエンジンの設定
 */
export interface AudioConfig {
  /** テンポ (Beats Per Minute) */
  bpm: number;
  /** アクセントレベルの配列（拍子構造） */
  accents: AccentLevel[];
  /** マスターボリューム (0.0 - 1.0) */
  volume: number;
}

/**
 * メインスレッドからWorkerへ送信されるメッセージの定義
 */
export type WorkerMessage =
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'CONFIG'; config: Partial<AudioConfig> };

/**
 * Workerからメインスレッドへ送信されるメッセージの定義
 */
export type MainMessage =
  | {
      type: 'TICK';
      /** 現在の拍のインデックス（シーケンス内） */
      beatIndex: number;
      /** 発音予定のタイムスタンプ (AudioContext.currentTime) */
      time: number;
    };
