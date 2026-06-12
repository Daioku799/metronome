import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioEngineController } from './AudioEngineController';
import { AudioSynthesizer } from './AudioSynthesizer';
import { AccentLevel } from './types';

// AudioSynthesizerのモック
vi.mock('./AudioSynthesizer', () => {
  return {
    AudioSynthesizer: vi.fn().mockImplementation(() => {
      return {
        scheduleClick: vi.fn(),
        setMasterVolume: vi.fn(),
      };
    }),
  };
});

// Workerのモッククラス
class MockWorker {
  onmessage: ((ev: MessageEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}

// グローバルオブジェクトのモック
const mockWorkerInstance = new MockWorker();
vi.stubGlobal('Worker', vi.fn().mockImplementation(() => mockWorkerInstance));

const mockResume = vi.fn().mockResolvedValue(undefined);
class MockAudioContext {
  state = 'suspended';
  currentTime = 0;
  resume = mockResume;
  createGain = vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 0, setTargetAtTime: vi.fn() },
  }));
  destination = {};
}
vi.stubGlobal('AudioContext', MockAudioContext);

describe('AudioEngineController', () => {
  let controller: AudioEngineController;

  beforeEach(() => {
    vi.clearAllMocks();
    // 各テストで新しいコントローラーを作成（モックインスタンスは共有される）
    controller = new AudioEngineController();
  });

  it('初期化時にAudioContext, Synthesizer, Workerが作成されること', () => {
    expect(AudioSynthesizer).toHaveBeenCalled();
    expect(global.Worker).toHaveBeenCalled();
  });

  it('start() 呼び出し時に AudioContext が resume され、Worker に START メッセージが送信されること', () => {
    controller.start();
    
    // AudioContext.resume が呼ばれたか
    expect(mockResume).toHaveBeenCalled();
    
    // Worker.postMessage が正しい引数で呼ばれたか
    expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
      type: 'START',
      startTime: 0,
    });
  });

  it('stop() 呼び出し時に Worker に STOP メッセージが送信されること', () => {
    controller.stop();
    expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
      type: 'STOP',
    });
  });

  it('setTempo() 呼び出し時に Worker に CONFIG メッセージが送信されること', () => {
    controller.setTempo(140);
    expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
      type: 'CONFIG',
      config: { bpm: 140 },
    });
  });

  it('setMeter() 呼び出し時に Worker に CONFIG メッセージが送信されること', () => {
    const accents: AccentLevel[] = ['strong', 'weak', 'medium', 'weak'];
    controller.setMeter(accents);
    expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
      type: 'CONFIG',
      config: { accents },
    });
  });

  it('setVolume() 呼び出し時に synthesizer.setMasterVolume が呼ばれること', () => {
    const synthInstance = vi.mocked(AudioSynthesizer).mock.results[0].value;
    controller.setVolume(0.7);
    expect(synthInstance.setMasterVolume).toHaveBeenCalledWith(0.7);
  });

  it('Worker から TICK メッセージを受信したときに、音声をスケジュールしコールバックを実行すること', () => {
    const synthInstance = vi.mocked(AudioSynthesizer).mock.results[0].value;
    const tickCallback = vi.fn();
    controller.onTick(tickCallback);

    // Worker からのメッセージをシミュレート
    if (mockWorkerInstance.onmessage) {
      mockWorkerInstance.onmessage({
        data: {
          type: 'TICK',
          beatIndex: 2,
          time: 1.5,
          accent: 'medium',
        },
      } as MessageEvent);
    }

    // Synthesizer が呼ばれたか
    expect(synthInstance.scheduleClick).toHaveBeenCalledWith(1.5, 'medium');
    // コールバックが呼ばれたか
    expect(tickCallback).toHaveBeenCalledWith(2);
  });

  it('offTick() でコールバックが解除されること', () => {
    const tickCallback = vi.fn();
    controller.onTick(tickCallback);
    controller.offTick(tickCallback);

    // Worker からのメッセージをシミュレート
    if (mockWorkerInstance.onmessage) {
      mockWorkerInstance.onmessage({
        data: {
          type: 'TICK',
          beatIndex: 0,
          time: 1.0,
          accent: 'strong',
        },
      } as MessageEvent);
    }

    expect(tickCallback).not.toHaveBeenCalled();
  });

  describe('Complex Scenarios (Integration-like)', () => {
    it('should handle rapid meter changes and reflect in Worker messages', () => {
      controller.setMeter(['strong', 'weak']);
      expect(mockWorkerInstance.postMessage).toHaveBeenLastCalledWith({
        type: 'CONFIG',
        config: { accents: ['strong', 'weak'] },
      });

      controller.setMeter(['strong', 'medium', 'weak']);
      expect(mockWorkerInstance.postMessage).toHaveBeenLastCalledWith({
        type: 'CONFIG',
        config: { accents: ['strong', 'medium', 'weak'] },
      });
    });

    it('should handle real-time tempo changes', () => {
      controller.setTempo(60);
      expect(mockWorkerInstance.postMessage).toHaveBeenLastCalledWith({
        type: 'CONFIG',
        config: { bpm: 60 },
      });

      controller.setTempo(200);
      expect(mockWorkerInstance.postMessage).toHaveBeenLastCalledWith({
        type: 'CONFIG',
        config: { bpm: 200 },
      });
    });

    it('should correctly sequence multiple TICK messages with different accents', () => {
      const synthInstance = vi.mocked(AudioSynthesizer).mock.results[0].value;
      const tickCallback = vi.fn();
      controller.onTick(tickCallback);

      const ticks = [
        { beatIndex: 0, time: 1.0, accent: 'strong' as const },
        { beatIndex: 1, time: 1.5, accent: 'none' as const },
        { beatIndex: 2, time: 2.0, accent: 'medium' as const },
        { beatIndex: 3, time: 2.5, accent: 'weak' as const },
      ];

      ticks.forEach((tick, i) => {
        if (mockWorkerInstance.onmessage) {
          mockWorkerInstance.onmessage({
            data: {
              type: 'TICK',
              ...tick
            },
          } as MessageEvent);
        }
        expect(synthInstance.scheduleClick).toHaveBeenNthCalledWith(i + 1, tick.time, tick.accent);
        expect(tickCallback).toHaveBeenNthCalledWith(i + 1, tick.beatIndex);
      });
    });
  });
});
