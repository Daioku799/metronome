# Brief: audio-engine

## Problem
ブラウザのメインスレッドは描画や他のスクリプトの影響で遅延が発生しやすく、メトロノームのリズムが不安定（ジッター）になる。

## Current State
新規開発。Web Audio APIを活用した安定したエンジンの雛形が必要。

## Desired Outcome
UIの負荷に関わらず、常に一定かつ正確なリズム（サンプル単位の精度）で混合拍子を再生できる。

## Approach
Web Workerで `setInterval` を回し、25msごとに `AudioContext.currentTime` を参照して未来のクリック音をスケジュールする「Look-ahead」方式を採用。

## Scope
- **In**:
  - Web Workerによるタイミング制御
  - 混合拍子のリスト（例: [2, 3, 2]）に基づくスケジューリング
  - 強拍・中拍・弱拍のクリック音生成
  - メインスレッドとの通信（Start/Stop/Tempo変更/Next beat通知）
- **Out**:
  - UIコンポーネント
  - データの永続化

## Boundary Candidates
- スケジューラロジック（Worker内）
- 音声合成/バッファ管理（AudioContext）

## Out of Boundary
- タップテンポの計算（app-shellが担当）

## Upstream / Downstream
- **Upstream**: なし
- **Downstream**: metronome-app

## Existing Spec Touchpoints
- なし

## Constraints
- Web Worker / Web Audio API の使用
