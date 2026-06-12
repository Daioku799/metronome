import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioSynthesizer } from './AudioSynthesizer';

// Web Audio API Mocks
class MockAudioNode {
  connect = vi.fn();
}

class MockGainNode extends MockAudioNode {
  gain = {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
  };
}

class MockOscillatorNode extends MockAudioNode {
  type = 'sine';
  frequency = {
    value: 440,
    setValueAtTime: vi.fn(),
  };
  start = vi.fn();
  stop = vi.fn();
}

class MockAudioContext {
  currentTime = 0;
  destination = new MockAudioNode();
  createGain = vi.fn(() => new MockGainNode());
  createOscillator = vi.fn(() => new MockOscillatorNode());
}

describe('AudioSynthesizer', () => {
  let ctx: AudioContext;
  let synth: AudioSynthesizer;

  beforeEach(() => {
    ctx = new MockAudioContext() as unknown as AudioContext;
    synth = new AudioSynthesizer(ctx);
  });

  describe('setMasterVolume', () => {
    it('should set volume within valid range [0, 1]', () => {
      const mockGainNode = (ctx.createGain() as unknown as MockGainNode);
      vi.mocked(ctx.createGain).mockReturnValue(mockGainNode as any);
      
      // Re-initialize to use the mocked gain node if necessary, 
      // but the constructor already called it once.
      // Let's just check the one created in beforeEach.
      const initialGainNode = vi.mocked(ctx.createGain).mock.results[0].value as MockGainNode;

      synth.setMasterVolume(0.8);
      expect(initialGainNode.gain.setTargetAtTime).toHaveBeenCalledWith(0.8, ctx.currentTime, 0.01);
    });

    it('should throw error if volume is less than 0', () => {
      expect(() => synth.setMasterVolume(-0.1)).toThrow('Volume must be between 0 and 1');
    });

    it('should throw error if volume is greater than 1', () => {
      expect(() => synth.setMasterVolume(1.1)).toThrow('Volume must be between 0 and 1');
    });
  });

  describe('scheduleClick', () => {
    it('should schedule a strong accent click (880Hz)', () => {
      const time = 1.0;
      synth.scheduleClick(time, 'strong');

      const osc = vi.mocked(ctx.createOscillator).mock.results[0].value as MockOscillatorNode;
      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(880, time);
      expect(osc.start).toHaveBeenCalledWith(time);
      expect(osc.stop).toHaveBeenCalledWith(time + 0.1);
    });

    it('should schedule a medium accent click (660Hz)', () => {
      const time = 1.0;
      synth.scheduleClick(time, 'medium');

      const osc = vi.mocked(ctx.createOscillator).mock.results[0].value as MockOscillatorNode;
      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(660, time);
    });

    it('should schedule a weak accent click (440Hz)', () => {
      const time = 1.0;
      synth.scheduleClick(time, 'weak');

      const osc = vi.mocked(ctx.createOscillator).mock.results[0].value as MockOscillatorNode;
      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(440, time);
    });

    it('should not schedule anything for accent "none"', () => {
      synth.scheduleClick(1.0, 'none');
      expect(ctx.createOscillator).not.toHaveBeenCalled();
    });
  });
});
