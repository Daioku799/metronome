# Requirements Document

## Introduction
このドキュメントは、メトロノームアプリの核となるオーディオエンジンの要件を定義します。このエンジンは、UIの負荷に左右されず、常に正確なタイミングで音声を再生することを目的としています。

## Boundary Context (Optional)
- **In scope**:
  - Web Workerによるスケジューリングロジック
  - Web Audio APIを用いたクリック音の生成
  - 混合拍子のシーケンス管理
  - メインスレッドからのコマンド（開始、停止、テンポ変更等）の受理
- **Out of scope**:
  - UIコンポーネントの実装
  - 設定の永続化（LocalStorage等）
  - 高度な音声編集機能
- **Adjacent expectations**:
  - メインスレッド（App Shell）から正確なテンポおよび拍子設定が渡されること

## Requirements

### Requirement 1: 高精度なリズム生成
**Objective:** ユーザーとして、UIの操作中であってもリズムが揺れないメトロノームを使用したい。

#### Acceptance Criteria
1. The Audio Engine shall generate audio clicks with sample-level precision.
2. While the metronome is running, the Audio Engine shall schedule click events at least 25ms ahead of the current time to prevent jitter.
3. When the browser main thread is under heavy load, the Audio Engine shall maintain a consistent tempo without audible delays.

### Requirement 2: 混合拍子のサポート
**Objective:** ユーザーとして、複雑なアクセント構成を持つ拍子を再生したい。

#### Acceptance Criteria
1. When a sequence of accent levels (e.g., ['strong', 'weak', 'medium', 'weak']) is provided, the Audio Engine shall cycle through these accents.
2. The Audio Engine shall reset the sequence to the first beat when the playback is restarted.
3. The Audio Engine shall allow real-time updates to the meter structure (accent array) without stopping the playback.

### Requirement 3: クリック音の音量・アクセント制御
**Objective:** ユーザーとして、拍の種類 ('strong', 'medium', 'weak', 'none') を音で区別したい。

#### Acceptance Criteria
1. The Audio Engine shall support four levels of accents: 'strong', 'medium', 'weak', and 'none' (silent).
2. When a click is scheduled, the Audio Engine shall apply the specified accent level to the oscillator frequency or gain.
3. The Audio Engine shall provide a master volume control that affects all click sounds equally.

### Requirement 4: メインスレッドとの通信インターフェース
**Objective:** 開発者として、メインスレッドから容易にオーディオエンジンを制御し、現在の状態を取得したい。

#### Acceptance Criteria
1. When a 'START' message is received, the Audio Engine shall begin the scheduling loop immediately.
2. When a 'STOP' message is received, the Audio Engine shall cease all audio generation and scheduling.
3. When a beat is played, the Audio Engine shall send a notification to the main thread containing the current beat index and timestamp.
4. When a 'TEMPO_CHANGE' message is received, the Audio Engine shall update the internal calculation for the next scheduled beat.

