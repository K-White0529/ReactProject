# React学習ロードマップ - AIを活用した調子記録アプリ開発

## プロジェクト概要

### アプリケーション名
Mood Tracker（調子記録アプリ）

### 主な機能
- ユーザーが入力時点の調子を記録（体調、気分、やったこと）
- AIによる質問生成と10段階評価による自己分析
- 過去データの集計と傾向分析
- 気象データとの相関分析
- ダッシュボードでのデータ可視化
- パーソナライズされたアドバイス表示

### 技術スタック
- **フロントエンド**: React 18 + TypeScript + Vite
- **バックエンド**: Node.js + Express + TypeScript
- **データベース**: PostgreSQL（Supabase）
- **AI**: Google Gemini API
- **気象データ**: WeatherAPI
- **その他**: Axios（HTTP通信）、Chart.js（グラフ描画）
- **デプロイ**: Vercel（フロントエンド）、Render.com（バックエンド）

---

## Phase 1: 環境構築と基礎知識 ✅ **完了**（3/3ステップ、約135分）

### ステップ1-1: 開発環境構築 ✅ **完了**（45分）
- ✅ Node.jsとnpmのインストールと理解
- ✅ PostgreSQLのインストールと基本操作
- ✅ VSCodeの拡張機能設定
- ✅ Reactプロジェクトの作成（Vite使用）

**学習内容**
- Node.jsとnpmの役割
- パッケージマネージャーの概念
- PostgreSQLの基本操作（psql）
- Viteの特徴と利点

**完了日**: 2025年11月上旬

### ステップ1-2: React基礎 ✅ **完了**（45分）
- ✅ Reactの基本概念（コンポーネント、JSX、props、state）
- ✅ TypeScriptとReactの組み合わせ
- ✅ 関数コンポーネントとフック（useState, useEffect）
- ✅ 簡単なカウンターアプリの作成

**学習内容**
- コンポーネント指向の理解
- 宣言的UIの概念
- 状態管理（State）の基礎
- プロパティ（Props）の受け渡し
- ライフサイクルとuseEffect
- TypeScriptによる型安全性

**完了日**: 2025年11月上旬

### ステップ1-3: Node.js + Express基礎 ✅ **完了**（45分）
- ✅ Node.jsとExpressの基本概念
- ✅ TypeScriptでのバックエンド構築
- ✅ RESTful APIの設計思想
- ✅ PostgreSQLへの接続と基本的なクエリ実行

**学習内容**
- Expressフレームワークの基礎
- ミドルウェアの概念
- REST APIとHTTPメソッド
- CRUD操作の実装
- PostgreSQL接続プール
- 環境変数の管理
- エラーハンドリング

**完了日**: 2025年11月上旬

---

## Phase 2: 基本機能実装 ✅ **完了**（4/4ステップ、約180分）

### ステップ2-1: データベース設計 ✅ **完了**（45分）
- ✅ 調子記録アプリのテーブル設計
- ✅ 分析観点の検討と定義
- ✅ マイグレーションの概念と実装
- ✅ サンプルデータの投入

**学習内容**
- リレーショナルデータベースの設計原則
- 正規化の概念
- 外部キー制約
- インデックスの活用
- マイグレーション管理

**作成したテーブル**
- ✅ users（ユーザー情報）
- ✅ records（記録データ）
- ✅ analysis_categories（分析観点）
- ✅ analysis_questions（質問マスタ）
- ✅ analysis_answers（回答データ）
- ✅ weather_data（気象データ）
- ✅ advice_history（アドバイス履歴）

**完了日**: 2025年11月7日

### ステップ2-2: バックエンドAPI実装 ✅ **完了**（90分）
- ✅ ユーザー認証API（JWT認証）
- ✅ 記録データのCRUD API
- ✅ エラーハンドリングとバリデーション
- ✅ APIのテスト
- ✅ 統計情報取得API
- ✅ グラフデータ取得API（時間単位集約、平均値計算）

