import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Worker のテストは、グローバルな `self` や `postMessage` をモックして行います。
 */
describe('Worker Scheduling Loop', () => {
  let postMessageSpy: any;
  let setIntervalSpy: any;
  let clearIntervalSpy: any;
  let onMessageCallback: ((ev: any) => void) | null = null;

  beforeEach(async () => {
    postMessageSpy = vi.fn();
    setIntervalSpy = vi.spyOn(global, 'setInterval');
    clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    vi.stubGlobal('postMessage', postMessageSpy);
    vi.stubGlobal('performance', { now: vi.fn(() => 1000) });
    vi.stubGlobal('self', {
      postMessage: postMessageSpy,
      setInterval: setIntervalSpy,
      clearInterval: clearIntervalSpy,
      set onmessage(cb: any) {
        onMessageCallback = cb;
      },
      get onmessage() {
        return onMessageCallback;
      }
    });

    vi.resetModules();
    // ワーカースクリプトを動的にインポートして実行
    await import('./index');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    onMessageCallback = null;
  });

  it('should start scheduling loop when receiving START message', () => {
    if (!onMessageCallback) throw new Error('onmessage not set');

    const startTime = 10.0;
    onMessageCallback({ data: { type: 'START', startTime } });

    expect(setIntervalSpy).toHaveBeenCalled();
    // LOOK_AHEAD が 100ms なので、120BPM (0.5s間隔) の場合、
    // 最初の tick で startTime の拍が postMessage されるはず
    expect(postMessageSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: 'TICK',
      time: 10.0,
      beatIndex: 0
    }));
  });

  it('should stop scheduling loop when receiving STOP message', () => {
    if (!onMessageCallback) throw new Error('onmessage not set');

    onMessageCallback({ data: { type: 'START', startTime: 0 } });
    const timerId = setIntervalSpy.mock.results[0].value;

    onMessageCallback({ data: { type: 'STOP' } });
    expect(clearIntervalSpy).toHaveBeenCalledWith(timerId);
  });

  it('should update configuration when receiving CONFIG message', () => {
    if (!onMessageCallback) throw new Error('onmessage not set');

    // 最初に START
    onMessageCallback({ data: { type: 'START', startTime: 0 } });
    postMessageSpy.mockClear();

    // BPMを大幅に上げて、次の tick で大量の TICK が飛ぶようにする（またはロジックを確認）
    // ここでは単に updateConfig が呼ばれるルートを通ることを確認
    onMessageCallback({ data: { type: 'CONFIG', config: { bpm: 240 } } });
    
    // 手動で tick を叩くことはできないが、onmessage の処理が正常終了することを確認
  });
});
