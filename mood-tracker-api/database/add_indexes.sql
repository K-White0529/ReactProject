-- ====================================================================
-- データベースクエリ最適化: インデックス追加
-- ====================================================================
-- 作成日: 2024年12月2日
-- 目的: クエリパフォーマンスの向上（70%短縮目標）
-- ====================================================================

-- ====================================================================
-- 1. records テーブルのインデックス
-- ====================================================================

-- 既存のインデックス確認用クエリ
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'records';

-- ユーザーIDと記録日時の複合インデックス（記録一覧取得の高速化）
CREATE INDEX IF NOT EXISTS idx_records_user_id_recorded_at 
ON records(user_id, recorded_at DESC);

-- 説明: 
-- - 最もよく使われるクエリパターン: WHERE user_id = ? ORDER BY recorded_at DESC
-- - DESC指定により降順ソートのパフォーマンス向上

-- ====================================================================
-- 2. analysis_answers テーブルのインデックス
-- ====================================================================

-- ユーザーIDと回答日時の複合インデックス（分析データ取得の高速化）
CREATE INDEX IF NOT EXISTS idx_analysis_answers_user_id_answered_at 
ON analysis_answers(user_id, answered_at DESC);

-- ユーザーIDと質問IDの複合インデックス（特定質問の回答取得）
CREATE INDEX IF NOT EXISTS idx_analysis_answers_user_question 
ON analysis_answers(user_id, question_id);

-- 説明:
-- - 分析画面での期間指定取得に最適化
-- - 特定質問の回答履歴取得に最適化

-- ====================================================================
-- 3. weather_data テーブルのインデックス
-- ====================================================================

-- ユーザーIDと記録日時の複合インデックス（気象データ取得の高速化）
CREATE INDEX IF NOT EXISTS idx_weather_data_user_id_recorded_at 
ON weather_data(user_id, recorded_at DESC);

-- 記録日時のインデックス（日付範囲検索用）
CREATE INDEX IF NOT EXISTS idx_weather_data_recorded_at 
ON weather_data(recorded_at DESC);

-- 説明:
-- - グラフ表示での気象データ取得に最適化
-- - JOIN時のパフォーマンス向上

-- ====================================================================
-- 4. advice_history テーブルのインデックス
-- ====================================================================

-- ユーザーIDと作成日時の複合インデックス（アドバイス履歴取得の高速化）
CREATE INDEX IF NOT EXISTS idx_advice_history_user_id_created_at 
ON advice_history(user_id, created_at DESC);

-- 説明:
-- - アドバイス履歴画面での表示に最適化
-- - 最新アドバイス取得に最適化

-- ====================================================================
-- 5. analysis_questions テーブルのインデックス
-- ====================================================================

-- カテゴリーIDと有効フラグの複合インデックス（質問取得の高速化）
CREATE INDEX IF NOT EXISTS idx_analysis_questions_category_active 
ON analysis_questions(category_id, is_active);

-- 説明:
-- - 有効な質問のみを取得するクエリに最適化
-- - カテゴリー別の質問取得に最適化

-- ====================================================================
-- インデックス作成完了確認
-- ====================================================================

-- 全テーブルのインデックス一覧を表示
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ====================================================================
-- パフォーマンス測定用クエリ例
-- ====================================================================

-- 1. 記録一覧取得（最もよく使われるクエリ）
-- EXPLAIN ANALYZE
-- SELECT * FROM records 
-- WHERE user_id = 1 
-- ORDER BY recorded_at DESC 
-- LIMIT 10;

-- 2. グラフデータ取得（時間単位集約）
-- EXPLAIN ANALYZE
-- SELECT 
--     DATE_TRUNC('hour', recorded_at) as hour,
--     AVG(emotion_score) as avg_emotion,
--     AVG(motivation_score) as avg_motivation
-- FROM records
-- WHERE user_id = 1 
--     AND recorded_at >= NOW() - INTERVAL '7 days'
-- GROUP BY DATE_TRUNC('hour', recorded_at)
-- ORDER BY hour ASC;

-- 3. 気象データとのJOIN
-- EXPLAIN ANALYZE
-- SELECT r.*, w.temperature, w.humidity, w.weather_condition
-- FROM records r
-- LEFT JOIN weather_data w ON r.user_id = w.user_id 
--     AND DATE(r.recorded_at) = DATE(w.recorded_at)
-- WHERE r.user_id = 1
-- ORDER BY r.recorded_at DESC
-- LIMIT 10;

-- ====================================================================
-- 期待される効果
-- ====================================================================

-- 記録一覧取得: 500ms → 100ms（80%短縮）
-- グラフデータ取得: 2秒 → 400ms（80%短縮）
-- 分析データ取得: 1秒 → 200ms（80%短縮）
-- アドバイス履歴: 300ms → 60ms（80%短縮）

-- ====================================================================
-- 注意事項
-- ====================================================================

-- 1. IF NOT EXISTS を使用しているため、複数回実行しても安全
-- 2. インデックス作成中はテーブルがロックされる可能性がある
-- 3. 本番環境では負荷の低い時間帯に実行推奨
-- 4. インデックス作成後は VACUUM ANALYZE の実行を推奨

-- インデックス作成後の統計情報更新
VACUUM ANALYZE records;
VACUUM ANALYZE analysis_answers;
VACUUM ANALYZE weather_data;
VACUUM ANALYZE advice_history;
VACUUM ANALYZE analysis_questions;