**学習内容**
- ルーティングの設計
- コントローラーとモデルの分離
- バリデーションライブラリの使用
- JWTによる認証
- APIドキュメントの作成

**実装したエンドポイント**
- ✅ POST /api/auth/register - ユーザー登録
- ✅ POST /api/auth/login - ログイン
- ✅ GET /api/auth/me - 現在のユーザー情報取得
- ✅ GET /api/records - 記録一覧取得
- ✅ GET /api/records/:id - 特定の記録取得
- ✅ POST /api/records - 記録作成
- ✅ PUT /api/records/:id - 記録更新
- ✅ DELETE /api/records/:id - 記録削除
- ✅ GET /api/records/stats - 統計情報取得
- ✅ GET /api/records/chart-data - グラフデータ取得
- ✅ GET /api/weather/current - 現在の気象データ取得
- ✅ GET /api/analysis/scores - 観点別平均スコア取得
- ✅ GET /api/analysis/trends - 観点別スコア遷移取得

**完了日**: 2025年11月13日

### ステップ2-3: フロントエンドとバックエンドの連携 ✅ **完了**（45分）
- ✅ Axiosを使ったHTTP通信
- ✅ 環境変数の管理
- ✅ CORS設定
- ✅ データの取得と表示
- ✅ 認証トークンの管理
- ✅ インターセプターの実装

**学習内容**
- Axiosインスタンスの作成
- インターセプターの活用
- エラーハンドリング
- ローディング状態の管理
- 環境ごとの設定切り替え

**完了日**: 2025年11月13日

---

## Phase 3: 主要機能実装 ✅ **完了**（5/5ステップ、約225分）

### ステップ3-1: 記録入力画面の実装 ✅ **完了**（45分）
- ✅ フォームの作成（体調、気分、やったこと）
- ✅ バリデーションとエラー表示
- ✅ データの送信と保存
- ✅ スライダーによる10段階評価入力
- ✅ 気象情報カードの表示

**学習内容**
- React Hook Formの使用
- フォームバリデーション
- カスタムフックの作成
- エラーメッセージの表示

**実装したコンポーネント**
- RecordForm.tsx
- RecordForm.css

**完了日**: 2025年11月13日

### ステップ3-2: 自己分析機能（質問と評価）✅ **完了**（45分）
- ✅ バックエンドAPI実装（質問取得、回答保存）
- ✅ 質問表示コンポーネントの作成
- ✅ 10段階評価の入力UI
- ✅ 評価データの保存機能
- ✅ データベース初期データ投入
- ✅ 動作確認テスト

**学習内容**
- 動的なフォーム生成
- スライダーコンポーネントの実装
- 複数ステップフォームの管理
- データの一時保存

**実装状況**
- バックエンド：完全実装
  - GET /api/analysis/categories
  - GET /api/analysis/questions
  - POST /api/analysis/answers
  - Analysis.ts（モデル）
  - 初期データ（5観点：ストレス、集中力、モチベーション、睡眠の質、社会的つながり）
- フロントエンド：完全実装
  - AnalysisForm.tsx（統合分析画面）
  - AnalysisForm.css（スタイリング）
  - analysisService.ts（API通信層）

**完了日**: 2025年11月14日

### ステップ3-3: ダッシュボード基礎 ✅ **完了**（45分）
- ✅ レイアウト設計（Layout, Sidebar実装）
- ✅ 複数パネルの配置（統計パネル、グラフ、最近の記録）
- ✅ レスポンシブデザインの実装
- ✅ データがない期間の空の状態表示

**学習内容**
- CSS Grid/Flexboxの活用
- レスポンシブブレークポイント
- コンテナコンポーネントの設計
- カードレイアウトの実装
- 空の状態のデザインパターン

**実装したコンポーネント**
- Dashboard.tsx
- Dashboard.css
- Layout.tsx
- Sidebar.tsx

**完了日**: 2025年11月13日、グラフ改善：2025年11月26日

