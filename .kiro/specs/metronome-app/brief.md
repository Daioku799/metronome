# Brief: metronome-app

## Problem
個別のエンジンやエディタをまとめ、ユーザーが実際に使える「アプリケーション」として成立させる必要がある。

## Current State
新規開発。全体の統合が必要。

## Desired Outcome
テンポ調整、タップテンポ、開始/停止、設定の保存ができる完成されたメトロノームアプリ。

## Approach
Appシェルとして audio-engine と meter-editor を橋渡しし、ブラウザの LocalStorage を用いて状態を維持する。

## Scope
- **In**:
  - 全体のレイアウト構成
  - テンポ入力（数値入力、スライダー）
  - タップテンポボタンとロジック
  - 開始/停止ボタン
  - 設定の自動保存（LocalStorage）
  - エンジンとエディタのデータ同期
- **Out**:
  - 詳細な音声信号処理
  - 詳細なビートエディタUI

## Boundary Candidates
- 永続化ロジック
- タップテンポ計算

## Out of Boundary
- なし（最終統合レイヤー）

## Upstream / Downstream
- **Upstream**: audio-engine, meter-editor
- **Downstream**: なし

## Constraints
- LocalStorage API
