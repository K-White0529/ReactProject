import { useState, useEffect } from 'react';
import { getVitalsSummary, getRatingColor, getMetricLabel, getMetricDescription } from '../utils/webVitals';
import './WebVitalsDashboard.css';

function WebVitalsDashboard() {
  const [summary, setSummary] = useState<ReturnType<typeof getVitalsSummary>>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 5秒ごとに計測結果を更新
    const interval = setInterval(() => {
      setSummary(getVitalsSummary());
    }, 5000);

    // 初回読み込み
    setSummary(getVitalsSummary());

    return () => clearInterval(interval);
  }, []);

  // 開発環境以外では表示しない
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  if (!summary) {
    return null;
  }

  const metrics = Object.entries(summary);

  return (
    <>
      {/* 浮動ボタン */}
      <button
        className="web-vitals-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Web Vitals"
      >
        📊
      </button>

      {/* ダッシュボード */}
      {isOpen && (
        <div className="web-vitals-dashboard">
          <div className="web-vitals-header">
            <h3>Web Vitals</h3>
            <button
              className="web-vitals-close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="web-vitals-content">
            {metrics.length === 0 ? (
              <div className="web-vitals-empty">
                計測中...
              </div>
            ) : (
              metrics.map(([name, data]) => (
                <div key={name} className="web-vitals-metric">
                  <div className="metric-header">
                    <span className="metric-name">{name}</span>
                    <span
                      className="metric-value"
                      style={{ color: getRatingColor(data.rating) }}
                    >
                      {name === 'CLS'
                        ? data.value.toFixed(3)
                        : `${Math.round(data.value)}ms`}
                    </span>
                  </div>
                  <div className="metric-label">{getMetricLabel(name)}</div>
                  <div className="metric-description">
                    {getMetricDescription(name)}
                  </div>
                  <div className="metric-bar">
                    <div
                      className="metric-bar-fill"
                      style={{
                        width: `${getBarWidth(name, data.value)}%`,
                        backgroundColor: getRatingColor(data.rating),
                      }}
                    />
                  </div>
                  <div className="metric-rating">
                    <span
                      className={`rating-badge rating-${data.rating}`}
                      style={{ backgroundColor: getRatingColor(data.rating) }}
                    >
                      {getRatingText(data.rating)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="web-vitals-footer">
            <small>5秒ごとに自動更新</small>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * バーの幅を計算（パーセンテージ）
 */
function getBarWidth(name: string, value: number): number {
  const maxValues: Record<string, number> = {
    LCP: 4000,
    INP: 500,
    CLS: 0.25,
    FCP: 3000,
    TTFB: 1800,
  };

  const max = maxValues[name] || 1000;
  return Math.min((value / max) * 100, 100);
}

/**
 * レーティングのテキストを取得
 */
function getRatingText(rating: 'good' | 'needs-improvement' | 'poor'): string {
  switch (rating) {
    case 'good':
      return '良好';
    case 'needs-improvement':
      return '改善可能';
    case 'poor':
      return '要改善';
  }
}

export default WebVitalsDashboard;