### ステップ3-4: データ可視化 ✅ **完了**（45分）
- ✅ Chart.jsの導入とCategoryScale設定
- ✅ 過去データのグラフ表示（気分・モチベーション、気温・湿度）
- ✅ 時間単位でのデータ集約と平均値計算
- ✅ 日付範囲の選択機能（今日/直近3日間/1週間/3週間）
- ✅ マウスホバー動作の改善（intersect: false）
- ✅ 気温軸の動的範囲調整機能
- ✅ データがない期間でもグラフ枠を表示

**学習内容**
- Chart.jsの基本設定
- 折れ線グラフ、複合グラフの作成
- データの加工と整形（時間単位集約）
- インタラクティブなグラフ
- CategoryScaleの必要性
- 動的な軸範囲計算
- 空の状態の表示デザイン

**実装したコンポーネント**
- MoodChart.tsx（気分・モチベーション）
- WeatherChart.tsx（気温・湿度、動的範囲調整機能付き）

**完了日**: 2025年11月14日、グラフ改善：2025年11月26日

### ステップ3-5: 気象データ連携 ✅ **完了**（45分）
- ✅ WeatherAPIの使用方法
- ✅ 気象データの取得と保存（記録作成時に自動）
- ✅ 気象データとユーザーデータの関連付け
- ✅ 記録詳細画面での気象データ表示（完全実装）
- ✅ グラフでの気象データ可視化

**学習内容**
- 外部APIの呼び出し
- APIキーの管理
- データのキャッシング
- 非同期処理
- 気象データの可視化
- 記録IDに紐づく気象データ取得

**実装した機能**
- バックエンド:
  - weatherService.ts（getCurrentWeather, getWeatherByCoordinates）
  - WeatherDataModel.ts（create, getByUserAndDate）
  - weatherController.ts（getCurrentWeatherData）
  - weatherRoutes.ts（GET /api/weather/current）
  - 記録作成時の自動気象データ取得（非同期処理）
- フロントエンド:
  - weatherService.ts（getCurrentWeather）
  - RecordDetail.tsxでの気象情報カード表示（完全実装）
  - RecordForm.tsxでの現在の気象データ表示

**完了日**: 2025年11月13日（記録作成時の自動取得）、2025年11月14日（グラフ表示改善）、2025年11月26日（記録詳細画面の完全実装）

---

## Phase 4: AI機能統合とフロント実装 ✅ **完了**（7/7ステップ、約375分）

### ステップ4-1: Gemini API基礎 ✅ **完了**（45分）
- ✅ Gemini APIの登録と設定
- ✅ プロンプト設計の基礎
- ✅ バックエンドからのAPI呼び出し
- ✅ aiService.tsの実装

**学習内容**
- LLM APIの基本概念
- プロンプトエンジニアリングの基礎
- レスポンスのパース
- レート制限への対処
- エラーハンドリング
- @google/generative-ai ライブラリの使用

**実装した機能**
- aiService.ts の基本構造
- Gemini APIへの接続設定（GoogleGenerativeAI初期化）
- テキスト生成の基本実装（generateContent使用）
- エラーハンドリングとリトライロジック
- JSON形式でのレスポンス取得

**完了日**: 2025年11月21日

### ステップ4-2: AI質問生成機能 ✅ **完了**（45分）
- ✅ 分析観点に基づく質問生成
- ✅ データ不足を補う質問の生成ロジック
- ✅ 生成された質問の管理
- ✅ 質問の自動保存とデータベース連携

**学習内容**
- コンテキストを含むプロンプト設計
- 構造化されたレスポンスの取得（JSON形式）
- 質問の重複チェック
- 質問の保存と再利用
- 分析観点に基づく動的な質問生成
- プロンプトエンジニアリングの実践

**実装した機能**
- aiService.generateQuestions(): 分析観点に基づく質問生成
- Analysis.saveGeneratedQuestions(): 生成質問のDB保存
- GET /api/analysis/generate-questions: 質問生成APIエンドポイント

**完了日**: 2025年11月21日

