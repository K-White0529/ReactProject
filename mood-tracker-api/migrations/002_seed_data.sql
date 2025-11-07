-- Seed Data for Mood Tracker
-- Version: 002
-- Description: Initial seed data

-- 分析観点マスタのデータ投入
INSERT INTO analysis_categories (code, name, description) VALUES
('stress', 'ストレス', 'ストレスレベルを評価する質問'),
('concentration', '集中力', '集中力を評価する質問'),
('motivation', 'モチベーション', 'モチベーションを評価する質問')
ON CONFLICT (code) DO NOTHING;

-- 初期質問データの投入
INSERT INTO analysis_questions (category_id, question_text, is_active, generated_by_ai) VALUES
-- ストレス関連
((SELECT id FROM analysis_categories WHERE code = 'stress'), '今日はストレスを感じましたか？', true, false),
((SELECT id FROM analysis_categories WHERE code = 'stress'), '心身ともにリラックスできていますか？', true, false),
((SELECT id FROM analysis_categories WHERE code = 'stress'), '不安や心配事がありますか？', true, false),

-- 集中力関連
((SELECT id FROM analysis_categories WHERE code = 'concentration'), '今日は集中して作業できましたか？', true, false),
((SELECT id FROM analysis_categories WHERE code = 'concentration'), '気が散ることなく物事に取り組めましたか？', true, false),
((SELECT id FROM analysis_categories WHERE code = 'concentration'), '頭がすっきりしていますか？', true, false),

-- モチベーション関連
((SELECT id FROM analysis_categories WHERE code = 'motivation'), '今日のやる気はどの程度ですか？', true, false),
((SELECT id FROM analysis_categories WHERE code = 'motivation'), '目標に向かって前向きに取り組めていますか？', true, false),
((SELECT id FROM analysis_categories WHERE code = 'motivation'), '新しいことに挑戦したい気持ちがありますか？', true, false);

-- テストユーザーの作成（パスワードは仮のハッシュ値）
INSERT INTO users (username, email, password_hash) VALUES
('testuser', 'test@example.com', '$2a$10$dummyhashvalue123456789012345678901234567890')
ON CONFLICT (username) DO NOTHING;

-- サンプルレコードの投入
INSERT INTO records (
  user_id, recorded_at,
  sleep_hours, sleep_quality,
  meal_quality, meal_regularity,
  exercise_minutes, exercise_intensity,
  emotion_score, emotion_note,
  motivation_score, activities_done
) VALUES
(
  (SELECT id FROM users WHERE username = 'testuser'),
  CURRENT_TIMESTAMP - INTERVAL '1 day',
  7.5, 8,
  7, 8,
  30, 6,
  8, '朝から気分が良い',
  7, 'プロジェクトの企画書を作成した'
);

-- シード完了メッセージ
SELECT 'Seed data inserted successfully' AS status;