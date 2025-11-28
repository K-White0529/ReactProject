# Mood Tracker デプロイ手順書

バージョン: 1.0.0
作成日: 2025年11月26日
対象: 本番環境へのデプロイ実施

---

## 1. 本ドキュメントの目的

本ドキュメントは、Mood Trackerアプリケーションを本番環境にデプロイするための手順を定義する。フロントエンド（React + Vite）はVercelに、バックエンド（Node.js + Express）はRender.comに、データベース（PostgreSQL）はSupabaseまたはNeonにデプロイする構成を想定している。

本手順に従うことで、開発環境で動作確認済みのアプリケーションを本番環境で稼働させることができる。デプロイ後は、HTTPS通信、認証機能、データベース接続、外部API連携が正常に動作することを確認する。

---

## 2. デプロイアーキテクチャ

本番環境は以下の構成要素で構成される。

**フロントエンド**
- ホスティング: Vercel
- フレームワーク: React 18 + Vite
- ビルド出力: 静的ファイル（HTML, CSS, JavaScript）
- 通信: HTTPS、Vercelが自動的にSSL証明書を提供

**バックエンド**
- ホスティング: Render.com
- ランタイム: Node.js 18以上
- フレームワーク: Express
- 通信: HTTPS、Render.comが自動的にSSL証明書を提供

**データベース**
- サービス: SupabaseまたはNeon（いずれもPostgreSQL互換）
- 接続: SSL接続（sslmode=require）
- バックアップ: 各サービスの自動バックアップ機能を利用

**外部API**
- WeatherAPI: 気象データ取得
- Google Gemini API: AI分析機能

すべてのコンポーネントはHTTPS通信を行い、環境変数による設定管理を実施する。認証にはJWTを使用し、パスワードはbcryptでハッシュ化して保存する。

---

## 3. 事前準備

デプロイ実施前に以下の準備を完了させる必要がある。

### 3.1 必要なアカウント

以下のサービスアカウントを作成する。GitHubアカウントは各サービスの認証に使用するため最初に作成すること。

- GitHub: コードリポジトリのホスティング
- Vercel: フロントエンドのホスティング（GitHubアカウントで認証）
- Render.com: バックエンドのホスティング（GitHubアカウントで認証）
- SupabaseまたはNeon: PostgreSQLデータベース（GitHubアカウントで認証）
- WeatherAPI (weatherapi.com): 気象データAPI
- Google AI Studio (ai.google.dev): Gemini API

### 3.2 APIキーの取得

**WeatherAPI**
weatherapi.comにアクセスし、無料プランに登録する。ダッシュボードからAPIキーを取得する。無料プランは月間100万リクエストまで利用可能である。

**Google Gemini API**
ai.google.devにアクセスし、Google Cloudプロジェクトを作成する。Gemini APIを有効化し、APIキーを作成する。無料枠は1分間に60リクエスト、1日あたり1500リクエストまで利用可能である。

**JWT Secret**
バックエンドの認証に使用する秘密鍵を生成する。Node.jsで以下のコマンドを実行し、出力された文字列を使用する。

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

生成された128文字の16進数文字列を環境変数JWT_SECRETに設定する。この値は絶対に外部に公開してはならない。

### 3.3 コードリポジトリの準備

GitHubに2つのリポジトリを作成する。

- mood-tracker-app: フロントエンドコード
- mood-tracker-api: バックエンドコード

ローカルの開発環境からコードをプッシュする。