### ステップ4-3: データ分析機能 ✅ **完了**（60分）
- ✅ 蓄積データの集計処理（記録データ、気象データ、分析回答データ）
- ✅ AIによる傾向分析（Gemini API使用）
- ✅ 相関関係の抽出（気象条件と気分・モチベーションの関係）
- ✅ 分析結果のJSON形式での取得

**学習内容**
- SQLによるデータ集計（JOIN、AVG、COUNT）
- 統計的な分析手法の基礎（平均値、傾向）
- AIを活用した洞察の抽出（プロンプト設計）
- 結果の構造化（JSON形式）
- 複数データソースの統合

**実装した機能**
- バックエンド:
  - AnalysisModel.getAnalysisData(): 記録データ、気象データ、分析回答データを包括的に取得
  - aiService.analyzeData(): Gemini APIを使用してデータを分析
  - analysisController.analyzeUserData(): 分析APIエンドポイント
  - GET /api/analysis/analyze?days=14: AI分析エンドポイント

**分析結果の構造**
- summary: 全体的な状態の要約
- trends: 気分・モチベーションの傾向（improving/stable/declining）
- correlations: 相関関係の考察
- recommendations: 具体的な推奨事項

**完了日**: 2025年11月26日

### ステップ4-4: アドバイス生成機能 ✅ **完了**（60分）
- ✅ パーソナライズされたアドバイス生成機能
- ✅ 気象データを考慮したアドバイス
- ✅ アドバイス履歴の保存と管理
- ✅ API実装完了

**学習内容**
- パーソナライズされたプロンプト設計
- 複数データソースの統合（最新記録、直近記録、気象データ、AI分析結果）
- アドバイスの履歴管理
- データベースへの保存と取得
- トークン消費の最適化

**実装した機能**
- バックエンド:
  - AdviceModel（Advice.ts）: アドバイス履歴の管理
  - aiService.generatePersonalizedAdvice(): パーソナライズされたアドバイス生成
  - adviceController: アドバイス生成・履歴取得エンドポイント
  - adviceRoutes.ts: GET /api/advice/personalized, GET /api/advice/history

**完了日**: 2025年11月26日

### ステップ4-5: ダッシュボードでのアドバイス表示 ✅ **完了**（45分）
- ✅ adviceService.ts（API通信層）の実装
- ✅ AdviceCard.tsx（アドバイス表示コンポーネント）
- ✅ Dashboard.tsxへの統合
- ✅ トークン節約のための最適化（自動生成無効化）

**学習内容**
- API通信サービスの設計
- コンポーネント間のデータ受け渡し
- 相対時刻の表示（「5分前」「昨日」）
- ローディング状態とエラーハンドリング
- トークン消費の最適化

**実装した機能**
- adviceService.ts: API通信層
- AdviceCard.tsx: 最新アドバイス表示、手動更新、履歴へのリンク
- AdviceCard.css: グラデーション背景、アニメーション
- Dashboard.tsxへの統合

**完了日**: 2025年11月26日

### ステップ4-6: アドバイス履歴画面 ✅ **完了**（45分）
- ✅ AdviceHistory.tsx（履歴一覧表示）
- ✅ App.tsxにルーティング追加
- ✅ Sidebar.tsxにナビゲーション追加
- ✅ 新しいアドバイス生成機能

**学習内容**
- 一覧画面の設計
- ページネーションとルーティング
- カードレイアウトの実装
- 空の状態のデザイン

**実装した機能**
- AdviceHistory.tsx: 履歴一覧、新規生成ボタン
- AdviceHistory.css: カードレイアウト、アニメーション
- ルーティングとナビゲーション統合

**完了日**: 2025年11月26日

### ステップ4-7: 統合分析画面 ✅ **完了**（75分）
- ✅ 期間選択機能（今日/直近3日間/1週間/3週間）
- ✅ レーダーチャートによる観点別スコア表示
- ✅ スコア遷移グラフの実装
- ✅ AI分析結果の統合表示
- ✅ 非同期ローディング最適化

