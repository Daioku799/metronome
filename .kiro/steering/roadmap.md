# Roadmap

## Overview
高精度なWeb Audioエンジンと、視覚的な混合拍子エディタを組み合わせた、プロ仕様のメトロノームアプリを構築します。Web Workerによる安定したタイミングと、直感的なUI操作を両立させることが目標です。

## Approach Decision
- **Chosen**: モジュール分割アプローチ (Web Worker + React + CSS Grid)
- **Why**: メトロノームにおいて最も重要な「リズムの正確性」を担保しつつ、複雑な混合拍子を柔軟に扱える拡張性を持たせるため。
- **Rejected alternatives**: シングル・スライス（Tone.js依存）。高度なUIアニメーション時のリズムの揺れを懸念し、今回は見送りました。

## Scope
- **In**:
  - Web Workerによる高精度タイミング（Look-aheadスケジュール方式）
  - 視覚的な混合拍子作成UI（ビートのグループ化、アクセント設定）
  - タップテンポ機能
  - LocalStorageによる設定の自動保存
- **Out**:
  - 複雑なDAW機能（多重録音など）
  - オンライン共有機能（今回はローカル保存のみ）

## Constraints
- Web Audio API をサポートするモダンブラウザ
- TypeScript + React による実装
- 音声合成には軽量なOscillatorまたはプリロードされたクリック音を使用

## Boundary Strategy
- **Why this split**: 音声エンジンとUIを完全に分離することで、UIの再描画が音声タイミングに影響を与えないようにします。
- **Shared seams to watch**: 音声エンジンからのティック（拍）の通知と、UI上のインジケーター表示の同期。

## Specs (dependency order)
- [x] audio-engine -- 高精度なリズム生成と混合拍子ロジックを司るコア。Dependencies: none
- [x] meter-editor -- 視覚的に拍を組み立て、アクセントを設定するインタラクティブUI。Dependencies: none
- [x] metronome-app -- 全体を統合し、テンポ制御、タップテンポ、保存機能を備えたシェル。Dependencies: audio-engine, meter-editor
