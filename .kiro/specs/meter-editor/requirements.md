# Requirements Document

## Introduction
本ドキュメントは、複雑な混合拍子を視覚的に編集するための「meter-editor」コンポーネントの要件を定義する。ユーザーはビートを直接操作することで、拍の追加・削除、アクセントの設定、および拍のグループ化を直感的に行うことができる。

## Boundary Context
- **In scope**:
  - ビートの動的な追加および削除機能
  - 各ビートのアクセントレベル ('strong', 'medium', 'weak', 'none') のトグル切り替え
  - ビート間の境界設定によるグループ化機能（混合拍子の表現）
  - 現在のメーター設定（各ビートのアクセントレベルの平坦な配列、およびグループ情報）の出力
- **Out of scope**:
  - 音声エンジンの制御および実際のクリック音の再生
  - テンポ（BPM）の設定および管理
  - メーター設定の永続化（LocalStorageへの保存などは上位コンポーネントが担当）
- **Adjacent expectations**:
  - `metronome-app` が本コンポーネントからの出力を受け取り、`audio-engine` の `setMeter` インターフェースに反映することを期待する。

## Requirements

### Requirement 1: ビート構成の管理
**Objective:** ユーザーとして、リズムの長さを自由に変更するためにビートを追加または削除したい。

#### Acceptance Criteria
1. When ユーザーが「ビート追加」操作を行った時、the Meter Editor shall シーケンスの末尾にデフォルト状態の新しいビートセルを追加する。
2. When ユーザーが特定のビートセルに対して「削除」操作を行った時、the Meter Editor shall そのビートセルをシーケンスから取り除く。
3. The Meter Editor shall 少なくとも1つのビートが常に存在することを保証し、最後の1つのビートは削除できないようにする。

### Requirement 2: アクセントの設定
**Objective:** ユーザーとして、各拍の強弱を視覚的に設定することで、リズムのニュアンスを定義したい。

#### Acceptance Criteria
1. When ユーザーがビートセルをクリックした時、the Meter Editor shall そのセルのアクセントレベルを 'strong' → 'medium' → 'weak' → 'none' の順でサイクル的に切り替える。
2. The Meter Editor shall 各セルのアクセントレベル ('strong', 'medium', 'weak', 'none') を視覚的に区別できる状態で表示する。

### Requirement 3: ビートのグループ化
**Objective:** ユーザーとして、複数のビートをグループに分けることで（例：2+3+2）、複雑な混合拍子を構造化したい。

#### Acceptance Criteria
1. When ユーザーが隣接する2つのビートセルの境界をクリックした時、the Meter Editor shall その位置のグループ区切り（セパレーター）の有無をトグルする。
2. The Meter Editor shall グループ区切りが設定された位置を視覚的な境界線として表示する。

### Requirement 4: メーター状態の外部連携
**Objective:** ユーザーとして、編集したリズムをメトロノーム機能に反映させるために、設定情報を出力したい。

#### Acceptance Criteria
1. The Meter Editor shall 現在のメーター構成（各ビートのアクセントレベル 'strong' | 'medium' | 'weak' | 'none' の平坦な配列）を、`audio-engine` が直接消費可能な形式で提供する。
2. When 内部状態が変更された時、the Meter Editor shall 変更後のメーター情報を即座に通知または更新する。
