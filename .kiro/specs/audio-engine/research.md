# Research & Design Decisions

## Summary
- **Feature**: audio-engine
- **Discovery Scope**: New Feature
- **Key Findings**:
  - Web Audio APIの `currentTime` と `setInterval` (または `setTimeout`) の組み合わせによる「Look-ahead」方式が、ブラウザで高精度なリズムを実現するための標準的なパターンである。
  - メインスレッドの `setInterval` は描画負荷やタブのバックグラウンド化により大幅に遅延するため、タイミング制御には Web Worker が不可欠である。
  - 混合拍子の管理は、拍のグループ（[2, 3, 2]等）を状態として持ち、各クリック時にインデックスを進めるシンプルなステートマシンで実現可能。

## Research Log

### タイミング精度の確保
- **Context**: メトロノームにおいてリズムの揺れ（ジッター）は致命的である。
- **Sources Consulted**: "A Tale of Two Clocks" (Chris Wilson), MDN Web Audio API docs.
- **Findings**: 
  - `AudioContext.currentTime` は高精度なハードウェアクロックに同期している。
  - `AudioContext` のメソッド（`start(time)`) に未来の時間を指定することで、サンプル単位の精度で発音をスケジュールできる。
  - スケジューリングを行うループの間隔（Look-ahead）と、スケジュールの対象期間（Schedule Window）を適切に設定することで、スレッドの揺れを吸収できる。
- **Implications**: Web Worker内で25ms間隔のループを回し、常に100ms先までの音をスケジュールする設計を採用する。

### 混合拍子のデータ構造
- **Context**: 複雑な混合拍子を柔軟に扱う必要がある。
- **Findings**: 
  - 単純な [2, 3, 2] という数値の配列だけでなく、各拍が「強・中・弱」のいずれのアクセントを持つべきかのメタデータが必要。
- **Implications**: `[ { beats: 2, accent: 'High' }, { beats: 3, accent: 'Mid' }, ... ]` のような構造、あるいはフラットな `Accent[]` 配列を生成してループさせる方式を検討。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Web Worker + Web Audio | タイミング制御をWorker、音声出力をMain threadのAudioContextで行う | メインスレッドの負荷に強い。標準的。 | メインスレッドとWorker間の通信レイテンシ。 | 今回採用する。 |
| AudioWorklet | 音声処理スレッド内で直接タイミング制御を行う | 理論上最高の精度。 | 実装が複雑。パラメータ変更の同期が難しい。 | 将来的な拡張性として残すが、今回は見送り。 |

## Design Decisions

### Decision: Look-ahead Scheduling
- **Context**: リズムの安定性確保。
- **Selected Approach**: Web Worker内でのスケジューリングループ。
- **Rationale**: メインスレッドの描画（React）の影響を完全に排除するため。
- **Trade-offs**: Workerファイルの管理と、初期化時のメッセージ通信が必要。

### Decision: Oscillator-based Synthesis
- **Context**: クリック音の生成方法。
- **Selected Approach**: `OscillatorNode` を用いた動的な音声合成。
- **Rationale**: 外部音声ファイルの読み込みが不要で、周波数を変えるだけでアクセント（強・中・弱）を容易に表現できるため。
- **Trade-offs**: サンプリング音に比べると機械的な音になるが、メトロノームとしては許容範囲。

## Risks & Mitigations
- AudioContextのオートプレイ制限 — ユーザーの最初の操作（Startボタンクリック等）で `resume()` を呼び出す。
- Workerのファイルパス解決 — Vite等のビルドツールに適した `new Worker(new URL(...))` 構文を使用する。
