import { useState, useEffect } from 'react';
import { getRecords, getRecordStats, getChartData } from '../services/recordService';
import type { Record, RecordStats, ChartData } from '../types';
import { HiChartBar, HiCalendar, HiEmojiHappy, HiLightningBolt, HiPlus } from 'react-icons/hi';
import MoodChart from './charts/MoodChart';
import WeatherChart from './charts/WeatherChart';
import './Dashboard.css';

interface DashboardProps {
	onNavigate?: (page: string) => void;
}

function Dashboard({ onNavigate }: DashboardProps) {
	const [records, setRecords] = useState<Record[]>([]);
	const [stats, setStats] = useState<RecordStats | null>(null);
	const [chartData, setChartData] = useState<ChartData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);
			const [recordsData, statsData, chartDataResult] = await Promise.all([
				getRecords(10),
				getRecordStats(),
				getChartData()
			]);
			setRecords(recordsData);
			setStats(statsData);
			setChartData(chartDataResult);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
		} finally {
			setLoading(false);
		}
	};

	const handleQuickAction = (page: string) => {
		if (onNavigate) {
			onNavigate(page);
		}
	};

	const handleRecordClick = (recordId: number) => {
		if (onNavigate) {
			onNavigate(`record-detail/${recordId}`);
		}
	};

	if (loading) {
		return <div className="loading">読み込み中...</div>;
	}

	return (
		<div className="dashboard-content">
			<h1 className="page-title">ダッシュボード</h1>

			{error && <div className="error-message">{error}</div>}

			{/* グラフセクション */}
			{chartData && (chartData.mood.length > 0 || chartData.weather.length > 0) && (
				<div className="charts-section">
					{chartData.mood.length > 0 && (
						<div className="chart-card">
							<h3 className="chart-title">気分とモチベーションの推移</h3>
							<MoodChart data={chartData.mood} />
						</div>
					)}
					{chartData.weather.length > 0 && (
						<div className="chart-card">
							<h3 className="chart-title">気温と湿度の推移</h3>
							<WeatherChart data={chartData.weather} />
						</div>
					)}
				</div>
			)}

			{/* 統計パネル */}
			<div className="stats-grid">
				<div className="stat-card">
					<div className="stat-icon" style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #FFA07A 100%)' }}>
						<HiChartBar size={28} />
					</div>
					<div className="stat-content">
						<div className="stat-label">総記録数</div>
						<div className="stat-value">{stats?.total_records || 0}</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon" style={{ background: 'linear-gradient(135deg, #B4A7D6 0%, #D4C5F9 100%)' }}>
						<HiCalendar size={28} />
					</div>
					<div className="stat-content">
						<div className="stat-label">今週の記録</div>
						<div className="stat-value">{stats?.this_week_records || 0}</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon" style={{ background: 'linear-gradient(135deg, #FFD93D 0%, #FFA500 100%)' }}>
						<HiEmojiHappy size={28} />
					</div>
					<div className="stat-content">
						<div className="stat-label">平均気分</div>
						<div className="stat-value">
							{stats?.avg_emotion_score ? `${stats.avg_emotion_score}/10` : '-'}
						</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6BCB77 0%, #4D96A9 100%)' }}>
						<HiLightningBolt size={28} />
					</div>
					<div className="stat-content">
						<div className="stat-label">平均モチベーション</div>
						<div className="stat-value">
							{stats?.avg_motivation_score ? `${stats.avg_motivation_score}/10` : '-'}
						</div>
					</div>
				</div>
			</div>

			{/* クイックアクション */}
			<div className="quick-actions">
				<h2 className="section-title">クイックアクション</h2>
				<div className="action-buttons">
					<button className="action-button" onClick={() => handleQuickAction('record')}>
						<HiPlus size={24} />
						<span>データを登録</span>
					</button>
					<button className="action-button" onClick={() => handleQuickAction('analysis')}>
						<HiChartBar size={24} />
						<span>自己分析を行う</span>
					</button>
				</div>
			</div>

			{/* 最近の記録 */}
			<div className="recent-records">
				<h2 className="section-title">最近の記録</h2>
				{records.length === 0 ? (
					<div className="empty-state">
						<p>まだ記録がありません</p>
						<p>「データ登録」から記録を追加してみましょう！</p>
					</div>
				) : (
					<div className="records-grid">
						{records.map((record) => (
							<div
								key={record.id}
								className="record-card clickable"
								onClick={() => handleRecordClick(record.id)}
							>
								<div className="record-date">
									{new Date(record.recorded_at).toLocaleString('ja-JP', {
										year: 'numeric',
										month: '2-digit',
										day: '2-digit',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</div>
								<div className="record-scores">
									{record.emotion_score && (
										<div className="score-item">
											<span className="score-label">気分</span>
											<span className="score-value">{record.emotion_score}/10</span>
										</div>
									)}
									{record.motivation_score && (
										<div className="score-item">
											<span className="score-label">やる気</span>
											<span className="score-value">{record.motivation_score}/10</span>
										</div>
									)}
								</div>
								{record.activities_done && (
									<div className="record-activity">
										{record.activities_done.length > 50
											? `${record.activities_done.substring(0, 50)}...`
											: record.activities_done}
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default Dashboard;