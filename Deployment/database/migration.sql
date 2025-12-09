-- ==========================================
-- 調子記録アプリ データベース初期化スクリプト
-- ==========================================
-- 注意: このファイルは E:\ReactProject\mood-tracker-api\migrations 
-- にあるマイグレーションファイルと同じ内容です

-- データベースのタイムゾーン設定
SET timezone = 'Asia/Tokyo';

-- ==========================================
-- テーブル削除（既存の場合）
-- ==========================================
DROP TABLE IF EXISTS advice_history CASCADE;
DROP TABLE IF EXISTS analysis_answers CASCADE;
DROP TABLE IF EXISTS analysis_questions CASCADE;
DROP TABLE IF EXISTS analysis_categories CASCADE;
DROP TABLE IF EXISTS weather_data CASCADE;
DROP TABLE IF EXISTS records CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==========================================
-- usersテーブル
-- ==========================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- usersテーブルのインデックス
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- ==========================================
-- recordsテーブル（記録データ）
-- ==========================================
CREATE TABLE records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 睡眠
  sleep_hours DECIMAL(3,1),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),

  -- 食事
  meal_quality INTEGER CHECK (meal_quality >= 1 AND meal_quality <= 10),
  meal_regularity INTEGER CHECK (meal_regularity >= 1 AND meal_regularity <= 10),

  -- 運動
  exercise_minutes INTEGER,
  exercise_intensity INTEGER CHECK (exercise_intensity >= 1 AND exercise_intensity <= 10),

  -- 感情
  emotion_score INTEGER CHECK (emotion_score >= 1 AND emotion_score <= 10),
  emotion_note TEXT,

  -- モチベーション
  motivation_score INTEGER CHECK (motivation_score >= 1 AND motivation_score <= 10),

  -- やったこと（文字列型）
  activities_done TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- recordsテーブルのインデックス
CREATE INDEX idx_records_user_id ON records(user_id);
CREATE INDEX idx_records_recorded_at ON records(recorded_at);

-- ==========================================
-- weather_dataテーブル（気象データ）
-- ==========================================
CREATE TABLE weather_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP NOT NULL,

  temperature DECIMAL(4,1),
  humidity INTEGER,
  pressure DECIMAL(6,2),
  weather_condition VARCHAR(100),
  weather_description TEXT,

  season VARCHAR(20),

  api_source VARCHAR(50),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- weather_dataテーブルのインデックス
CREATE INDEX idx_weather_user_id ON weather_data(user_id);
CREATE INDEX idx_weather_recorded_at ON weather_data(recorded_at);

-- ==========================================
-- analysis_categoriesテーブル（分析観点）
-- ==========================================
CREATE TABLE analysis_categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- analysis_categoriesテーブルのインデックス
CREATE INDEX idx_analysis_categories_code ON analysis_categories(code);

-- ==========================================
-- analysis_questionsテーブル（分析質問）
-- ==========================================
CREATE TABLE analysis_questions (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES analysis_categories(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  generated_by_ai BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- analysis_questionsテーブルのインデックス
CREATE INDEX idx_questions_category_id ON analysis_questions(category_id);
CREATE INDEX idx_questions_is_active ON analysis_questions(is_active);

-- ==========================================
-- analysis_answersテーブル（回答データ）
-- ==========================================
CREATE TABLE analysis_answers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_id INTEGER REFERENCES records(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES analysis_questions(id) ON DELETE CASCADE,
  answer_score INTEGER NOT NULL CHECK (answer_score >= 1 AND answer_score <= 10),
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- analysis_answersテーブルのインデックス
CREATE INDEX idx_answers_user_id ON analysis_answers(user_id);
CREATE INDEX idx_answers_record_id ON analysis_answers(record_id);
CREATE INDEX idx_answers_question_id ON analysis_answers(question_id);
CREATE INDEX idx_answers_answered_at ON analysis_answers(answered_at);

-- ==========================================
-- advice_historyテーブル（アドバイス履歴）
-- ==========================================
CREATE TABLE advice_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  advice_text TEXT NOT NULL,
  advice_type VARCHAR(50),
  based_on_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  displayed_at TIMESTAMP,
  was_helpful BOOLEAN
);

-- advice_historyテーブルのインデックス
CREATE INDEX idx_advice_user_id ON advice_history(user_id);
CREATE INDEX idx_advice_created_at ON advice_history(created_at);

-- ==========================================
-- 初期データ投入
-- ==========================================

-- 分析観点の初期データ（正しい3つのカテゴリ）
INSERT INTO analysis_categories (code, name, description) VALUES
('stress', 'ストレス', 'ストレスレベルを評価する質問'),
('concentration', '集中力', '集中力を評価する質問'),
('motivation', 'モチベーション', 'モチベーションを評価する質問')
ON CONFLICT (code) DO NOTHING;

-- 分析質問の初期データ（9つの質問）
INSERT INTO analysis_questions (category_id, question_text, is_active, generated_by_ai, usage_count) VALUES
-- ストレス関連
((SELECT id FROM analysis_categories WHERE code = 'stress'), '今日はストレスを感じましたか？', true, false, 0),
((SELECT id FROM analysis_categories WHERE code = 'stress'), '心身ともにリラックスできていますか？', true, false, 0),
((SELECT id FROM analysis_categories WHERE code = 'stress'), '不安や心配事がありますか？', true, false, 0),

-- 集中力関連
((SELECT id FROM analysis_categories WHERE code = 'concentration'), '今日は集中して作業できましたか？', true, false, 0),
((SELECT id FROM analysis_categories WHERE code = 'concentration'), '気が散ることなく物事に取り組めましたか？', true, false, 0),
((SELECT id FROM analysis_categories WHERE code = 'concentration'), '頭がすっきりしていますか？', true, false, 0),

-- モチベーション関連
((SELECT id FROM analysis_categories WHERE code = 'motivation'), '今日のやる気はどの程度ですか？', true, false, 0),
((SELECT id FROM analysis_categories WHERE code = 'motivation'), '目標に向かって前向きに取り組めていますか？', true, false, 0),
((SELECT id FROM analysis_categories WHERE code = 'motivation'), '新しいことに挑戦したい気持ちがありますか？', true, false, 0);

-- テストユーザーの作成
INSERT INTO users (username, email, password_hash, created_at, updated_at)
VALUES (
  'test_user',
  'test_user@example.com',
  '$2a$10$IBMry88YLRhbOjV9uoIrC.HMFx0YA/LGc3cb617E2vIp79EEYGzyW',
  NOW(),
  NOW()
)
ON CONFLICT (username) DO NOTHING;

-- ==========================================
-- 完了メッセージ
-- ==========================================
SELECT 'Database schema created successfully!' AS message;
