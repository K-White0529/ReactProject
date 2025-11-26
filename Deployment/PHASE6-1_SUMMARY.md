# Phase 6-1 デプロイ準備 - 完了サマリー

作成日: 2025年11月26日
所要時間: 約45分
対象: Mood Trackerアプリケーション

---

## 1. 実施内容の概要

Phase 6-1では、Mood Trackerアプリケーションを本番環境にデプロイするための準備作業を完了した。具体的には、環境変数テンプレートの作成、デプロイ設定ファイルの作成、本番環境対応コードの作成、データベースマイグレーションスクリプトの作成、およびデプロイ手順書の作成を実施した。

これらのファイルは、フロントエンド（React + Vite）、バックエンド（Node.js + Express）、データベース（PostgreSQL）それぞれの本番環境へのデプロイに必要なすべての設定と手順を含んでいる。次のステップであるPhase 6-2では、これらのファイルを使用して実際のデプロイを実施する。

---

## 2. 作成したファイル

### 2.1 ドキュメント類

**DEPLOYMENT_GUIDE.md**
本番環境へのデプロイ手順を定義した技術文書である。データベースのセットアップ、バックエンドのデプロイ、フロントエンドのデプロイ、動作確認、トラブルシューティングの手順を含む。Supabase/Neon、Render.com、Vercelを使用した構成を前提としている。

**PHASE6-1_SUMMARY.md**（本ドキュメント）
Phase 6-1で実施した作業の完了サマリーである。作成したファイルの説明、実装したセキュリティ対策、次のステップの説明を含む。

### 2.2 フロントエンド用ファイル

**mood-tracker-app.env.example**
フロントエンドアプリケーションの環境変数テンプレートである。VITE_API_URL、VITE_APP_NAME、VITE_APP_VERSIONの3つの変数を定義している。実際の環境では、このファイルをコピーして.env.localを作成し、適切な値を設定する。

**vercel.json**
Vercelのデプロイ設定ファイルである。ビルド設定、ルーティング設定、環境変数の参照方法を定義している。静的ファイルの配信とSPA（Single Page Application）のルーティングを適切に処理する設定を含む。

### 2.3 バックエンド用ファイル

**mood-tracker-api.env.example**
バックエンドアプリケーションの環境変数テンプレートである。データベース接続情報、JWT設定、外部API設定、CORS設定など、本番環境で必要なすべての環境変数を定義している。実際の環境では、このファイルを参考に環境変数を設定する。

**database.config.ts**
本番環境対応のデータベース接続設定ファイルである。環境変数から設定を読み込み、開発環境と本番環境で異なる接続方法を自動的に選択する。本番環境ではDATABASE_URL環境変数を使用し、SSL接続を有効にする。接続テスト関数も提供する。

**cors.config.ts**
環境別のCORS設定を定義したファイルである。本番環境では環境変数CORS_ORIGINで指定されたオリジンのみを許可し、開発環境ではすべてのオリジンを許可する。複数オリジンの指定にも対応している。

**security.config.ts**
セキュリティヘッダーとレート制限の設定ファイルである。Helmet.jsを使用したセキュリティヘッダーの設定、express-rate-limitを使用したレート制限の実装を含む。全APIエンドポイントに対する一般的なレート制限と、認証エンドポイントに対する厳格なレート制限を定義している。

**index.production.ts**
本番環境対応のバックエンドエントリーポイントである。既存のindex.tsを置き換えることを想定している。環境別のミドルウェア設定、セキュリティ設定、エラーハンドリング、ヘルスチェックエンドポイント、Graceful Shutdownの実装を含む。

### 2.4 データベース用ファイル

**migration.sql**
本番データベース用のマイグレーションスクリプトである。7つのテーブル（users、records、analysis_categories、analysis_questions、analysis_answers、weather_data、ai_advice）の作成、インデックスの作成、初期データの投入を行う。SupabaseまたはNeonのSQL Editorで実行することを想定している。

---

## 3. ファイルの配置

作成したファイルは以下のディレクトリ構成で配置する。

```
E:\ReactProject\Deployment\
├── DEPLOYMENT_GUIDE.md
├── PHASE6-1_SUMMARY.md
│
├── frontend\
│   ├── mood-tracker-app.env.example
│   └── vercel.json
│
├── backend\
│   ├── mood-tracker-api.env.example
│   ├── database.config.ts
│   ├── cors.config.ts
│   ├── security.config.ts
│   └── index.production.ts
│
└── database\
    └── migration.sql
```

### 3.1 実際のプロジェクトへの適用

作成したファイルを実際のプロジェクトに適用する手順は以下の通りである。

**フロントエンド**
1. mood-tracker-app.env.exampleをE:\ReactProject\mood-tracker-app\.env.exampleにコピーする
2. vercel.jsonをE:\ReactProject\mood-tracker-app\vercel.jsonにコピーする
3. .env.exampleをコピーして.env.localを作成し、開発環境用の環境変数を設定する

