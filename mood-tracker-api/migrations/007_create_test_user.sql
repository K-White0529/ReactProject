-- =====================================================
-- テストユーザー作成マイグレーション
-- =====================================================
-- 目的: E2Eテスト用の固定ユーザーを作成
-- ユーザー情報:
--   username: test_user
--   email: test@example.com
--   password: Test1234!
-- =====================================================

-- 注意: このSQLを実行する前に、パスワードハッシュを生成してください
-- 生成方法: cd mood-tracker-api && node scripts/generate-test-user-hash.js

-- テストユーザーを作成（既に存在する場合はスキップ）
INSERT INTO users (username, email, password_hash, created_at, updated_at)
VALUES (
  'test_user',
  'test@example.com',
  -- ⚠️ 以下のハッシュは 'Test1234!' のbcryptハッシュ（saltラウンド10）です
  -- 実際のハッシュは scripts/generate-test-user-hash.js を実行して取得してください
  '$2a$10$IBMry88YLRhbOjV9uoIrC.HMFx0YA/LGc3cb617E2vIp79EEYGzyW',
  NOW(),
  NOW()
)
ON CONFLICT (username) DO NOTHING;

-- 結果確認
SELECT id, username, email, created_at
FROM users
WHERE username = 'test_user';

-- =====================================================
-- マイグレーション完了
-- =====================================================
-- このユーザーでログインする方法:
--   username: test_user
--   password: Test1234!
-- =====================================================
