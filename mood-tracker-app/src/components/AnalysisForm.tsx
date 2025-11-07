import { useState, useEffect } from 'react';
import { getActiveQuestions, saveAnswers } from '../services/analysisService';
import type { AnalysisQuestion, AnalysisAnswerInput } from '../types';
import './AnalysisForm.css';

function AnalysisForm() {
  const [questions, setQuestions] = useState<AnalysisQuestion[]>([]);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await getActiveQuestions();
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '質問の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, score: number) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, score);
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // すべての質問に回答しているかチェック
    if (answers.size !== questions.length) {
      setError('すべての質問に回答してください');
      return;
    }

    setSaving(true);

    try {
      const answerList: AnalysisAnswerInput[] = Array.from(answers.entries()).map(
        ([question_id, answer_score]) => ({
          question_id,
          answer_score
        })
      );

      await saveAnswers(answerList);
      setSuccess(true);
      setAnswers(new Map());

      // 3秒後に成功メッセージを非表示
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '回答の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  // 観点ごとに質問をグループ化
  const groupedQuestions = questions.reduce((acc, question) => {
    const categoryName = question.category_name || '未分類';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(question);
    return acc;
  }, {} as Record<string, AnalysisQuestion[]>);

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="analysis-form-container">
        <h1 className="page-title">自己分析</h1>
        <div className="empty-state">
          <p>現在、利用可能な質問がありません。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-form-container">
      <h1 className="page-title">自己分析</h1>
      <p className="page-description">
        以下の質問に1〜10の段階で回答してください。あなたの調子を分析するために使用されます。
      </p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">回答を保存しました！</div>}

      <form onSubmit={handleSubmit} className="analysis-form">
        {Object.entries(groupedQuestions).map(([categoryName, categoryQuestions]) => (
          <section key={categoryName} className="form-section">
            <h2 className="section-title">{categoryName}</h2>

            {categoryQuestions.map((question) => (
              <div key={question.id} className="question-item">
                <label htmlFor={`question-${question.id}`} className="question-label">
                  {question.question_text}
                  {answers.has(question.id) && (
                    <span className="slider-value">{answers.get(question.id)}</span>
                  )}
                </label>
                <input
                  type="range"
                  id={`question-${question.id}`}
                  min="1"
                  max="10"
                  value={answers.get(question.id) ?? 5}
                  onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>1 低い</span>
                  <span>5</span>
                  <span>10 高い</span>
                </div>
              </div>
            ))}
          </section>
        ))}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? '保存中...' : '回答を保存'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AnalysisForm;