**バックエンド**
1. mood-tracker-api.env.exampleをE:\ReactProject\mood-tracker-api\.env.exampleにコピーする
2. database.config.tsをE:\ReactProject\mood-tracker-api\src\config\database.tsに配置する（既存ファイルを置き換える）
3. E:\ReactProject\mood-tracker-api\src\configディレクトリを作成し、cors.config.tsとsecurity.config.tsを配置する
4. index.production.tsの内容を既存のE:\ReactProject\mood-tracker-api\src\index.tsにマージする

**データベース**
1. migration.sqlはデプロイ時にSupabaseまたはNeonのSQL Editorで実行する

---

## 4. 実装したセキュリティ対策

本番環境のセキュリティを確保するため、以下の対策を実装した。

### 4.1 環境別設定管理

NODE_ENV環境変数により開発環境と本番環境を区別し、それぞれに適した設定を自動的に適用する。本番環境では厳格なセキュリティ設定を適用し、開発環境では開発効率を優先した設定を適用する。

### 4.2 データベースセキュリティ

本番環境ではSSL接続を必須とする。Supabase、Neon、Render PostgreSQLなど、主要なPostgreSQLホスティングサービスに対応したSSL設定を実装した。接続文字列（DATABASE_URL）または個別の環境変数のいずれでも接続可能である。

### 4.3 CORS設定

本番環境では、環境変数CORS_ORIGINで明示的に指定されたオリジンからのリクエストのみを許可する。複数のオリジンを指定する場合は、カンマ区切りで列挙する。開発環境では、すべてのオリジンからのリクエストを許可し、開発効率を向上させる。

### 4.4 セキュリティヘッダー

Helmet.jsを使用して以下のセキュリティヘッダーを設定した。

Content Security Policy: XSS攻撃を防ぐため、スクリプト、スタイル、画像などのリソースの読み込み元を制限する。デフォルトでは自己オリジンのみを許可する。

HTTP Strict Transport Security (HSTS): ブラウザに対してHTTPS接続を強制する。最大期間を1年に設定し、サブドメインにも適用する。

X-Content-Type-Options: MIMEタイプスニッフィングを無効化し、宣言されたContent-Typeのみを尊重するようブラウザに指示する。

X-Frame-Options: クリックジャッキング攻撃を防ぐため、iframeでの表示を禁止する。

X-XSS-Protection: ブラウザの組み込みXSSフィルタを有効にする。

Referrer-Policy: リファラー情報の送信を制限し、プライバシーを保護する。

### 4.5 レート制限

express-rate-limitを使用してレート制限を実装した。全APIエンドポイントに対して15分間に100リクエストまでの制限を適用する。認証関連エンドポイント（/api/auth/loginおよび/api/auth/register）には、ブルートフォース攻撃を防ぐため、15分間に5リクエストまでのより厳格な制限を適用する。

### 4.6 エラーハンドリング

本番環境では、エラーメッセージからスタックトレースを除外し、内部実装の詳細を外部に公開しないようにした。開発環境では、デバッグを容易にするため、詳細なエラー情報を含める。

### 4.7 JWT認証

JWT_SECRET環境変数には、128文字（64バイト）の強力なランダム文字列を使用する。Node.jsのcryptoモジュールを使用して生成することを推奨する。この値は絶対に外部に公開してはならない。

### 4.8 パスワードハッシュ化

ユーザーのパスワードはbcryptを使用してハッシュ化する。ソルトラウンドは10に設定し、計算コストとパフォーマンスのバランスを取る。平文パスワードをデータベースに保存することは絶対にしない。

### 4.9 Graceful Shutdown

SIGTERMおよびSIGINTシグナルを捕捉し、サーバーを安全に停止する処理を実装した。これにより、デプロイ時やコンテナの再起動時に、処理中のリクエストを適切に完了させることができる。

---

## 5. 環境変数の管理

### 5.1 フロントエンド環境変数

Viteアプリケーションでは、VITE_プレフィックスを持つ環境変数のみがビルド時にクライアント側コードに埋め込まれる。APIキーやデータベース接続文字列など、機密情報を含む環境変数には絶対にVITE_プレフィックスを付けてはならない。

VITE_API_URLには、バックエンドAPIのベースURLを設定する。開発環境ではhttp://localhost:3000、本番環境ではRender.comで生成されたURLを設定する。

### 5.2 バックエンド環境変数

バックエンドの環境変数は、Render.comのWeb ServiceのEnvironment設定画面で設定する。以下の変数が必須である。

NODE_ENV: 環境を識別する変数。productionを設定する。

PORT: サーバーが使用するポート番号。3000を設定する。

DATABASE_URL: PostgreSQLデータベースへの接続文字列。Supabaseまたは Neonから取得した接続文字列を設定する。

JWT_SECRET: JWT認証で使用する秘密鍵。128文字のランダム文字列を設定する。

