-- ==========================================
-- 調子記録アプリ データベース初期化スクリプト
-- ==========================================

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
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sleep_hours DECIMAL(3,1),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  meal_quality INTEGER CHECK (meal_quality >= 1 AND meal_quality <= 10),
  meal_regularity INTEGER CHECK (meal_regularity >= 1 AND meal_regularity <= 10),
  exercise_minutes INTEGER CHECK (exercise_minutes >= 0),
  exercise_intensity INTEGER CHECK (exercise_intensity >= 1 AND exercise_intensity <= 10),
  emotion_score INTEGER CHECK (emotion_score >= 1 AND emotion_score <= 10),
  emotion_note TEXT,
  motivation_score INTEGER CHECK (motivation_score >= 1 AND motivation_score <= 10),
  activities_done TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- recordsテーブルのインデックス
CREATE INDEX idx_records_user_id ON records(user_id);
CREATE INDEX idx_records_recorded_at ON records(recorded_at);
CREATE INDEX idx_records_user_recorded ON records(user_id, recorded_at DESC);

-- ==========================================
-- weather_dataテーブル（気象データ）
-- ==========================================
CREATE TABLE weather_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  temperature DECIMAL(4,1),
  humidity INTEGER CHECK (humidity >= 0 AND humidity <= 100),
  weather_condition VARCHAR(50),
  location VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- weather_dataテーブルのインデックス
CREATE INDEX idx_weather_data_user_id ON weather_data(user_id);
CREATE INDEX idx_weather_data_recorded_at ON weather_data(recorded_at);

-- ==========================================
-- analysis_categoriesテーブル（分析観点）
-- ==========================================
CREATE TABLE analysis_categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- analysis_categoriesテーブルのインデックス
CREATE INDEX idx_analysis_categories_code ON analysis_categories(code);
CREATE INDEX idx_analysis_categories_active ON analysis_categories(is_active);

-- ==========================================
-- analysis_questionsテーブル（分析質問）
-- ==========================================
CREATE TABLE analysis_questions (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES analysis_categories(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  generated_by_ai BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- analysis_questionsテーブルのインデックス
CREATE INDEX idx_analysis_questions_category_id ON analysis_questions(category_id);
CREATE INDEX idx_analysis_questions_active ON analysis_questions(is_active);

-- ==========================================
-- analysis_answersテーブル（回答データ）
-- ==========================================
CREATE TABLE analysis_answers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_id INTEGER REFERENCES records(id) ON DELETE SET NULL,
  question_id INTEGER NOT NULL REFERENCES analysis_questions(id) ON DELETE CASCADE,
  answer_score INTEGER NOT NULL CHECK (answer_score >= 1 AND answer_score <= 10),
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- analysis_answersテーブルのインデックス
CREATE INDEX idx_analysis_answers_user_id ON analysis_answers(user_id);
CREATE INDEX idx_analysis_answers_question_id ON analysis_answers(question_id);
CREATE INDEX idx_analysis_answers_answered_at ON analysis_answers(answered_at);
CREATE INDEX idx_analysis_answers_record_id ON analysis_answers(record_id);

-- ==========================================
-- advice_historyテーブル（アドバイス履歴）
-- ==========================================
CREATE TABLE advice_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  advice_text TEXT NOT NULL,
  advice_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- advice_historyテーブルのインデックス
CREATE INDEX idx_advice_history_user_id ON advice_history(user_id);
CREATE INDEX idx_advice_history_created_at ON advice_history(created_at);

-- ==========================================
-- 初期データ投入
-- ==========================================

-- 分析観点の初期データ
INSERT INTO analysis_categories (code, name, description, display_order) VALUES
('stress', 'ストレス度', 'ストレスレベルを測定します', 1),
('sleep', '睡眠の質', '睡眠の質を評価します', 2),
('mood', '気分', '全体的な気分を測定します', 3),
('energy', 'エネルギー', '活力レベルを評価します', 4),
('focus', '集中力', '集中できる度合いを測定します', 5);

-- 分析質問の初期データ
INSERT INTO analysis_questions (category_id, question_text, display_order, generated_by_ai, usage_count) VALUES
-- ストレス度の質問
((SELECT id FROM analysis_categories WHERE code = 'stress'), '今日はストレスを感じましたか？', 1, false, 0),
((SELECT id FROM analysis_categories WHERE code = 'stress'), '不安や心配事がありましたか？', 2, false, 0),
((SELECT id FROM analysis_categories WHERE code = 'stress'), 'リラックスできる時間がありましたか？', 3, false, 0),

-- 睡眠の質の質問
((SELECT id FROM analysis_categories WHERE code = 'sleep'), 'よく眠れましたか？', 1, false, 0),
((SELECT id FROM analysis_categories WHERE code = 'sleep'), '朝すっきり目覚めましたか？', 2, false, 0),
((SELECT id FROM analysis_categories WHERE code = 'sleep'), '夜中に目が覚めましたか？', 3, false, 0),

-- 気分の質問
((SELECT id FROM analysis_categories WHERE code = 'mood'), '今日は気分が良かったですか？', 1, false, 0),
((SELECT id FROM analysis_categories WHERE code = 'mood'), 'ポジティブな気持ちでしたか？', 2, false, 0),
((SELECT id FROM analysis_categories WHERE code = 'mood'), '楽しい時間を過ごせましたか？', 3, false, 0),

-- エネルギーの質問
((SELECT id FROM analysis_categories WHERE code = 'energy'), '体に力がありましたか？', 1, false, 0),
((SELECT id FROM analysis_categories WHERE code = 'energy'), '疲れを感じましたか？', 2, false, 0),
((SELECT id FROM analysis_categories WHERE code = 'energy'), '活動的に過ごせましたか？', 3, false, 0),

-- 集中力の質問
((SELECT id FROM analysis_categories WHERE code = 'focus'), '集中して作業できましたか？', 1, false, 0),
((SELECT id FROM analysis_categories WHERE code = 'focus'), '気が散ることはありましたか？', 2, false, 0),
((SELECT id FROM analysis_categories WHERE code = 'focus'), 'タスクを完了できましたか？', 3, false, 0);

-- ==========================================
-- 完了メッセージ
-- ==========================================
SELECT 'Database schema created successfully!' AS message;