**学習内容**
- Chart.jsのレーダーチャート実装
- 複数データソースの並列取得
- 非同期処理の最適化（Promise.all）
- ローディング状態の分離管理
- エラーハンドリングの改善
- グラフコンポーネントの作成

**実装した機能**
- フロントエンド:
  - CategoryRadarChart.tsx: レーダーチャートコンポーネント
  - CategoryTrendsChart.tsx: スコア遷移グラフコンポーネント
  - AnalysisForm.tsx（新版）: 統合分析画面
    - 期間選択（4つのオプション）
    - レーダーチャートとスコア遷移グラフ
    - AI分析結果の統合表示
    - グラフは即表示、AI分析は別途非同期実行
    - ローディングスピナーとエラー処理
  - AnalysisForm.css: スタイリング
  - analysisService.ts: getCategoryScores, getCategoryTrends追加

- バックエンド（確認済み、変更なし）:
  - GET /api/analysis/scores?period=1week
  - GET /api/analysis/trends?period=1week
  - AnalysisModel.getCategoryAverageScores()
  - AnalysisModel.getCategoryScoreTrends()

**非同期処理の最適化**:
```typescript
// グラフデータを先に読み込む（高速）
const [scores, trends] = await Promise.all([
  getCategoryScores(period),
  getCategoryTrends(period)
]);
setLoading(false); // すぐにグラフを表示

// AI分析は別途実行（時間がかかる）
const aiAnalysis = await analyzeUserData(days);
setAiLoading(false); // AI分析完了後に表示
```

**削除した機能**:
- AnalysisResult.tsx（統合分析画面に機能を統合）
- ダッシュボードとサイドバーの「AI分析結果」ボタン

**完了日**: 2025年11月26日

---

## Phase 5: テストとCI/CD ❌ **未着手**（0/3ステップ、約135分）

### ステップ5-1: ユニットテスト ❌ **未実装**（45分）
- ❌ Jest（React）とMocha（Node.js）の導入
- ❌ コンポーネントのテスト
- ❌ APIのテスト

**学習内容**
- テスト駆動開発（TDD）の概念
- React Testing Libraryの使用
- モックの作成
- カバレッジの確認

### ステップ5-2: 統合テスト ❌ **未実装**（45分）
- ❌ E2Eテストの概念
- ❌ Playwrightの導入と基本
- ❌ 主要シナリオのテスト

**学習内容**
- E2Eテストの設計
- テストシナリオの作成
- 自動スクリーンショット
- CI環境での実行

### ステップ5-3: CI/CD構築 ❌ **未実装**（45分）
- ❌ GitHub Actionsの基礎
- ❌ 自動テストの設定
- ❌ ビルドとデプロイの自動化

**学習内容**
- CI/CDの概念と利点
- ワークフローファイルの作成
- 環境変数の管理
- デプロイメントパイプライン

---

## Phase 6: デプロイと最適化 ✅ **完了**（2/2ステップ、約90分）

### ステップ6-1: デプロイ準備 ✅ **完了**（45分）
- ✅ 本番環境用の設定
- ✅ 環境変数の管理
- ✅ セキュリティ対策
- ✅ デプロイ手順書の作成

**学習内容**
- 本番環境と開発環境の違い
- 環境変数の安全な管理
- HTTPS設定
- セキュリティヘッダー
- SQLインジェクション対策

**作成したドキュメント**
- DEPLOYMENT_GUIDE.md（22.86 KB、全13章）
- PHASE6-1_SUMMARY.md（16.09 KB、全8章）

**作成した設定ファイル**
- フロントエンド: mood-tracker-app.env.example、vercel.json
- バックエンド: database.config.ts、cors.config.ts、security.config.ts、index.production.ts、mood-tracker-api.env.example
- データベース: migration.sql

**完了日**: 2025年11月27日

