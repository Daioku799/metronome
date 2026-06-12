import { WorkerMessage } from './audio/types';

console.log('[Main] Initializing Audio Worker...');

// Web Workerのインスタンス化
const worker = new Worker(
  new URL('./audio/worker/index.ts', import.meta.url),
  { type: 'module' }
);

worker.onmessage = (event) => {
  console.log('[Main] Message from worker:', event.data);
};

// ワーカーへのメッセージ送信テスト
worker.postMessage({ type: 'START' } as WorkerMessage);

setTimeout(() => {
  worker.postMessage({
    type: 'CONFIG',
    config: { bpm: 120, volume: 0.8 }
  } as WorkerMessage);
}, 1000);

setTimeout(() => {
  worker.postMessage({ type: 'STOP' } as WorkerMessage);
}, 2000);
