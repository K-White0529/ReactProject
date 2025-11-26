-- Mood Tracker Database Migration Script
-- 本番環境デプロイ用

-- このスクリプトは本番データベースで実行してください

-- ============================================
-- テーブル作成
-- ============================================

-- 1. ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 記録テーブル
CREATE TABLE IF NOT EXISTS records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sleep_hours DECIMAL(3,1),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  meal_quality INTEGER CHECK (meal_quality >= 1 AND meal_quality <= 10),
  meal_regularity INTEGER CHECK (meal_regularity >= 1 AND meal_regularity <= 10),
  exercise_minutes INTEGER,
  exercise_intensity INTEGER CHECK (exercise_intensity >= 1 AND exercise_intensity <= 10),
  emotion_score INTEGER CHECK (emotion_score >= 1 AND emotion_score <= 10),
  emotion_note TEXT,
  motivation_score INTEGER CHECK (motivation_score >= 1 AND motivation_score <= 10),
  activities_done TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 分析観点マスタ
CREATE TABLE IF NOT EXISTS analysis_categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 質問マスタ
CREATE TABLE IF NOT EXISTS analysis_questions (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES analysis_categories(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  generated_by_ai BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 回答データ
CREATE TABLE IF NOT EXISTS analysis_answers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_id INTEGER REFERENCES records(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES analysis_questions(id) ON DELETE CASCADE,
  answer_score INTEGER NOT NULL CHECK (answer_score >= 1 AND answer_score <= 10),
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 気象データ
CREATE TABLE IF NOT EXISTS weather_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP NOT NULL,
  temperature DECIMAL(4,1),
  humidity INTEGER,
  pressure DECIMAL(6,2),
  weather_condition VARCHAR(100),
  weather_description TEXT,
  season VARCHAR(20),
  location VARCHAR(255),
  api_source VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. アドバイス履歴
CREATE TABLE IF NOT EXISTS ai_advice (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  advice_text TEXT NOT NULL,
  advice_type VARCHAR(50),
  based_on_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  displayed_at TIMESTAMP,
  was_helpful BOOLEAN
);

-- ============================================
-- インデックス作成
-- ============================================

-- recordsテーブル
CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_recorded_at ON records(recorded_at);

-- analysis_questionsテーブル
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON analysis_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_is_active ON analysis_questions(is_active);

-- analysis_answersテーブル
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON analysis_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_record_id ON analysis_answers(record_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON analysis_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_answered_at ON analysis_answers(answered_at);

-- weather_dataテーブル
CREATE INDEX IF NOT EXISTS idx_weather_user_id ON weather_data(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_recorded_at ON weather_data(recorded_at);

-- ai_adviceテーブル
CREATE INDEX IF NOT EXISTS idx_advice_user_id ON ai_advice(user_id);
CREATE INDEX IF NOT EXISTS idx_advice_created_at ON ai_advice(created_at);

-- ============================================
-- 初期データ投入
-- ============================================

-- 分析観点の初期データ
INSERT INTO analysis_categories (code, name, description) VALUES
('stress', 'ストレス', 'ストレスレベルとその管理に関する分析'),
('focus', '集中力', '作業や学習における集中力に関する分析'),
('motivation', 'モチベーション', '目標達成へのモチベーションに関する分析'),
('sleep_quality', '睡眠の質', '睡眠の質と生活リズムに関する分析'),
('social', '社会的つながり', '人間関係とコミュニケーションに関する分析')
ON CONFLICT (code) DO NOTHING;

-- 質問の初期データ（各観点3つずつ）
INSERT INTO analysis_questions (category_id, question_text) VALUES
-- ストレス
((SELECT id FROM analysis_categories WHERE code = 'stress'), '今日のストレスレベルはどうでしたか？'),
((SELECT id FROM analysis_categories WHERE code = 'stress'), 'ストレスに対処できていると感じましたか？'),
((SELECT id FROM analysis_categories WHERE code = 'stress'), 'リラックスする時間が取れましたか？'),

-- 集中力
((SELECT id FROM analysis_categories WHERE code = 'focus'), '今日は集中して作業できましたか？'),
((SELECT id FROM analysis_categories WHERE code = 'focus'), '気が散ることは少なかったですか？'),
((SELECT id FROM analysis_categories WHERE code = 'focus'), '予定していたタスクを完了できましたか？'),

-- モチベーション
((SELECT id FROM analysis_categories WHERE code = 'motivation'), '今日はやる気に満ちていましたか？'),
((SELECT id FROM analysis_categories WHERE code = 'motivation'), '目標に向けて前進できたと感じますか？'),
((SELECT id FROM analysis_categories WHERE code = 'motivation'), '充実感を感じましたか？'),

-- 睡眠の質
((SELECT id FROM analysis_categories WHERE code = 'sleep_quality'), '昨晩はぐっすり眠れましたか？'),
((SELECT id FROM analysis_categories WHERE code = 'sleep_quality'), '起床時に疲れは取れていましたか？'),
((SELECT id FROM analysis_categories WHERE code = 'sleep_quality'), '夜中に何度も目覚めることはありませんでしたか？'),

-- 社会的つながり
((SELECT id FROM analysis_categories WHERE code = 'social'), '今日は誰かと有意義な会話ができましたか？'),
((SELECT id FROM analysis_categories WHERE code = 'social'), '孤独を感じることはありませんでしたか？'),
((SELECT id FROM analysis_categories WHERE code = 'social'), '周囲の人とのつながりを感じましたか？')
ON CONFLICT DO NOTHING;

-- ============================================
-- 完了メッセージ
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully';
  RAISE NOTICE 'Tables created: users, records, analysis_categories, analysis_questions, analysis_answers, weather_data, ai_advice';
  RAISE NOTICE 'Indexes created successfully';
  RAISE NOTICE 'Initial data inserted';
END $$;
