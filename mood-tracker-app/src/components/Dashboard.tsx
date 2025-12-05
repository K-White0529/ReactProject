import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { getRecords, getRecordStats, getChartData } from '../services/recordService';
import type { Record, RecordStats, ChartData } from '../types';
import { HiChartBar, HiCalendar, HiEmojiHappy, HiLightningBolt, HiPlus } from 'react-icons/hi';
import MoodChart from './charts/MoodChart';
import WeatherChart from './charts/WeatherChart';
import AdviceCard from './AdviceCard';
import { useRenderLogger } from '../utils/performanceMonitor';
import './Dashboard.css';

interface DashboardProps {
	onNavigate?: (page: string) => void;
}

// 統計カードコンポーネントをメモ化
interface StatCardProps {
	icon: React.ReactNode;
	label: string;
	value: string | number;
	gradient: string;
}

const StatCard = memo(({ icon, label, value, gradient }: StatCardProps) => (
	<div className="stat-card">
		<div className="stat-icon" style={{ background: gradient }}>
			{icon}
		</div>
		<div className="stat-content">
			<div className="stat-label">{label}</div>
			<div className="stat-value">{value}</div>
		</div>
	</div>
));

StatCard.displayName = 'StatCard';

// 記録カードコンポーネントをメモ化
interface RecordCardProps {
	record: Record;
	onClick: (id: number) => void;
}

