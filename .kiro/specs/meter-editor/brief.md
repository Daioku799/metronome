# Brief: meter-editor

## Problem
「7/8」や「2+3+2」といった複雑な拍子を数値入力だけで設定するのは直感的ではない。

## Current State
新規開発。ユーザーがリズムを「触って」作れるUIが必要。

## Desired Outcome
画面上のビートをタップしてグループ化したり、各ビートのアクセント強度を視覚的に切り替えたりできる直感的なエディタ。

## Approach
CSS Gridを用いた動的なグリッドUI。各ビートを「セル」として扱い、クリックやドラッグ操作で状態を変更する。

## Scope
- **In**:
  - ビートの動的な追加・削除
  - ビートのグループ化（混合拍子の区切り設定）
  - 各ビートのアクセントレベル（強・中・弱・無）のトグル機能
  - エディタの状態をJSON/配列形式で出力
- **Out**:
  - 実際の音声再生
  - テンポの設定

## Boundary Candidates
- ビートセルのコンポーネント
- グループ管理ロジック

## Out of Boundary
- 保存機能自体（metronome-appが担当）

## Upstream / Downstream
- **Upstream**: なし
- **Downstream**: metronome-app

## Existing Spec Touchpoints
- なし

## Constraints
- React / TailwindCSS (または Vanilla CSS)
