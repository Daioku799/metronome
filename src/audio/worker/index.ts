import { WorkerMessage, MainMessage } from '../types';
import { BeatScheduler } from './BeatScheduler';

/**
 * Workerの状態管理
 */
const scheduler = new BeatScheduler();
let timerId: number | null = null;

// スケジューリング設定
const LOOK_AHEAD = 0.1; // 100ms先までスケジュールする
const CHECK_INTERVAL = 25; // 25msごとにチェックする

// 時間同期用の変数
let audioContextStartTime = 0;
let workerStartTime = 0;

/**
 * 現在の推定 AudioContext.currentTime を取得する
 */
function getCurrentAudioTime(): number {
  const elapsed = (performance.now() - workerStartTime) / 1000;
  return audioContextStartTime + elapsed;
}

/**
 * スケジューリングループのメイン処理
 */
function tick() {
  const currentTime = getCurrentAudioTime();
  
  // Look-ahead 期間内に収まる全ての拍をスケジュールする
  while (scheduler.nextScheduleTime < currentTime + LOOK_AHEAD) {
    const info = scheduler.getNextBeatInfo();
    const message: MainMessage = {
      type: 'TICK',
      beatIndex: info.index,
      time: info.time,
      accent: info.accent,
    };
    self.postMessage(message);
  }
}

/**
 * メインスレッドからのメッセージ受信
 */
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  switch (message.type) {
    case 'START':
      if (timerId !== null) {
        console.warn('[AudioWorker] Already running');
        return;
      }
      
      console.log('[AudioWorker] Starting scheduling loop');
      audioContextStartTime = message.startTime;
      workerStartTime = performance.now();
      
      // スケジューラーをリセットし、初回の拍を startTime に合わせる
      scheduler.reset(audioContextStartTime);
      
      // インターバルタイマーの開始
      timerId = self.setInterval(tick, CHECK_INTERVAL) as unknown as number;
      
      // 初回実行（Look-aheadにより即座に最初の数拍がスケジュールされる）
      tick();
      break;

    case 'STOP':
      if (timerId !== null) {
        console.log('[AudioWorker] Stopping scheduling loop');
        self.clearInterval(timerId);
        timerId = null;
      }
      break;

    case 'CONFIG':
      console.log('[AudioWorker] Updating configuration', message.config);
      scheduler.updateConfig(message.config);
      break;

    default:
      console.warn('[AudioWorker] Unknown message type:', (message as any).type);
  }
};
