import { describe, it, expect, beforeEach } from 'vitest';
import { BeatScheduler } from './BeatScheduler';

describe('BeatScheduler', () => {
  let scheduler: BeatScheduler;

  beforeEach(() => {
    scheduler = new BeatScheduler({
      bpm: 120,
      accents: ['strong', 'weak', 'weak', 'weak']
    });
  });

  it('should initialize with provided config', () => {
    // We can indirectly check this via getNextBeatInfo
    scheduler.reset(1.0);
    const info = scheduler.getNextBeatInfo();
    expect(info.time).toBe(1.0);
    expect(info.accent).toBe('strong');
    expect(info.index).toBe(0);
  });

  it('should calculate next beat time correctly based on BPM', () => {
    // 120 BPM = 0.5 seconds per beat
    scheduler.reset(0.0);
    
    const beat1 = scheduler.getNextBeatInfo();
    expect(beat1.time).toBe(0.0);
    
    const beat2 = scheduler.getNextBeatInfo();
    expect(beat2.time).toBe(0.5);
    
    const beat3 = scheduler.getNextBeatInfo();
    expect(beat3.time).toBe(1.0);
  });

  it('should cycle through accent sequence', () => {
    scheduler.updateConfig({ accents: ['strong', 'medium', 'weak'] });
    scheduler.reset(0.0);

    expect(scheduler.getNextBeatInfo().accent).toBe('strong');
    expect(scheduler.getNextBeatInfo().accent).toBe('medium');
    expect(scheduler.getNextBeatInfo().accent).toBe('weak');
    expect(scheduler.getNextBeatInfo().accent).toBe('strong'); // Cycle back
  });

  it('should reset to index 0 and specified start time', () => {
    scheduler.reset(0.0);
    scheduler.getNextBeatInfo();
    scheduler.getNextBeatInfo();
    
    scheduler.reset(5.0);
    const info = scheduler.getNextBeatInfo();
    expect(info.index).toBe(0);
    expect(info.time).toBe(5.0);
  });

  it('should update BPM correctly', () => {
    scheduler.updateConfig({ bpm: 60 }); // 1.0 second per beat
    scheduler.reset(0.0);
    
    scheduler.getNextBeatInfo();
    const info = scheduler.getNextBeatInfo();
    expect(info.time).toBe(1.0);
  });

  it('should handle accent sequence updates', () => {
    scheduler.reset(0.0);
    scheduler.getNextBeatInfo(); // index 0 -> 1
    
    // Change sequence to a shorter one
    scheduler.updateConfig({ accents: ['strong'] });
    
    const info = scheduler.getNextBeatInfo();
    expect(info.index).toBe(0); // Should have reset index to 0 because 1 was out of bounds
  });

  it('should expose nextScheduleTime correctly', () => {
    scheduler.reset(10.0);
    expect(scheduler.nextScheduleTime).toBe(10.0);
    
    scheduler.getNextBeatInfo(); // 120 BPM -> +0.5s
    expect(scheduler.nextScheduleTime).toBe(10.5);
  });
});
