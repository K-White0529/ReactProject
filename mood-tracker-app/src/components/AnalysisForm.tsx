import { useState, useEffect } from 'react';
import { getCategoryScores, getCategoryTrends, analyzeUserData, type CategoryScore, type CategoryTrend, type AnalysisResponse } from '../services/analysisService';
import { HiArrowLeft, HiTrendingUp, HiTrendingDown, HiMinus, HiLightBulb, HiChartBar, HiRefresh } from 'react-icons/hi';
import CategoryRadarChart from './charts/CategoryRadarChart';
import CategoryTrendsChart from './charts/CategoryTrendsChart';
import './AnalysisForm.css';

interface AnalysisFormProps {
	onNavigate?: (page: string) => void;
}

function AnalysisForm({ onNavigate }: AnalysisFormProps) {
	const [period, setPeriod] = useState<string>('1week');
	const [categoryScores, setCategoryScores] = useState<CategoryScore[]>([]);
	const [categoryTrends, setCategoryTrends] = useState<CategoryTrend[]>([]);
	const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [aiLoading, setAiLoading] = useState(true);
	const [error, setError] = useState('');
	const [aiError, setAiError] = useState('');

	useEffect(() => {
		loadData();
	}, [period]);

	const loadData = async () => {
		try {
			setLoading(true);
			setError('');
			setAiLoading(true);
			setAiError('');

			// 期間をdaysに変換
			const daysMap: Record<string, number> = {
				'today': 1,
				'3days': 3,
				'1week': 7,
				'3weeks': 21
			};
			const days = daysMap[period] || 7;

			// グラフデータを先に読み込む
			const [scores, trends] = await Promise.all([
				getCategoryScores(period),
				getCategoryTrends(period)
			]);

			setCategoryScores(scores);
			setCategoryTrends(trends);
			setLoading(false);

			// AI分析は別途実行
			try {
				const aiAnalysis = await analyzeUserData(days);
				setAnalysisData(aiAnalysis);
				setAiLoading(false);
			} catch (aiErr) {
				console.error('AI分析エラー:', aiErr);
				setAiError(aiErr instanceof Error ? aiErr.message : 'AI分析に失敗しました');
				setAiLoading(false);
			}
		} catch (err) {
			console.error('データ取得エラー:', err);
			setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
			setLoading(false);
			setAiLoading(false);
		}
	};

	const handleBack = () => {
		if (onNavigate) {
			onNavigate('dashboard');
		}
	};

	const handleRefresh = async () => {
		await loadData();
	};

	const getPeriodLabel = (p: string) => {
		switch (p) {
			case 'today':
				return '今日';
			case '3days':
				return '直近3日間';
			case '1week':
				return '直近1週間';
			case '3weeks':
				return '直近3週間';
			default:
				return '';
		}
	};

	const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
		switch (trend) {
			case 'improving':
				return <HiTrendingUp size={28} className="trend-icon improving" />;
			case 'declining':
				return <HiTrendingDown size={28} className="trend-icon declining" />;
			case 'stable':
				return <HiMinus size={28} className="trend-icon stable" />;
		}
	};

	const getTrendLabel = (trend: 'improving' | 'stable' | 'declining') => {
		switch (trend) {
			case 'improving':
				return '改善傾向';
			case 'declining':
				return '低下傾向';
			case 'stable':
				return '安定';
		}
	};

	const getTrendClass = (trend: 'improving' | 'stable' | 'declining') => {
		switch (trend) {
			case 'improving':
				return 'trend-badge improving';
			case 'declining':
				return 'trend-badge declining';
			case 'stable':
				return 'trend-badge stable';
		}
	};

	if (loading) {
		return (
			<div className="analysis-container">
				<div className="loading">分析中...</div>
			</div>
		);
	}

	return (
		<div className="analysis-container">
			<div className="analysis-header">
				<button className="back-btn" onClick={handleBack}>
					<HiArrowLeft size={20} />
					戻る
				</button>
				<h1>分析結果</h1>
			</div>

			{error && <div className="error-message">{error}</div>}

			{/* 期間選択とリフレッシュボタン */}
			<div className="analysis-controls">
				<div className="period-buttons">
					<button 
						className={`period-btn ${period === 'today' ? 'active' : ''}`}
						onClick={() => setPeriod('today')}
					>
						今日
					</button>
					<button 
						className={`period-btn ${period === '3days' ? 'active' : ''}`}
						onClick={() => setPeriod('3days')}
					>
						直近3日間
					</button>
					<button 
						className={`period-btn ${period === '1week' ? 'active' : ''}`}
						onClick={() => setPeriod('1week')}
					>
						1週間
					</button>
					<button 
						className={`period-btn ${period === '3weeks' ? 'active' : ''}`}
						onClick={() => setPeriod('3weeks')}
					>
						3週間
					</button>
				</div>
				<button className="refresh-btn" onClick={handleRefresh}>
					<HiRefresh size={20} />
					再分析
				</button>
			</div>

			{/* レーダーチャート */}
			<div className="analysis-card">
				<h2 className="card-title">
					<HiChartBar size={24} />
					観点別スコア（{getPeriodLabel(period)}）
				</h2>
				<div className="chart-wrapper">
					<CategoryRadarChart data={categoryScores} />
				</div>
			</div>

			{/* スコア遷移グラフ */}
			<div className="analysis-card">
				<h2 className="card-title">
					<HiTrendingUp size={24} />
					スコアの遷移（{getPeriodLabel(period)}）
				</h2>
				<div className="chart-wrapper">
					<CategoryTrendsChart data={categoryTrends} />
				</div>
			</div>

			{/* AI分析結果 */}
			{aiLoading ? (
				<div className="analysis-card ai-loading-card">
					<h2 className="card-title">
						<HiChartBar size={24} />
						AI分析結果
					</h2>
					<div className="ai-loading-state">
						<div className="loading-spinner"></div>
						<p>分析中...</p>
						<p className="loading-hint">AIがデータを分析しています。しばらくお待ちください。</p>
					</div>
				</div>
			) : aiError ? (
				<div className="analysis-card ai-error-card">
					<h2 className="card-title">
						<HiChartBar size={24} />
						AI分析結果
					</h2>
					<div className="ai-error-state">
						<p className="error-message">{aiError}</p>
						<button className="retry-btn" onClick={handleRefresh}>
							<HiRefresh size={20} />
							再試行
						</button>
					</div>
				</div>
			) : analysisData ? (
				<>
					{/* サマリーセクション */}
					<div className="analysis-card summary-card">
						<h2 className="card-title">
							<HiChartBar size={24} />
							全体の状態
						</h2>
						<p className="summary-text">{analysisData.analysis.summary}</p>
					</div>

					{/* トレンドセクション */}
					<div className="analysis-card trends-card">
						<h2 className="card-title">
							<HiTrendingUp size={24} />
							傾向分析
						</h2>
						<div className="trends-grid">
							<div className="trend-item">
								<div className="trend-header">
									<h3>気分の傾向</h3>
									<div className={getTrendClass(analysisData.analysis.trends.emotion.trend)}>
										{getTrendIcon(analysisData.analysis.trends.emotion.trend)}
										<span>{getTrendLabel(analysisData.analysis.trends.emotion.trend)}</span>
									</div>
								</div>
								<p className="trend-description">{analysisData.analysis.trends.emotion.description}</p>
							</div>
							<div className="trend-item">
								<div className="trend-header">
									<h3>モチベーションの傾向</h3>
									<div className={getTrendClass(analysisData.analysis.trends.motivation.trend)}>
										{getTrendIcon(analysisData.analysis.trends.motivation.trend)}
										<span>{getTrendLabel(analysisData.analysis.trends.motivation.trend)}</span>
									</div>
								</div>
								<p className="trend-description">{analysisData.analysis.trends.motivation.description}</p>
							</div>
						</div>
					</div>

					{/* 相関関係セクション */}
					{analysisData.analysis.correlations.length > 0 && (
						<div className="analysis-card correlations-card">
							<h2 className="card-title">
								<HiChartBar size={24} />
								発見された相関関係
							</h2>
							<ul className="correlations-list">
								{analysisData.analysis.correlations.map((correlation, index) => (
									<li key={index} className="correlation-item">
										<span className="correlation-bullet">•</span>
										<span>{correlation}</span>
									</li>
								))}
							</ul>
						</div>
					)}

					{/* 推奨事項セクション */}
					{analysisData.analysis.recommendations.length > 0 && (
						<div className="analysis-card recommendations-card">
							<h2 className="card-title">
								<HiLightBulb size={24} />
								推奨事項
							</h2>
							<ul className="recommendations-list">
								{analysisData.analysis.recommendations.map((recommendation, index) => (
									<li key={index} className="recommendation-item">
										<div className="recommendation-number">{index + 1}</div>
										<span>{recommendation}</span>
									</li>
								))}
							</ul>
						</div>
					)}
				</>
			) : null}
		</div>
	);
}

export default AnalysisForm;
