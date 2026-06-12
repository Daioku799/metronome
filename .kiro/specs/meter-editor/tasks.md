# Implementation Plan: meter-editor

## Tasks

- [x] 1. 基盤：プロジェクト構造と共通型の定義
- [x] 1.1 `src/components/meter-editor/` フォルダを作成し、アクセントレベルやメーター構成の基本型を定義する。
  - `AccentLevel` (enum/union) および `MeterConfig` 型の定義。
  - 期待される成果物：`types.ts` が作成され、型エラーがない状態でコンパイルが通ること。
  - _Requirements: 4.1_

- [ ] 2. コア：ビートセルの開発
- [x] 2.1 (P) 各ビートを表示し、アクセントレベルを視覚的に表現するコンポーネントを実装する。
  - アクセントレベル ('strong', 'medium', 'weak', 'none') に応じた色や形状のスタイリング（Tailwind CSS）。
  - 期待される成果物：指定されたアクセントレベルに基づいて `BeatCell` が正しく描画されること。
  - _Requirements: 2.2_
  - _Boundary: BeatCell_
- [ ] 2.2 (P) ビートをクリックした際にアクセントレベルが循環切り替えされる機能を実装する。
  - クリックイベントのハンドリング。
  - 「'strong' → 'medium' → 'weak' → 'none' → 'strong'」の遷移ロジックの実装。
  - 期待される成果物：ビートをクリックするたびにアクセントの状態が変更され、視覚的に反映されること。
  - _Requirements: 2.1_
  - _Boundary: BeatCell_

- [ ] 3. コア：グループセパレーターの開発
...