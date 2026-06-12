# Research & Design Decisions: meter-editor

## Summary
- **Feature**: meter-editor
- **Discovery Scope**: New Feature (Greenfield)
- **Key Findings**:
  - CSS Gridを用いることで、可変長のビート（1拍〜32拍程度）を柔軟にレイアウト可能。
  - 混合拍子（例：2+3+2）を表現するために、ビート間の境界（セパレーター）を独立したインタラクティブ要素として実装するのが有効。
  - アクセントレベルの状態管理は、単純な文字列列挙型（enum相当）の配列で管理するのが最もシンプルかつ堅牢。

## Research Log

### CSS Gridを用いた可変レイアウト
- **Context**: ユーザーがビートを追加・削除した際に、UIが崩れずに整列する必要がある。
- **Sources Consulted**: MDN Web Docs (CSS Grid), Tailwind CSS documentation.
- **Findings**: `grid-template-columns: repeat(N, minmax(0, 1fr))` を使用することで、親コンテナの幅に合わせて各ビートセルが均等にリサイズされる。
- **Implications**: コンポーネントのインラインスタイルまたは動的なクラス割り当てが必要。

### インタラクティブな境界（グループ化）の実装
- **Context**: ビート間をクリックしてグループを分ける操作をどう実現するか。
- **Findings**: ビートセル自体のクリックと、境界線のクリックを分ける必要がある。セパレーターを絶対配置またはグリッドの隙間（gap）を利用して配置し、クリック判定領域を広めに持たせる。
- **Implications**: ビートセルとセパレーターが交互に並ぶようなデータ構造またはUI構築が必要。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 集中状態管理 | `MeterEditor` が全ての状態（beats, groups）を持ち、子に渡す | データの一貫性が保ちやすい、外部出力が容易 | プロップスバケツが発生する可能性がある | 小規模コンポーネントなのでこれが最適 |

## Design Decisions

### Decision: データ構造の定義
- **Context**: メーターの状態をどのように保持し、外部に渡すか。
- **Selected Approach**: `beats`（アクセントレベルの配列）と `groups`（区切り位置のインデックス配列）を分けたオブジェクト形式。
- **Rationale**: アクセントの変更とグループのトグルを独立して扱いやすいため。
- **Trade-offs**: 外部に出力する際、`metronome-app` が扱いやすい形式に正規化する必要がある。

### Decision: セパレーターのUI実装
- **Context**: 境界線をクリックしやすくする工夫。
- **Selected Approach**: ビートセル間の `gap` 領域に透明なクリック可能エリアを配置し、有効な場合のみ視覚的な線を表示する。
- **Rationale**: ビートセルのクリック領域を邪魔せず、かつ境界を狙いやすくするため。

## Risks & Mitigations
- 大量ビート（32拍以上など）での視認性低下 — スクロール対応または折り返しルールの検討。
- モバイル操作時のセパレーターの押しにくさ — クリック領域（padding）の拡大。

## References
- [React State Management](https://react.dev/learn/managing-state)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
