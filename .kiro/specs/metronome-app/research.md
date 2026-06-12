# Research & Design Decisions: metronome-app

## Summary
- **Feature**: metronome-app
- **Discovery Scope**: Complex Integration
- **Key Findings**:
  - `audio-engine` と `meter-editor` のインターフェースの不整合（アクセント情報の扱い）を吸収するブリッジが必要。
  - LocalStorage を用いた状態の永続化により、ユーザー体験を向上させる。
  - 高精度なタップテンポ計算ロジックの実装。

## Research Log

### インターフェースの統合
- **Context**: `meter-editor` が出力する `MeterConfig` と `audio-engine` が要求する `number[]` (グループサイズ) の変換が必要。
- **Findings**: 
  - `groupIndices` から各グループの長さを計算可能。
  - 例: `groupIndices: [2, 5]`, total: 7 -> `[2, 3, 2]`
  - 現在の `audio-engine` デザインでは個別の拍のアクセント指定が限定的なため、アプリ側でデフォルトのアクセント（各グループの先頭を強拍）を適用するか、エンジンのインターフェース拡張を検討する。
- **Implications**: アプリ層に変換ロジック（`configToEngineMeter`）を配置する。

### 永続化戦略
- **Context**: ユーザーの設定をブラウザを閉じても維持したい。
- **Sources Consulted**: MDN LocalStorage API
- **Findings**: JSON.stringify を用いてオブジェクトとして保存。`useEffect` で変更時に保存し、マウント時に復元する。
- **Implications**: 起動時に不正なデータがあった場合のバリデーション（デフォルト値へのフォールバック）が必要。

## Design Decisions

### Decision: 状態管理の局所化（State Lifting）
- **Context**: エンジンとエディター間でデータを共有し、同期させる必要がある。
- **Selected Approach**: Reactのトップレベルコンポーネント（App）ですべての状態を一元管理する。
- **Rationale**: データの流れを単方向（State -> Engine / UI）に保つことで、デバッグが容易になり、不整合を防げる。
- **Trade-offs**: コンポーネントが肥大化する可能性があるため、ロジックを Custom Hook (`useMetronome`) に切り出す。

### Decision: タップテンポ計算アルゴリズム
- **Context**: 直感的なテンポ設定のため。
- **Selected Approach**: 直近4回分のタップ間隔を記録し、その移動平均からBPMを算出する。
- **Rationale**: 1回だけの誤差を吸収しつつ、ユーザーの意図に素早く追従できる。
- **Trade-offs**: タップ間隔が2秒以上空いた場合はリセットする。

## Risks & Mitigations
- **localStorageの容量制限/破損** — 読み込み失敗時はデフォルト設定（BPM 120, 4/4）にフォールバックする。
- **UI再描画による音声への影響** — `audio-engine` が Web Worker で動作するため、メインスレッドのUI更新（ハイライト表示など）による音声の遅延リスクは低い。