const RecordCard = memo(({ record, onClick }: RecordCardProps) => {
	const handleClick = useCallback(() => {
		onClick(record.id);
	}, [record.id, onClick]);

	const formattedDate = useMemo(() => {
		return new Date(record.recorded_at).toLocaleString('ja-JP', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}, [record.recorded_at]);

	const truncatedActivity = useMemo(() => {
		if (!record.activities_done) return null;
		return record.activities_done.length > 50
			? `${record.activities_done.substring(0, 50)}...`
			: record.activities_done;
	}, [record.activities_done]);

	return (
		<div className="record-card clickable" onClick={handleClick}>
			<div className="record-date">{formattedDate}</div>
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
			{truncatedActivity && (
				<div className="record-activity">{truncatedActivity}</div>
			)}
		</div>
	);
});

RecordCard.displayName = 'RecordCard';

function Dashboard({ onNavigate }: DashboardProps) {
	useRenderLogger('Dashboard');
	
	const [records, setRecords] = useState<Record[]>([]);
	const [stats, setStats] = useState<RecordStats | null>(null);
	const [chartData, setChartData] = useState<ChartData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');
	const [chartRange, setChartRange] = useState<string>('3weeks');
	const [showSuccessNotification, setShowSuccessNotification] = useState(false);

	// データ読み込み関数をuseCallbackでメモ化
	const loadData = useCallback(async () => {
		try {
			setLoading(true);
			const [recordsData, statsData, chartDataResult] = await Promise.all([
				getRecords(10),
				getRecordStats(),
				getChartData(chartRange)
			]);
			setRecords(recordsData);
			setStats(statsData);
			setChartData(chartDataResult);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
		} finally {
			setLoading(false);
		}
	}, [chartRange]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// 記録保存成功イベントをリスン
	useEffect(() => {
		const handleRecordSaved = () => {
			setShowSuccessNotification(true);
			setTimeout(() => {
				setShowSuccessNotification(false);
			}, 5000);
		};

		window.addEventListener('recordSaved', handleRecordSaved);

		return () => {
			window.removeEventListener('recordSaved', handleRecordSaved);
		};
	}, []);

	// イベントハンドラーをuseCallbackでメモ化
	const handleCloseNotification = useCallback(() => {
		setShowSuccessNotification(false);
	}, []);

	const handleQuickAction = useCallback((page: string) => {
		if (onNavigate) {
			onNavigate(page);
		}
	}, [onNavigate]);

	const handleRecordClick = useCallback((recordId: number) => {
		if (onNavigate) {
			onNavigate(`record-detail/${recordId}`);
		}
	}, [onNavigate]);

	const handleRangeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		setChartRange(e.target.value);
	}, []);

	// 統計値の表示をuseMemoでメモ化
	const statsDisplay = useMemo(() => {
		if (!stats) return null;

		return (
			<div className="stats-grid">
				<StatCard
					icon={<HiChartBar size={28} />}
					label="総記録数"
					value={stats.total_records || 0}
					gradient="linear-gradient(135deg, #FF6B9D 0%, #FFA07A 100%)"
				/>
				<StatCard
					icon={<HiCalendar size={28} />}
					label="今週の記録"
					value={stats.this_week_records || 0}
					gradient="linear-gradient(135deg, #B4A7D6 0%, #D4C5F9 100%)"
				/>
				<StatCard
					icon={<HiEmojiHappy size={28} />}
					label="平均気分"
					value={stats.avg_emotion_score ? `${stats.avg_emotion_score}/10` : '-'}
					gradient="linear-gradient(135deg, #FFD93D 0%, #FFA500 100%)"
				/>
				<StatCard
					icon={<HiLightningBolt size={28} />}
					label="平均モチベーション"
					value={stats.avg_motivation_score ? `${stats.avg_motivation_score}/10` : '-'}
					gradient="linear-gradient(135deg, #6BCB77 0%, #4D96A9 100%)"
				/>
			</div>
		);
	}, [stats]);

	// 記録リストの表示をuseMemoでメモ化
	const recordsList = useMemo(() => {
		if (records.length === 0) {
			return (
				<div className="empty-state">
					<p>まだ記録がありません</p>
					<p>「データ登録」から記録を追加してみましょう！</p>
				</div>
			);
		}

		return (
			<div className="records-grid">
				{records.map((record) => (
					<RecordCard
						key={record.id}
						record={record}
						onClick={handleRecordClick}
					/>
				))}
			</div>
		);
	}, [records, handleRecordClick]);

	if (loading) {
		return <div className="loading">読み込み中...</div>;
	}

	return (
		<div className="dashboard-content">
			{/* 成功通知 */}
			{showSuccessNotification && (
				<div className="floating-notification">
					<span>記録を保存しました！</span>
					<button
						className="notification-close"
						onClick={handleCloseNotification}
						aria-label="閉じる"
					>
						×
					</button>
				</div>
			)}

			<h1 className="page-title">ダッシュボード</h1>

			{error && <div className="error-message">{error}</div>}

			{/* アドバイスカード */}
			<AdviceCard onNavigateToHistory={() => handleQuickAction('advice-history')} />

			{/* グラフ範囲選択 */}
			<div className="chart-range-selector">
				<label htmlFor="chart-range">表示範囲：</label>
				<select
					id="chart-range"
					value={chartRange}
					onChange={handleRangeChange}
					className="range-select"
				>
					<option value="today">今日のデータ</option>
					<option value="3days">直近3日間</option>
					<option value="1week">直近1週間</option>
					<option value="3weeks">直近3週間</option>
				</select>
			</div>

			{/* グラフセクション */}
			<div className="charts-section">
				<div className="chart-card">
					<h3 className="chart-title">気分とモチベーションの推移</h3>
					{chartData && chartData.mood.length > 0 ? (
						<MoodChart data={chartData.mood} />
					) : (
						<div className="chart-empty-state">
							<p>この期間のデータがありません</p>
						</div>
					)}
				</div>
				<div className="chart-card">
					<h3 className="chart-title">気温と湿度の推移</h3>
					{chartData && chartData.weather.length > 0 ? (
						<WeatherChart data={chartData.weather} />
					) : (
						<div className="chart-empty-state">
							<p>この期間のデータがありません</p>
						</div>
					)}
				</div>
			</div>

			{/* 統計パネル */}
			{statsDisplay}

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
						<span>分析を見る</span>
					</button>
				</div>
			</div>

			{/* 最近の記録 */}
			<div className="recent-records">
				<h2 className="section-title">最近の記録</h2>
				{recordsList}
			</div>
		</div>
	);
}

export default memo(Dashboard);