```bash
# フロントエンド
cd E:\ReactProject\mood-tracker-app
git init
git remote add origin https://github.com/[username]/mood-tracker-app.git
git add .
git commit -m "Initial commit"
git push -u origin main

# バックエンド
cd E:\ReactProject\mood-tracker-api
git init
git remote add origin https://github.com/[username]/mood-tracker-api.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

.gitignoreファイルに.envファイルが含まれていることを確認する。環境変数を含むファイルをリポジトリにコミットしてはならない。

---

## 4. データベースのセットアップ

データベースのセットアップは、SupabaseまたはNeonのいずれかを選択する。推奨はSupabaseである。理由は、UIが直感的であること、無料枠が大きいこと、SQL Editorが標準で利用可能であることである。

### 4.1 Supabaseによるセットアップ（推奨）

**プロジェクト作成**
supabase.comにアクセスし、GitHubアカウントでサインインする。New Projectをクリックし、以下の情報を入力する。

- プロジェクト名: mood-tracker
- データベースパスワード: 強力なパスワードを設定（20文字以上推奨）
- リージョン: Tokyo（東京）を選択

プロジェクトの作成には約2分を要する。

**接続文字列の取得**
プロジェクトダッシュボードでSettings > Databaseを開く。Connection stringのURIタブから接続文字列をコピーする。形式は以下の通りである。

```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

[YOUR-PASSWORD]の部分を実際のパスワードに置き換える。この接続文字列は後ほど環境変数DATABASE_URLに設定する。

**マイグレーションの実行**
SQL Editorを開き、E:\ReactProject\Deployment\database\migration.sqlの内容を貼り付けて実行する。実行完了後、テーブル一覧を確認し、users、records、analysis_categories、analysis_questions、analysis_answers、weather_data、ai_adviceの7テーブルが作成されていることを確認する。

### 4.2 Neonによるセットアップ

**プロジェクト作成**
neon.techにアクセスし、GitHubアカウントでサインインする。Create a projectをクリックし、以下の情報を入力する。

- プロジェクト名: mood-tracker
- リージョン: Tokyo（東京）を選択

**接続文字列の取得**
プロジェクトダッシュボードでConnection Detailsから接続文字列をコピーする。

**マイグレーションの実行**
Neon SQLエディタまたはローカルのpsqlクライアントを使用してmigration.sqlを実行する。

---

## 5. バックエンドのデプロイ（Render.com）

### 5.1 Web Serviceの作成

render.comにアクセスし、GitHubアカウントでサインインする。Dashboardから New > Web Serviceを選択する。GitHubリポジトリmood-tracker-apiを選択する。

### 5.2 デプロイ設定

以下の設定を入力する。

**基本設定**
- Name: mood-tracker-api
- Region: Singapore（日本に最も近いリージョン）
- Branch: main
- Root Directory: 空欄（プロジェクトルートの場合）
- Runtime: Node
- Build Command: npm install && npm run build
- Start Command: npm start

**インスタンスタイプ**
- Instance Type: Free（無料プラン）

無料プランは15分間アクセスがない場合自動的にスリープする。初回アクセス時のコールドスタートに30秒程度を要するが、本アプリケーションの用途では問題ない。

### 5.3 環境変数の設定

