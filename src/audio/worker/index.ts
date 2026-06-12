import { WorkerMessage } from '../types';

/**
 * Workerのエントリポイント
 * メインスレッドからのコマンドを受信し、ログを出力する
 */
console.log('[AudioWorker] Worker script loaded');

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;
  console.log('[AudioWorker] Message received:', message);

  switch (message.type) {
    case 'START':
      console.log('[AudioWorker] Start scheduling');
      break;
    case 'STOP':
      console.log('[AudioWorker] Stop scheduling');
      break;
    case 'CONFIG':
      console.log('[AudioWorker] Update configuration', message.config);
      break;
    default:
      console.warn('[AudioWorker] Unknown message type:', (message as any).type);
  }
};

// 生存確認用の初期メッセージ（オプション）
// postMessage({ type: 'TICK', beatIndex: -1, time: 0 });