WEATHER_API_KEY: WeatherAPIのAPIキー。weatherapi.comから取得する。

WEATHER_API_URL: WeatherAPIのベースURL。https://api.weatherapi.com/v1を設定する。

GEMINI_API_KEY: Google Gemini APIのAPIキー。ai.google.devから取得する。

CORS_ORIGIN: フロントエンドアプリケーションのURL。VercelにデプロイしたURLを設定する。

LOG_LEVEL: ログレベル。infoを設定する。

### 5.3 .gitignoreの設定

.envファイルや.env.localファイルを.gitignoreに追加し、環境変数を含むファイルがGitリポジトリにコミットされないようにする。.env.exampleファイルはコミットしてよいが、実際の値は含めず、プレースホルダーのみを含める。

---

## 6. 次のステップ

Phase 6-1の完了により、デプロイに必要なすべての準備が整った。次に実施すべきステップは、Phase 6-2（デプロイ実施）である。

### 6.1 Phase 6-2の内容

Phase 6-2では、以下の作業を実施する。

1. データベースのセットアップ: SupabaseまたはNeonでプロジェクトを作成し、migration.sqlを実行する。
2. バックエンドのデプロイ: Render.comにバックエンドをデプロイし、環境変数を設定する。
3. フロントエンドのデプロイ: Vercelにフロントエンドをデプロイし、環境変数を設定する。
4. CORS設定の更新: Vercelで生成されたURLをバックエンドのCORS_ORIGIN環境変数に設定する。
5. 動作確認: すべての機能が正常に動作することを確認する。
6. セキュリティ確認: HTTPS通信、認証、CORS設定が適切に機能することを確認する。

### 6.2 所要時間

Phase 6-2の所要時間は約45分である。データベースのセットアップに10分、バックエンドのデプロイに15分、フロントエンドのデプロイに10分、動作確認に10分を想定している。

### 6.3 前提条件

Phase 6-2を開始する前に、以下の前提条件を満たす必要がある。

- GitHubアカウントが作成されている
- Vercelアカウントが作成されている（GitHubで認証）
- Render.comアカウントが作成されている（GitHubで認証）
- SupabaseまたはNeonアカウントが作成されている（GitHubで認証）
- WeatherAPIアカウントが作成され、APIキーが取得されている
- Google AI Studioアカウントが作成され、Gemini APIキーが取得されている
- JWT_SECRETが生成されている（128文字のランダム文字列）
- コードがGitHubリポジトリにプッシュされている

これらの準備が完了していない場合、DEPLOYMENT_GUIDE.mdの「3. 事前準備」セクションを参照し、必要なアカウント作成とAPIキーの取得を完了させる。

---

## 7. 推奨事項

Phase 6-2に進む前に、以下の事項を推奨する。

### 7.1 ローカル環境での動作確認

作成したファイルを実際のプロジェクトに適用し、ローカル環境で動作確認を行う。database.config.tsが正しくデータベースに接続できること、cors.config.tsとsecurity.config.tsがindex.tsから正しくインポートできることを確認する。

開発環境用の.envファイルを作成し、すべての必要な環境変数が設定されていることを確認する。npm run devでアプリケーションを起動し、エラーが発生しないことを確認する。

### 7.2 DEPLOYMENT_GUIDE.mdの確認

DEPLOYMENT_GUIDE.mdを一読し、デプロイ手順を理解する。特に、データベースのセットアップ手順、環境変数の設定方法、トラブルシューティングのセクションを確認しておくことを推奨する。

### 7.3 APIキーの事前取得

WeatherAPIとGoogle Gemini APIのアカウント作成とAPIキーの取得には、それぞれ5-10分程度を要する。Phase 6-2を開始する前にこれらを完了させておくことで、スムーズにデプロイを進めることができる。

### 7.4 JWT_SECRETの生成

JWT_SECRETは、以下のコマンドで生成する。

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

生成された128文字の文字列を安全な場所に保存しておく。この値は本番環境の環境変数として使用する。

---

## 8. Phase 6-1の成果

Phase 6-1により、以下の成果を達成した。

1. 本番環境へのデプロイに必要なすべての設定ファイルを作成した。
2. 環境別の設定管理を実装し、開発環境と本番環境で適切な設定が自動的に適用されるようにした。
3. 包括的なセキュリティ対策を実装し、本番環境でのアプリケーションの安全性を確保した。
4. 詳細なデプロイ手順書を作成し、デプロイ作業を標準化した。
5. データベースマイグレーションスクリプトを作成し、本番データベースのセットアップを簡素化した。

これらの成果により、Phase 6-2でのデプロイ作業を効率的かつ確実に実施できる準備が整った。次のステップであるPhase 6-2の実施により、Mood Trackerアプリケーションは本番環境で利用可能な状態となる。

---

作成日: 2025年11月26日
次のステップ: Phase 6-2（デプロイ実施）
推定所要時間: 約45分
