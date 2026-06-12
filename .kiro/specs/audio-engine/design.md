# Design Document: audio-engine

## Overview
この機能は、高精度なメトロノームのリズム生成を担うコアエンジンを提供します。Web Audio APIとWeb Workerを組み合わせた「Look-ahead」スケジューリング方式を採用し、UIの負荷やブラウザのタブの状態に左右されない安定したテンポを実現します。

### Goals
- メインスレッドの負荷に関わらず, ジッターのない正確なリズムを生成する。
- 混合拍子のアクセントシーケンス（例: ['strong', 'weak', 'medium', 'weak']）を正しく再生する。
- 強・中・弱・無音の4段階のアクセントを音色（周波数）やゲインで表現する。

### Non-Goals
- 音声ファイルのサンプリング再生（今回はOscillatorのみ）。
- 視覚的なメトロノームUI（別スペックにて定義）。

## Boundary Commitments

### This Spec Owns
- Web Workerによるタイミング制御ループ。
- Web Audio APIを用いたクリック音の動的合成。
- 拍の順序（シーケンス）の管理と計算。
- メインスレッドとのメッセージングプロトコル。

### Out of Boundary
- タップテンポの計算ロジック（メインスレッドが担当）。
- 拍子情報のLocalStorageへの保存。

### Allowed Dependencies
- ブラウザ標準API (Web Audio API, Web Worker)。
- TypeScript。

## Architecture

### Architecture Pattern & Boundary Map
```mermaid
graph LR
    MainThread[Main Thread] -- Command(Start/Stop/Config) --> Worker[Web Worker]
    Worker -- Tick Notification --> MainThread
    Worker -- Schedule Event --> AudioContext[AudioContext (Hardware)]
```

### Technology Stack

| Layer | Choice / Version | Role in Feature | Notes |
|-------|------------------|-----------------|-------|
| Logic | TypeScript | 型安全なエンジン実装 | |
| Timing | Web Worker | バックグラウンドでの安定したループ | |
| Audio | Web Audio API | 高精度な音声再生 | |

## File Structure Plan

### Directory Structure
```
src/
└── audio/
    ├── AudioEngineController.ts  # メインスレッド用Facade
    ├── types.ts                  # 共通型定義
    └── worker/
        ├── index.ts              # Workerエントリポイント
        ├── BeatScheduler.ts      # 拍の計算ロジック
        └── AudioSynthesizer.ts   # 音声合成（Oscillator）管理
```

## Requirements Traceability

| Requirement | Summary | Components | Interfaces |
|-------------|---------|------------|------------|
| 1.1 | サンプル精度の生成 | AudioSynthesizer | scheduleClick |
| 1.2 | 25ms Look-ahead | index (Worker) | setInterval |
| 1.3 | メインスレッド負荷耐性 | index (Worker) | Web Worker |
| 2.1 | 混合拍子のシーケンス再生 | BeatScheduler | getNextBeat |
| 2.2 | 再開時のリセット | BeatScheduler | reset |
| 2.3 | リアルタイム更新 | AudioEngineController | updateConfig |
| 3.1 | 4段階のアクセント | AudioSynthesizer | AccentLevel |
| 3.2 | 周波数/ゲインの適用 | AudioSynthesizer | node configuration |
| 3.3 | マスターボリューム | AudioSynthesizer | GainNode |
| 4.1 | STARTコマンド | AudioEngineController | postMessage |
| 4.2 | STOPコマンド | AudioEngineController | postMessage |
| 4.3 | 拍の通知 | index (Worker) | postMessage (TICK) |
| 4.4 | テンポ変更 | AudioEngineController | postMessage |

## Components and Interfaces

### [Main Thread]

#### AudioEngineController
- **Intent**: メインスレッドからWorkerを操作するためのインターフェース。
- **Requirements**: 2.3, 4.1, 4.2, 4.4
- **Contracts**: Service
- **Interface**:
```typescript
interface AudioEngineController {
  start(): void;
  stop(): void;
  setTempo(bpm: number): void;
  setMeter(accents: ('strong' | 'medium' | 'weak' | 'none')[]): void;
  setVolume(volume: number): void;
  onTick(callback: (beatIndex: number) => void): void;
}
```

### [Worker Thread]

#### BeatScheduler
- **Intent**: 次に再生すべき拍の種類とタイミングを計算する。
- **Requirements**: 2.1, 2.2
- **State Management**: 現在の拍シーケンス内のインデックスを保持。

#### AudioSynthesizer
- **Intent**: AudioContextを使用して実際に音を出す。
- **Requirements**: 3.1, 3.2, 3.3
- **Interface**:
```typescript
interface AudioSynthesizer {
  scheduleClick(time: number, accent: 'strong' | 'medium' | 'weak' | 'none'): void;
  setMasterVolume(value: number): void;
}
```

## Testing Strategy
- **Unit Tests**:
  - `BeatScheduler`: 異なる混合拍子設定でのインデックス遷移テスト。
  - `AudioEngineController`: Workerへの適切なメッセージ送信テスト。
- **Integration Tests**:
  - Workerを実際に起動し、メッセージの往復とAudioContextの動作確認（ブラウザ環境）。
