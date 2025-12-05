/**
 * Web Vitals計測
 * 
 * Core Web Vitalsの計測と記録を行う
 * - LCP (Largest Contentful Paint): 最大コンテンツの描画時間
 * - INP (Interaction to Next Paint): インタラクションから次の描画までの時間
 * - CLS (Cumulative Layout Shift): 累積レイアウトシフト
 * - FCP (First Contentful Paint): 最初のコンテンツ描画
 * - TTFB (Time to First Byte): 最初のバイトまでの時間
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

// 計測結果を保存するための型
interface VitalsData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

// 計測結果の保存先
const vitalsData: VitalsData[] = [];

/**
 * 計測結果のレーティングを判定
 */
function getRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
  const { name, value } = metric;
  
  // 各メトリクスの閾値
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    INP: { good: 200, poor: 500 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  };
  
  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * 計測結果を処理
 */
function handleMetric(metric: Metric) {
  const data: VitalsData = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric),
    timestamp: Date.now(),
  };
  
  vitalsData.push(data);
  
  // コンソールに出力（開発環境のみ）
  if (import.meta.env.MODE === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: `${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'}`,
      rating: data.rating,
      delta: metric.delta,
      id: metric.id,
    });
  }
  
  // 本番環境では分析ツールに送信（例: Google Analytics）
  if (import.meta.env.MODE === 'production') {
    // TODO: 分析ツールへの送信処理を実装
    // 例: Google Analytics
    // window.gtag('event', metric.name, {
    //   value: Math.round(metric.value),
    //   metric_rating: data.rating,
    //   metric_delta: metric.delta,
    //   metric_id: metric.id,
    // });
  }
}

/**
 * Web Vitalsの計測を開始
 */
export function initWebVitals() {
  // 各メトリクスの計測を開始
  onCLS(handleMetric);
  onINP(handleMetric);
  onFCP(handleMetric);
  onLCP(handleMetric);
  onTTFB(handleMetric);
}

/**
 * 計測結果を取得
 */
export function getVitalsData(): VitalsData[] {
  return [...vitalsData];
}

/**
 * 計測結果のサマリーを取得
 */
export function getVitalsSummary() {
  if (vitalsData.length === 0) {
    return null;
  }
  
  // 各メトリクスの最新値を取得
  const summary: Record<string, VitalsData> = {};
  
  vitalsData.forEach(data => {
    if (!summary[data.name] || data.timestamp > summary[data.name].timestamp) {
      summary[data.name] = data;
    }
  });
  
  return summary;
}

/**
 * レーティングに基づくカラーコードを取得
 */
export function getRatingColor(rating: 'good' | 'needs-improvement' | 'poor'): string {
  switch (rating) {
    case 'good':
      return '#0cce6b'; // 緑
    case 'needs-improvement':
      return '#ffa400'; // オレンジ
    case 'poor':
      return '#ff4e42'; // 赤
  }
}

/**
 * メトリクス名の日本語表記を取得
 */
export function getMetricLabel(name: string): string {
  const labels: Record<string, string> = {
    LCP: 'Largest Contentful Paint',
    INP: 'Interaction to Next Paint',
    CLS: 'Cumulative Layout Shift',
    FCP: 'First Contentful Paint',
    TTFB: 'Time to First Byte',
  };
  
  return labels[name] || name;
}

/**
 * メトリクスの説明を取得
 */
export function getMetricDescription(name: string): string {
  const descriptions: Record<string, string> = {
    LCP: '最大コンテンツの描画時間（2.5秒以下が目標）',
    INP: 'インタラクションから次の描画までの時間（200ms以下が目標）',
    CLS: '累積レイアウトシフト（0.1以下が目標）',
    FCP: '最初のコンテンツ描画（1.8秒以下が目標）',
    TTFB: '最初のバイトまでの時間（800ms以下が目標）',
  };
  
  return descriptions[name] || '';
}
