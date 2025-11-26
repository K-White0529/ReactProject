import { useState, useEffect } from 'react';
import { analyzeUserData, type AnalysisResponse, type AnalysisTrend } from '../services/analysisService';
import { HiArrowLeft, HiTrendingUp, HiTrendingDown, HiMinus, HiLightBulb, HiChartBar } from 'react-icons/hi';
import './AnalysisResult.css';

interface AnalysisResultProps {
	onNavigate?: (page: string) => void;
}

function AnalysisResult({ onNavigate }: AnalysisResultProps) {
	const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [analysisDays, setAnalysisDays] = useState(14);

	useEffect(() => {
		loadAnalysis();
	}, []);

	const loadAnalysis = async (days: number = analysisDays) => {
		try {
			setLoading(true);
			setError('');
			const data = await analyzeUserData(days);
			setAnalysisData(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'データの分析に失敗しました');
		} finally {
			setLoading(false);
		}
	};

	const handleBack = () => {
		if (onNavigate) {
			onNavigate('dashboard');
		}
	};

	const handleRefresh = async () => {
		await loadAnalysis(analysisDays);
	};

	const handleDaysChange = async (days: number) => {
		setAnalysisDays(days);
		await loadAnalysis(days);
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
			<div className="analysis-result-container">
				<div className="loading">分析中...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="analysis-result-container">
				<div className="error-container">
					<p className="error-message">{error}</p>
					<button className="back-btn" onClick={handleBack}>
						<HiArrowLeft size={20} />
						ダッシュボードに戻る
					</button>
				</div>
			</div>
		);
	}

	if (!analysisData) {
		return (
			<div className="analysis-result-container">
				<div className="empty-state">
					<p>分析結果がありません</p>
					<button className="back-btn" onClick={handleBack}>
						<HiArrowLeft size={20} />
						ダッシュボードに戻る
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="analysis-result-container">
			<div className="analysis-result-header">
				<button className="back-btn" onClick={handleBack}>
					<HiArrowLeft size={20} />
					戻る
				</button>
				<h1>AI分析結果</h1>
				<p className="analysis-period">
					分析期間: {new Date(analysisData.period.startDate).toLocaleDateString('ja-JP')} 〜 {new Date(analysisData.period.endDate).toLocaleDateString('ja-JP')} （{analysisData.period.days}日間）
				</p>
			</div>

			<div className="analysis-controls">
				<div className="period-buttons">
					<button 
						className={`period-btn ${analysisDays === 7 ? 'active' : ''}`}
						onClick={() => handleDaysChange(7)}
					>
						7日間
					</button>
					<button 
						className={`period-btn ${analysisDays === 14 ? 'active' : ''}`}
						onClick={() => handleDaysChange(14)}
					>
						14日間
					</button>
					<button 
						className={`period-btn ${analysisDays === 30 ? 'active' : ''}`}
						onClick={() => handleDaysChange(30)}
					>
						30日間
					</button>
				</div>
				<button className="refresh-btn" onClick={handleRefresh}>
					<HiChartBar size={20} />
					再分析
				</button>
			</div>

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
		</div>
	);
}

export default AnalysisResult;
