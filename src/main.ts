import { AudioEngineController } from './audio/AudioEngineController';
import { AccentLevel } from './audio/types';

console.log('--- Metronome Audio Engine Demo ---');
console.log('Initializing AudioEngineController...');

const controller = new AudioEngineController();

// 7/8拍子の設定: [強, 弱, 中, 弱, 中, 弱, 弱]
const mixedMeter: AccentLevel[] = ['strong', 'weak', 'medium', 'weak', 'medium', 'weak', 'weak'];

controller.setMeter(mixedMeter);
controller.setTempo(140);
controller.setVolume(0.5);

controller.onTick((index) => {
  const accent = mixedMeter[index];
  console.log(`[Tick] Index: ${index}, Accent: ${accent}`);
});

console.log('Starting metronome in 3 seconds...');
console.log('Meter: 7/8 (Mixed)');
console.log('Tempo: 140 BPM');

setTimeout(() => {
  console.log('START!');
  controller.start();

  // 5秒後にテンポを上げるテスト
  setTimeout(() => {
    console.log('Increasing tempo to 200 BPM...');
    controller.setTempo(200);
  }, 5000);

  // 10秒後に停止するテスト
  setTimeout(() => {
    console.log('STOP!');
    controller.stop();
    console.log('Demo completed.');
  }, 10000);

}, 3000);

console.log('Instructions:');
console.log('1. Open your browser console.');
console.log('2. You should see "TICK" messages periodically.');
console.log('3. In a real browser environment, click anywhere on the page if audio doesn\'t start (AudioContext policy).');
