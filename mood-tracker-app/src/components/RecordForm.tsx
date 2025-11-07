import { useState } from 'react';
import { createRecord } from '../services/recordService';
import type { RecordInput } from '../types';
import './RecordForm.css';

function RecordForm() {
  const [formData, setFormData] = useState<RecordInput>({
    sleep_hours: undefined,
    sleep_quality: undefined,
    meal_quality: undefined,
    meal_regularity: undefined,
    exercise_minutes: undefined,
    exercise_intensity: undefined,
    emotion_score: undefined,
    emotion_note: '',
    motivation_score: undefined,
    activities_done: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleNumberChange = (field: keyof RecordInput, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setFormData({
      ...formData,
      [field]: numValue
    });
  };

  const handleSliderChange = (field: keyof RecordInput, value: number) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleTextChange = (field: keyof RecordInput, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await createRecord(formData);
      setSuccess(true);

      // フォームをリセット
      setFormData({
        sleep_hours: undefined,
        sleep_quality: undefined,
        meal_quality: undefined,
        meal_regularity: undefined,
        exercise_minutes: undefined,
        exercise_intensity: undefined,
        emotion_score: undefined,
        emotion_note: '',
        motivation_score: undefined,
        activities_done: ''
      });

      // 3秒後に成功メッセージを非表示
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '記録の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="record-form-container">
      <h1 className="page-title">データ登録</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">記録を保存しました！</div>}

      <form onSubmit={handleSubmit} className="record-form">
        {/* 睡眠セクション */}
        <section className="form-section">
          <h2 className="section-title">睡眠</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sleep_hours">睡眠時間（時間）</label>
              <input
                type="number"
                id="sleep_hours"
                min="0"
                max="24"
                step="0.5"
                value={formData.sleep_hours ?? ''}
                onChange={(e) => handleNumberChange('sleep_hours', e.target.value)}
                placeholder="例: 7.5"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="sleep_quality">
              睡眠の質
              {formData.sleep_quality !== undefined && (
                <span className="slider-value">{formData.sleep_quality}</span>
              )}
            </label>
            <input
              type="range"
              id="sleep_quality"
              min="1"
              max="10"
              value={formData.sleep_quality ?? 5}
              onChange={(e) => handleSliderChange('sleep_quality', parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>悪い</span>
              <span>普通</span>
              <span>良い</span>
            </div>
          </div>
        </section>

        {/* 食事セクション */}
        <section className="form-section">
          <h2 className="section-title">食事</h2>
          <div className="form-group">
            <label htmlFor="meal_quality">
              食事の質
              {formData.meal_quality !== undefined && (
                <span className="slider-value">{formData.meal_quality}</span>
              )}
            </label>
            <input
              type="range"
              id="meal_quality"
              min="1"
              max="10"
              value={formData.meal_quality ?? 5}
              onChange={(e) => handleSliderChange('meal_quality', parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>悪い</span>
              <span>普通</span>
              <span>良い</span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="meal_regularity">
              食事の規則性
              {formData.meal_regularity !== undefined && (
                <span className="slider-value">{formData.meal_regularity}</span>
              )}
            </label>
            <input
              type="range"
              id="meal_regularity"
              min="1"
              max="10"
              value={formData.meal_regularity ?? 5}
              onChange={(e) => handleSliderChange('meal_regularity', parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>不規則</span>
              <span>普通</span>
              <span>規則的</span>
            </div>
          </div>
        </section>

        {/* 運動セクション */}
        <section className="form-section">
          <h2 className="section-title">運動</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="exercise_minutes">運動時間（分）</label>
              <input
                type="number"
                id="exercise_minutes"
                min="0"
                value={formData.exercise_minutes ?? ''}
                onChange={(e) => handleNumberChange('exercise_minutes', e.target.value)}
                placeholder="例: 30"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="exercise_intensity">
              運動強度
              {formData.exercise_intensity !== undefined && (
                <span className="slider-value">{formData.exercise_intensity}</span>
              )}
            </label>
            <input
              type="range"
              id="exercise_intensity"
              min="1"
              max="10"
              value={formData.exercise_intensity ?? 5}
              onChange={(e) => handleSliderChange('exercise_intensity', parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>軽い</span>
              <span>普通</span>
              <span>激しい</span>
            </div>
          </div>
        </section>

        {/* 感情セクション */}
        <section className="form-section">
          <h2 className="section-title">感情</h2>
          <div className="form-group">
            <label htmlFor="emotion_score">
              気分スコア
              {formData.emotion_score !== undefined && (
                <span className="slider-value">{formData.emotion_score}</span>
              )}
            </label>
            <input
              type="range"
              id="emotion_score"
              min="1"
              max="10"
              value={formData.emotion_score ?? 5}
              onChange={(e) => handleSliderChange('emotion_score', parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>😢 悪い</span>
              <span>😐 普通</span>
              <span>😊 良い</span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="emotion_note">感情のメモ</label>
            <textarea
              id="emotion_note"
              rows={3}
              value={formData.emotion_note}
              onChange={(e) => handleTextChange('emotion_note', e.target.value)}
              placeholder="今日の気分について..."
            />
          </div>
        </section>

        {/* モチベーションセクション */}
        <section className="form-section">
          <h2 className="section-title">モチベーション</h2>
          <div className="form-group">
            <label htmlFor="motivation_score">
              モチベーション
              {formData.motivation_score !== undefined && (
                <span className="slider-value">{formData.motivation_score}</span>
              )}
            </label>
            <input
              type="range"
              id="motivation_score"
              min="1"
              max="10"
              value={formData.motivation_score ?? 5}
              onChange={(e) => handleSliderChange('motivation_score', parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>低い</span>
              <span>普通</span>
              <span>高い</span>
            </div>
          </div>
        </section>

        {/* やったことセクション */}
        <section className="form-section">
          <h2 className="section-title">やったこと</h2>
          <div className="form-group">
            <label htmlFor="activities_done">今日やったこと</label>
            <textarea
              id="activities_done"
              rows={4}
              value={formData.activities_done}
              onChange={(e) => handleTextChange('activities_done', e.target.value)}
              placeholder="今日行った活動や達成したこと..."
            />
          </div>
        </section>

        {/* 送信ボタン */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '保存中...' : '記録を保存'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RecordForm;