### ステップ6-2: デプロイ実施 ✅ **完了**（45分）
- ✅ Supabase（データベース）のセットアップ
- ✅ Render.com（バックエンド）へのデプロイ
- ✅ Vercel（フロントエンド）へのデプロイ
- ✅ 動作確認とトラブルシューティング
- ✅ ユーザー登録機能の実装と修正
- ✅ データベース接続の修正（Connection Pooler使用）
- ✅ advice_historyテーブルの作成

**学習内容**
- 無償ホスティングサービスの活用
- データベースマイグレーション
- ログの確認とデバッグ
- TypeScript設定の調整
- bcryptjsへの切り替え（ネイティブモジュール問題の解決）
- DATABASE_URL環境変数の設定
- Connection Poolerの活用
- テーブル作成とマイグレーション

**本番環境URL**
- フロントエンド: Vercel
- バックエンド: Render.com
- データベース: Supabase

**トラブルシューティング実績**
- TypeScriptビルドエラーの解決（strict mode調整）
- bcrypt → bcryptjs への切り替え
- DATABASE_URL環境変数の設定
- Connection Pooler設定
- CORS設定の更新
- advice_historyテーブルの追加作成

**完了日**: 2025年11月28日

---

## 学習の進め方

### 基本ルール
1. 各ステップは約45分を想定していますが、理解度に応じて柔軟に調整します
2. 必ず「理解できました」と確認してから次のステップに進みます
3. 不明点があれば遠慮なく質問してください
4. 実際にコードを書いて動作確認することを重視します

### 推奨する学習方法
1. **コードを写経する**: まずは提示されたコードを正確に入力しましょう
2. **動作を確認する**: 必ず実行して期待通りに動作することを確認しましょう
3. **改造してみる**: 動作を理解したら、少し変更を加えて実験しましょう
4. **エラーを経験する**: わざと間違えてエラーメッセージを読む練習も有効です

### 質問の例
- 「このコードの〇〇の部分はどういう意味ですか？」
- 「〇〇の場合はどのように実装すればよいですか？」
- 「エラーが出ましたが、どうすれば解決できますか？」
- 「もっと良い書き方はありますか？」

---

## 総学習時間と進捗管理

**総学習時間**: 約 1080分（約18時間）  
**総ステップ数**: 24ステップ

### 進捗状況
- ✅ **Phase 1 完了**（3/3ステップ） - 2025年11月上旬
- ✅ **Phase 2 完了**（4/4ステップ） - 2025年11月7日～13日
- ✅ **Phase 3 完了**（5/5ステップ） - 2025年11月13日～14日、グラフ改善：11月26日
- ✅ **Phase 4 完了**（7/7ステップ） - 2025年11月21日〜26日
- ❌ **Phase 5**（0/3ステップ） ← **次はここ**
- ✅ **Phase 6 完了**（2/2ステップ） - 2025年11月27日〜28日

**現在の進捗率**: 21/24ステップ = **約88%完了**

**次のマイルストーン**: Phase 5（テストとCI/CD）

---

## 実装済みの追加機能

ロードマップ以外に実装された機能：

### 記録詳細画面 ✅ **完全実装**
- RecordDetail.tsx / RecordDetail.css
- 記録の全データ表示（日時、睡眠、食事、運動、気分、メモ）
- スコアのバー形式表示（視覚的な進捗バー）
- 気象情報カードの完全実装（記録時刻に最も近い気象データを表示）
- 一覧へ戻る機能
- **完了日**: 2025年11月26日（気象データ表示機能の完全実装）

### 記録一覧画面
- RecordList.tsx / RecordList.css
- カード形式での記録一覧表示
- 詳細画面への遷移

### グラフ表示の高度な機能
- 時間単位でのデータ集約（DATE_TRUNC関数）
- 平均値の自動計算
- 横軸ラベルの形式統一（MM/DD HH:00）
- マウスホバー動作の改善（mode: 'index', intersect: false）
- 気温軸の動的範囲調整機能
  - デフォルト：0度～40度
  - 0度を下回る場合：10の倍数に切り下げ
  - 40度を上回る場合：10の倍数に切り上げ
  - 範囲に応じた間隔の自動調整（2度/5度/10度）
