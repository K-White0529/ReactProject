-- Mood Tracker Database Schema
-- Version: 001
-- Description: Initial schema creation

-- usersテーブル
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- recordsテーブル
CREATE TABLE IF NOT EXISTS records (
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

  -- やったこと
  activities_done TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_recorded_at ON records(recorded_at);

-- analysis_categoriesテーブル
CREATE TABLE IF NOT EXISTS analysis_categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- analysis_questionsテーブル
CREATE TABLE IF NOT EXISTS analysis_questions (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES analysis_categories(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  generated_by_ai BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_category_id ON analysis_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_is_active ON analysis_questions(is_active);

-- analysis_answersテーブル
CREATE TABLE IF NOT EXISTS analysis_answers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_id INTEGER REFERENCES records(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES analysis_questions(id) ON DELETE CASCADE,
  answer_score INTEGER NOT NULL CHECK (answer_score >= 1 AND answer_score <= 10),
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_answers_user_id ON analysis_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_record_id ON analysis_answers(record_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON analysis_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_answered_at ON analysis_answers(answered_at);

-- weather_dataテーブル
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

  api_source VARCHAR(50),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_weather_user_id ON weather_data(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_recorded_at ON weather_data(recorded_at);

-- advice_historyテーブル
CREATE TABLE IF NOT EXISTS advice_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  advice_text TEXT NOT NULL,
  advice_type VARCHAR(50),
  based_on_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  displayed_at TIMESTAMP,
  was_helpful BOOLEAN
);

CREATE INDEX IF NOT EXISTS idx_advice_user_id ON advice_history(user_id);
CREATE INDEX IF NOT EXISTS idx_advice_created_at ON advice_history(created_at);

-- マイグレーション完了メッセージ
SELECT 'Initial schema created successfully' AS status;