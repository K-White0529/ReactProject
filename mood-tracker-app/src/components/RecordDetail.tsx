import { useState, useEffect } from 'react';
import { getRecordById } from '../services/recordService';
import { getWeatherByRecordId } from '../services/weatherService';
import type { CurrentWeather, Record } from '../types';
import { HiArrowLeft } from 'react-icons/hi';
import { createSafeTextWithBreaks } from '../utils/sanitize';
import './RecordDetail.css';

interface RecordDetailProps {
	recordId: number;
	onNavigate?: (page: string) => void;
}

function RecordDetail({ recordId, onNavigate }: RecordDetailProps) {
	const [record, setRecord] = useState<Record | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [weather, setWeather] = useState<CurrentWeather | null>(null);
	const [weatherLoading, setWeatherLoading] = useState(false);

	useEffect(() => {
		loadRecord();
		loadWeather();
	}, [recordId]);

	const loadRecord = async () => {
		try {
			setLoading(true);
			const data = await getRecordById(recordId);
			setRecord(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : '記録の取得に失敗しました');
		} finally {
			setLoading(false);
		}
	};

	const loadWeather = async () => {
		try {
			setWeatherLoading(true);
			const data = await getWeatherByRecordId(recordId);
			setWeather(data);
		} catch (error) {
			console.error('Weather load error:', error);
		} finally {
			setWeatherLoading(false);
		}
	};

	const handleBack = () => {
		if (onNavigate) {
			onNavigate('record-list');
		}
	};

	if (loading) {
		return <div className="loading">読み込み中...</div>;
	}

	const getWeatherIcon = (condition: string) => {
		const lower = condition.toLowerCase();
		if (lower.includes('clear') || lower.includes('sunny')) return '☀️';
		if (lower.includes('cloud')) return '☁️';
		if (lower.includes('rain')) return '🌧️';
		if (lower.includes('snow')) return '❄️';
		return '🌤️';
	};

	if (error || !record) {
		return (
			<div className="error-container">
				<p className="error-message">{error || '記録が見つかりませんでした'}</p>
				<button className="back-btn" onClick={handleBack}>
					<HiArrowLeft size={20} />
					一覧に戻る
				</button>
			</div>
		);
	}

	return (
		<div className="record-detail-container">
			<div className="record-detail-header">
				<button className="back-btn" onClick={handleBack}>
					<HiArrowLeft size={20} />
					一覧に戻る
				</button>
				<h1>記録詳細</h1>
			</div>

			<div className="record-detail-card">
				<div className="detail-section">
					<h3>記録日時</h3>
					<p className="record-datetime">
						{new Date(record.recorded_at).toLocaleString('ja-JP', {
							year: 'numeric',
							month: '2-digit',
							day: '2-digit',
							hour: '2-digit',
							minute: '2-digit'
						})}
					</p>
				</div>

				{/* 気象情報カード */}
				{weatherLoading ? (
					<div className="weather-info-card loading">
						<div className="weather-loading">天気情報を読み込み中...</div>
					</div>
				) : weather ? (
					<div className="weather-info-card">
						<div className="weather-icon-large">
							{getWeatherIcon(weather.weatherCondition)}
						</div>
						<div className="weather-details">
							<div className="weather-location">{weather.location}</div>
							<div className="weather-condition">{weather.weatherCondition}</div>
							<div className="weather-metrics">
								<span className="weather-metric">
									🌡️ {weather.temperature}°C
								</span>
								<span className="weather-metric">
									💧 {weather.humidity}%
								</span>
							</div>
						</div>
					</div>
				) : null}

				{(record.sleep_hours || record.exercise_minutes) && (
					<div className="detail-section">
						<h3>基本情報</h3>
						<div className="detail-row">
							{record.sleep_hours && (
								<div className="detail-item">
									<span className="detail-label">睡眠時間</span>
									<span className="detail-value">{record.sleep_hours} 時間</span>
									{record.sleep_quality && (
										<div className="score-display-item">
											<span className="score-display-label">睡眠の質</span>
											<div className="score-display-bar">
												<div
													className="score-display-fill"
													style={{ width: `${(record.sleep_quality / 10) * 100}%` }}
												></div>
												<span className="score-display-value">{record.sleep_quality}</span>
											</div>
										</div>
									)}
								</div>
							)}
							{record.sleep_hours && (
								<div className="detail-item">
									{record.meal_regularity && (
										<div className="score-display-item">
											<span className="score-display-label">食事の規則性</span>
											<div className="score-display-bar">
												<div
													className="score-display-fill"
													style={{ width: `${(record.meal_regularity / 10) * 100}%` }}
												></div>
												<span className="score-display-value">{record.meal_regularity}</span>
											</div>
										</div>
									)}
									{record.meal_quality && (
										<div className="score-display-item">
											<span className="score-display-label">食事の質</span>
											<div className="score-display-bar">
												<div
													className="score-display-fill"
													style={{ width: `${(record.meal_quality / 10) * 100}%` }}
												></div>
												<span className="score-display-value">{record.meal_quality}</span>
											</div>
										</div>
									)}
								</div>
							)}
							{record.exercise_minutes && (
								<div className="detail-item">
									<span className="detail-label">運動時間</span>
									<span className="detail-value">{record.exercise_minutes} 分</span>
									{record.exercise_intensity && (
										<div className="score-display-item">
											<span className="score-display-label">運動強度</span>
											<div className="score-display-bar">
												<div
													className="score-display-fill"
													style={{ width: `${(record.exercise_intensity / 10) * 100}%` }}
												></div>
												<span className="score-display-value">{record.exercise_intensity}</span>
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				)}

				<div className="detail-section">
					<h3>体調・気分</h3>
					<div className="scores-display">
						{record.emotion_score && (
							<div className="score-display-item">
								<span className="score-display-label">気分</span>
								<div className="score-display-bar">
									<div
										className="score-display-fill"
										style={{ width: `${(record.emotion_score / 10) * 100}%` }}
									></div>
									<span className="score-display-value">{record.emotion_score}</span>
								</div>
							</div>
						)}

						{record.motivation_score && (
							<div className="score-display-item">
								<span className="score-display-label">モチベーション</span>
								<div className="score-display-bar">
									<div
										className="score-display-fill"
										style={{ width: `${(record.motivation_score / 10) * 100}%` }}
									></div>
									<span className="score-display-value">{record.motivation_score}</span>
								</div>
							</div>
						)}
					</div>
				</div>

				{(record.emotion_note || record.activities_done) && (
					<div className="detail-section">
						<h3>メモ</h3>
						{record.emotion_note && (
						<div className="memo-item">
						<h4>感情のメモ</h4>
						<p dangerouslySetInnerHTML={createSafeTextWithBreaks(record.emotion_note)} />
						</div>
						)}
						{record.activities_done && (
						<div className="memo-item">
						<h4>やったこと</h4>
						<p dangerouslySetInnerHTML={createSafeTextWithBreaks(record.activities_done)} />
						</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default RecordDetail;