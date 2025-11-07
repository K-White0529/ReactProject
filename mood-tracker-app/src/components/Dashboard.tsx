import { useState, useEffect } from 'react';
import { getRecords } from '../services/recordService';
import type { Record } from '../types';

function Dashboard() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await getRecords();
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '記録の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="dashboard-content">
      <h1 className="page-title">ダッシュボード</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="records-list">
        <h2>記録一覧（{records.length}件）</h2>
        {records.length === 0 ? (
          <div className="empty-state">
            <p>まだ記録がありません</p>
            <p>「データ登録」から記録を追加してみましょう！</p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="record-item">
              <h3>{new Date(record.recorded_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short'
              })}</h3>

              {/* 睡眠情報 */}
              {(record.sleep_hours || record.sleep_quality) && (
                <p>
                  <strong>睡眠:</strong>{' '}
                  {record.sleep_hours && `${record.sleep_hours}時間`}
                  {record.sleep_hours && record.sleep_quality && ' / '}
                  {record.sleep_quality && `質: ${record.sleep_quality}/10`}
                </p>
              )}

              {/* 食事情報 */}
              {(record.meal_quality || record.meal_regularity) && (
                <p>
                  <strong>食事:</strong>{' '}
                  {record.meal_quality && `質: ${record.meal_quality}/10`}
                  {record.meal_quality && record.meal_regularity && ' / '}
                  {record.meal_regularity && `規則性: ${record.meal_regularity}/10`}
                </p>
              )}

              {/* 運動情報 */}
              {(record.exercise_minutes || record.exercise_intensity) && (
                <p>
                  <strong>運動:</strong>{' '}
                  {record.exercise_minutes && `${record.exercise_minutes}分`}
                  {record.exercise_minutes && record.exercise_intensity && ' / '}
                  {record.exercise_intensity && `強度: ${record.exercise_intensity}/10`}
                </p>
              )}

              {/* 感情スコア */}
              {record.emotion_score && (
                <p>
                  <strong>気分:</strong> {record.emotion_score}/10
                </p>
              )}

              {/* モチベーション */}
              {record.motivation_score && (
                <p>
                  <strong>モチベーション:</strong> {record.motivation_score}/10
                </p>
              )}

              {/* やったこと */}
              {record.activities_done && (
                <p>
                  <strong>やったこと:</strong> {record.activities_done}
                </p>
              )}

              {/* メモ */}
              {record.emotion_note && (
                <p>
                  <strong>メモ:</strong> {record.emotion_note}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;