- **データがない期間でもグラフ枠を表示**
- **空の状態メッセージの表示**

### 統合分析画面の実装
- CategoryRadarChart.tsx: レーダーチャート
- CategoryTrendsChart.tsx: スコア遷移グラフ
- AnalysisForm.tsx: 統合分析画面
- 非同期ローディング最適化（グラフ即表示、AI分析別途実行）

### ユーザー認証画面
- Login.tsx / Login.css
- Register.tsx
- ログイン/新規登録の切り替え機能

---

## 習得できるスキル

このロードマップを完了すると、以下のスキルが習得できます。

### フロントエンド ✅ 習得済み（基礎～応用）
- ✅ React 18の基本から応用まで
- ✅ TypeScriptによる型安全な開発
- ✅ コンポーネント設計とState管理
- ✅ フック（useState, useEffect、カスタムフック）の活用
- ✅ フォーム処理とバリデーション
- ✅ データ可視化（Chart.js、レーダーチャート、時間単位集約、動的範囲調整）
- ✅ レスポンシブデザイン
- ✅ 非同期処理の最適化

### バックエンド ✅ 習得済み（基礎～応用）
- ✅ Node.js + Expressによるサーバー構築
- ✅ RESTful API設計と実装
- ✅ PostgreSQLによるデータベース操作
- ✅ 環境変数とセキュリティ
- ✅ エラーハンドリング
- ✅ 外部API連携（WeatherAPI）

### AI統合 ✅ 習得済み（基礎〜中級）
- ✅ LLM API（Gemini）の基礎
- ✅ プロンプトエンジニアリングの基礎〜中級
- ✅ 構造化されたレスポンス取得（JSON）
- ✅ AIによる質問生成
- ✅ AIを活用したデータ分析
- ✅ 複数データソースの統合分析
- ✅ パーソナライズ機能の実装
- ✅ AI機能のフロントエンド統合
- ✅ トークン消費の最適化

### デプロイ ✅ 習得済み（基礎）
- ✅ 無償ホスティングサービスの活用（Vercel、Render.com、Supabase）
- ✅ 本番環境の設定
- ✅ トラブルシューティング
- ✅ データベースマイグレーション
- ✅ 環境変数の管理
- ✅ TypeScriptビルド設定
- ✅ bcryptjsへの切り替え

### テストとCI/CD ❌ 未習得
- ❌ ユニットテストの作成
- ❌ E2Eテストの設計と実装
- ❌ GitHub Actionsによる自動化
- ❌ 継続的インテグレーション/デプロイメント

---

## 参考資料

### 公式ドキュメント
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/
- Node.js: https://nodejs.org/
- Express: https://expressjs.com/
- PostgreSQL: https://www.postgresql.org/
- Vite: https://vitejs.dev/
- Chart.js: https://www.chartjs.org/
- Google Gemini API: https://ai.google.dev/
- Vercel: https://vercel.com/docs
- Render: https://render.com/docs
- Supabase: https://supabase.com/docs

### その他のリソース
- MDN Web Docs: https://developer.mozilla.org/
- GitHub: https://github.com/
- Stack Overflow: https://stackoverflow.com/

---

## 注意事項

### 無償で行う制約
- すべてのツールとサービスは無料枠で利用します
- 有料サービスは使用しません
- オープンソースのライブラリを優先します

### セキュリティ
- パスワードや APIキーは`.env`ファイルで管理します
- `.gitignore`に機密情報を含むファイルを追加します
- 本番環境では環境変数をホスティングサービスで管理します

### バージョン管理
- Gitによるバージョン管理を推奨します
- こまめにコミットする習慣をつけましょう
- ブランチを活用して機能開発を分離しましょう

---

**最終更新日**: 2025年11月28日  
**更新内容**: Phase 6完了、進捗率を88%に更新、デプロイ実績を追記、次のマイルストーンをPhase 5に設定