Environment > Add Environment Variableから以下の環境変数を追加する。

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
JWT_SECRET=[生成した128文字のシークレット]
WEATHER_API_KEY=[WeatherAPIのキー]
WEATHER_API_URL=https://api.weatherapi.com/v1
GEMINI_API_KEY=[Gemini APIのキー]
CORS_ORIGIN=https://[あなたのフロントエンドURL].vercel.app
LOG_LEVEL=info
```

CORS_ORIGINは後ほどフロントエンドのデプロイ時に確定するURLに更新する。一時的にhttps://localhost:5173を設定してもよい。

### 5.4 デプロイ実行

Create Web Serviceをクリックする。自動的にビルドとデプロイが開始される。ログを確認し、以下のメッセージが表示されることを確認する。

```
Database connected successfully
Server running on port 3000
```

デプロイ完了後、提供されたURLにアクセスする。形式はhttps://mood-tracker-api.onrender.comである。レスポンスとして以下のJSONが返されることを確認する。

```json
{
  "message": "Mood Tracker API v1.0",
  "status": "running",
  "environment": "production"
}
```

ヘルスチェックエンドポイント（/health）にもアクセスし、正常なレスポンスが返ることを確認する。

---

## 6. フロントエンドのデプロイ（Vercel）

### 6.1 プロジェクトのインポート

vercel.comにアクセスし、GitHubアカウントでサインインする。Add New > Projectを選択する。GitHubリポジトリmood-tracker-appをインポートする。

### 6.2 デプロイ設定

以下の設定を確認する。Vercelは自動的にViteプロジェクトを検出し、適切な設定を行う。

**Framework Preset**
- Vite（自動検出される）

**Root Directory**
- 空欄（プロジェクトルートの場合）

**Build and Output Settings**
- Build Command: npm run build（自動設定される）
- Output Directory: dist（自動設定される）
- Install Command: npm install（自動設定される）

### 6.3 環境変数の設定

Environment Variablesセクションで以下の環境変数を追加する。

```
VITE_API_URL=https://mood-tracker-api.onrender.com
VITE_APP_NAME=Mood Tracker
VITE_APP_VERSION=1.0.0
```

VITE_API_URLには前のステップでデプロイしたバックエンドのURLを設定する。

### 6.4 デプロイ実行

Deployをクリックする。ビルドとデプロイが自動的に実行される。完了後、Vercelが生成したURLにアクセスする。形式はhttps://mood-tracker-app.vercel.appまたはhttps://mood-tracker-app-[random].vercel.appである。

アプリケーションが正常に表示されることを確認する。ただし、この時点ではバックエンドのCORS設定が完了していないため、API通信はエラーになる。

### 6.5 バックエンドのCORS設定更新

Render.comのダッシュボードに戻り、mood-tracker-apiのEnvironment設定を開く。CORS_ORIGIN変数をVercelで生成されたURLに更新する。

```
CORS_ORIGIN=https://mood-tracker-app.vercel.app
```

保存後、Render.comは自動的に再デプロイを実行する。再デプロイ完了後、フロントエンドから正常にAPI通信ができることを確認する。

---

## 7. 動作確認

### 7.1 基本機能の確認

以下の操作を順次実行し、すべて正常に動作することを確認する。

**ユーザー登録**
フロントエンドの登録画面でテストユーザーを作成する。ユーザー名、メールアドレス、パスワードを入力し、登録ボタンをクリックする。登録完了後、ダッシュボードに遷移することを確認する。

**ログイン**
ログアウトし、再度ログイン画面からログインする。正常にダッシュボードに遷移することを確認する。

**記録作成**
データ登録画面で記録を作成する。睡眠時間、食事、運動、気分などの項目を入力し、保存する。気象データが自動的に保存されることを確認する。ダッシュボードに戻り、作成した記録が表示されることを確認する。

**グラフ表示**
ダッシュボードで気分とモチベーションのグラフ、気温と湿度のグラフが表示されることを確認する。データが少ない場合は「この期間のデータがありません」というメッセージが表示される。

**AI機能**
ダッシュボードのAIアドバイスカードで「アドバイスを生成」ボタンをクリックする。約5秒後にAIによるアドバイスが表示されることを確認する。分析画面で期間を選択し、レーダーチャートとスコア遷移グラフが表示されることを確認する。

### 7.2 パフォーマンス確認

ブラウザの開発者ツールを開き、Networkタブでパフォーマンスを確認する。

**ページ読み込み時間**
初回アクセス時のページ読み込み時間が3秒以内であることを確認する。Vercelの無料プランでは通常1-2秒程度で読み込みが完了する。

**API応答時間**
API呼び出しの応答時間を確認する。通常のCRUD操作は1秒以内、AI分析は5-10秒程度である。Render.comの無料プランでコールドスタート時は初回のみ30秒程度を要するが、以降は高速に動作する。

### 7.3 エラーハンドリングの確認

意図的にエラーを発生させ、適切なエラーメッセージが表示されることを確認する。

**認証エラー**
無効なトークンでAPI呼び出しを行い、401エラーが返され、ログイン画面にリダイレクトされることを確認する。

**バリデーションエラー**
不正な入力値（例: 睡眠時間に負の値）を送信し、適切なエラーメッセージが表示されることを確認する。

**ネットワークエラー**
開発者ツールでネットワークをオフラインに設定し、エラーメッセージが表示されることを確認する。

---

## 8. セキュリティ確認

### 8.1 HTTPS通信の確認

ブラウザのアドレスバーで鍵マークが表示されていることを確認する。すべての通信がHTTPSで行われていることを確認する。HTTPSでない場合、証明書の設定を確認する。VercelとRender.comは自動的にSSL証明書を提供するため、通常は設定不要である。

### 8.2 認証の確認

開発者ツールのApplicationタブでLocalStorageを確認する。トークンが保存されていることを確認する。ログアウト後、トークンが削除されることを確認する。

### 8.3 環境変数の確認

フロントエンドのソースコードに環境変数が埋め込まれていないことを確認する。ブラウザの開発者ツールでソースコードを表示し、APIキーやデータベース接続文字列が含まれていないことを確認する。ViteのVITE_プレフィックス付き変数のみがビルドに含まれる。

### 8.4 CORS設定の確認

異なるオリジンからAPI呼び出しを試み、適切にブロックされることを確認する。ブラウザのコンソールに「CORS policy」エラーが表示されることを確認する。許可されたオリジンからの呼び出しは正常に動作することを確認する。

---

## 9. 継続的デプロイの設定

GitHubのmainブランチへのプッシュで自動的にデプロイが実行される設定を確認する。

### 9.1 Vercelの自動デプロイ

Vercelはデフォルトでmainブランチへのプッシュを監視し、自動的にデプロイを実行する。Settings > Git > Production Branchでmainが設定されていることを確認する。プルリクエストごとにプレビューURLが自動生成される。

### 9.2 Render.comの自動デプロイ

Render.comもデフォルトでmainブランチへのプッシュを監視する。Settings > Build & Deployで Auto-Deployが有効になっていることを確認する。

### 9.3 デプロイの実行

コードを変更し、GitHubにプッシュする。

```bash
git add .
git commit -m "Update: [変更内容]"
git push origin main
```

VercelとRender.comのダッシュボードでデプロイが自動的に開始されることを確認する。デプロイ完了までフロントエンドは約2分、バックエンドは約3分を要する。

---

## 10. モニタリングとログ

### 10.1 Render.comでのモニタリング

Dashboardからmood-tracker-apiを選択し、Logsタブを開く。アプリケーションログがリアルタイムで表示される。エラーログを確認し、異常がないことを確認する。Metricsタブでは、CPU使用率、メモリ使用量、応答時間が表示される。

### 10.2 Vercelでのモニタリング

Deploymentsタブで各デプロイの詳細を確認できる。ビルドログ、関数ログが表示される。Analyticsタブでは、訪問者数、ページビュー、パフォーマンスメトリクスが表示される。無料プランでは過去7日間のデータが利用可能である。

### 10.3 Supabaseでのモニタリング

Database > Query Performanceでクエリのパフォーマンスを確認できる。遅いクエリが検出された場合、インデックスの追加を検討する。Usageタブでデータベース使用量、接続数を確認できる。

---

## 11. トラブルシューティング

### 11.1 CORSエラー

ブラウザのコンソールに「Access to fetch at 'https://mood-tracker-api.onrender.com/api/...' from origin 'https://mood-tracker-app.vercel.app' has been blocked by CORS policy」というエラーが表示される。

**原因**
バックエンドのCORS_ORIGIN環境変数がフロントエンドのURLと一致していない。

**解決方法**
Render.comのEnvironment設定でCORS_ORIGIN変数を確認する。フロントエンドのURLと完全に一致していることを確認する。プロトコル（https://）を含める必要がある。末尾のスラッシュは含めない。変更後、Render.comは自動的に再デプロイを実行する。

### 11.2 データベース接続エラー

バックエンドのログに「Failed to connect to database」というエラーが表示される。

**原因**
DATABASE_URL環境変数が正しくない、またはデータベースがアクティブでない。

**解決方法**
Render.comのEnvironment設定でDATABASE_URLを確認する。Supabaseのダッシュボードで接続文字列を再度コピーし、パスワード部分を実際のパスワードに置き換えたものと一致していることを確認する。Supabaseプロジェクトが一時停止されていないことを確認する。無料プランは7日間アクセスがない場合一時停止される。

### 11.3 ビルドエラー

Vercelのビルドログに「Error: Cannot find module ...」というエラーが表示される。

**原因**
依存関係が正しくインストールされていない、またはpackage.jsonが正しくない。

**解決方法**
ローカル環境でnpm run buildを実行し、同じエラーが発生するか確認する。依存関係を再インストールする（npm install）。package.jsonのdependenciesとdevDependenciesが正しく設定されていることを確認する。型定義ファイル（@types/...）がdevDependenciesに含まれていることを確認する。

### 11.4 環境変数が反映されない

APIキーやデータベース接続文字列が正しく設定されているにもかかわらず、エラーが発生する。

**原因**
環境変数の設定後に再デプロイが実行されていない、または環境変数名が正しくない。

**解決方法**
Viteの環境変数はVITE_プレフィックスが必要である。VITE_API_URLなど、プレフィックスが付いていることを確認する。環境変数を変更した場合、手動で再デプロイを実行する。Vercelの場合、Deploymentsタブから最新のデプロイを選択し、Redeployをクリックする。

### 11.5 コールドスタート遅延

Render.comの無料プランでバックエンドの初回アクセス時に30秒程度を要する。

**原因**
無料プランは15分間アクセスがない場合自動的にスリープする。次回アクセス時にコールドスタートが発生する。

**解決方法**
これはRender.comの無料プランの仕様である。頻繁にアクセスされる場合は有料プラン（月額7ドル）へのアップグレードを検討する。または、定期的にヘルスチェックエンドポイント（/health）にアクセスするcronジョブを外部から実行し、スリープを防ぐ方法もある。ただし、これはRender.comの利用規約に抵触する可能性があるため推奨しない。

---

## 12. 本番環境の運用

### 12.1 定期的な確認項目

以下の項目を定期的に確認する。

**週次確認**
- アプリケーションが正常にアクセス可能であること
- エラーログに異常がないこと
- データベースの使用量が上限に近づいていないこと

**月次確認**
- APIキーの有効期限と使用量
- データベースのストレージ使用量
- バックアップの実行状況

### 12.2 データベースバックアップ

Supabaseは自動的に毎日バックアップを作成する。無料プランでは7日間のバックアップが保持される。手動バックアップを作成する場合、Database > Backupsから実行する。

Neonも自動バックアップ機能を提供する。詳細はNeonのドキュメントを参照すること。

### 12.3 スケーリング

ユーザー数やデータ量が増加した場合、以下の対応を検討する。

**データベース**
- Supabaseの有料プラン（月額25ドル）: 8GBストレージ、無制限API呼び出し
- 専用インスタンスへの移行

**バックエンド**
- Render.comの有料プラン（月額7ドル）: コールドスタートなし、専用リソース
- 複数インスタンスの起動

**フロントエンド**
- Vercelの無料プランは個人プロジェクトには十分である
- 商用利用の場合は有料プラン（月額20ドル）を検討

---

## 13. デプロイ完了の確認

以下のすべての項目が完了していることを確認する。

**インフラストラクチャ**
- データベースが作成され、マイグレーションが完了している
- バックエンドがRender.comにデプロイされ、正常に動作している
- フロントエンドがVercelにデプロイされ、正常に動作している

**機能**
- ユーザー登録とログインが動作する
- 記録の作成、表示、更新、削除が動作する
- グラフが正常に表示される
- AI機能（アドバイス生成、分析）が動作する
- 気象データが自動的に保存される

**セキュリティ**
- すべての通信がHTTPSで行われている
- 環境変数が適切に管理されている
- JWT認証が正常に動作している
- CORS設定が適切に構成されている

**パフォーマンス**
- ページ読み込み時間が3秒以内である
- API応答時間が通常1秒以内である
- グラフの描画が2秒以内である

すべての項目が確認できた場合、デプロイは成功である。次のステップとして、Phase 5（テストとCI/CD）の実装を推奨する。
