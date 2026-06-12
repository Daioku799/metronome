# Requirements Document

## Introduction
この仕様書は、高精度音声エンジン（audio-engine）とメーターエディター（meter-editor）を統合した「Metronome App」の要件を定義します。ユーザーは直感的なUIを通じて複雑なリズムを構成し、正確なタイミングで再生・保存することができます。

## Boundary Context
- **In scope**:
  - アプリケーション全体のレイアウト構成
  - テンポ制御（スライダー、数値入力、タップテンポ）
  - 再生/停止の制御と視覚的フィードバック
  - LocalStorageを用いた設定の永続化
  - 音声エンジンとエディター間のデータ同期
- **Out of scope**:
  - 音声信号処理の詳細（audio-engineが担当）
  - 複雑なビート編集UIの詳細（meter-editorが担当）
- **Adjacent expectations**:
  - `audio-engine` はメインスレッドからの指示に応じて正確なタイミングでクリック音を生成し、拍（tick）を通知すること。
  - `meter-editor` はユーザーの操作に応じたメーター構成データ（AccentLevel[], groupIndices[]）を外部へ提供すること。

## Requirements

### Requirement 1: ユーザーインターフェースの統合
**Objective:** ユーザーがすべての機能に1つの画面からアクセスできるようにするため、全体的なレイアウトを提供する。

#### Acceptance Criteria
1. The Metronome App shall メーターエディターと再生コントロールを単一のビューに表示する。
2. When アプリケーションが起動した時, the Metronome App shall 音声エンジンを初期化する。

### Requirement 2: テンポ制御機能
**Objective:** ユーザーが望むテンポを正確かつ直感的に設定できるようにする。

#### Acceptance Criteria
1. The Metronome App shall 40から300 BPMの間でテンポを調整可能にする。
2. When ユーザーがBPMスライダーを操作した時, the Metronome App shall 音声エンジンのテンポを更新する。
3. When ユーザーがタップテンポボタンを3回以上連続でクリックした時, the Metronome App shall 平均BPMを計算し、システムのテンポを更新する。

### Requirement 3: 再生制御機能
**Objective:** メトロノームの動作を開始・停止できるようにし、動作状況を視覚的に伝える。

#### Acceptance Criteria
1. When ユーザーが開始ボタンをクリックした時, the Metronome App shall 音声エンジンの再生を開始する。
2. While アプリケーションが動作している間, the Metronome App shall 開始ボタンのラベルを「停止」に変更する。
3. When ユーザーが停止ボタンをクリックした時, the Metronome App shall 音声エンジンの再生を停止する。
4. When 音声エンジンから拍（tick）が通知された時, the Metronome App shall メーターエディター上の対応する拍を強調表示（ハイライト）する。

### Requirement 4: 設定の永続化
**Objective:** アプリケーションを再起動しても、前回の設定（BPM、メーター構成、音量など）を維持できるようにする。

#### Acceptance Criteria
1. When いずれかの設定（BPM、メーター構成、音量）が変更された時, the Metronome App shall その状態をLocalStorageに保存する。
2. When アプリケーションが起動した時, the Metronome App shall LocalStorageから保存された状態を読み込む。
3. If LocalStorageに保存された状態が存在しない場合, the Metronome App shall デフォルト設定（BPM 120, 4/4拍子）を適用する。

### Requirement 5: データ同期
**Objective:** メーターエディターでの変更が音声に即座に反映されるようにする。

#### Acceptance Criteria
1. When ユーザーがメーターエディターで構成を変更した時, the Metronome App shall 音声エンジンのメーター構成設定を更新する。
