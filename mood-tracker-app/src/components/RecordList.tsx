import { useState, useEffect } from 'react';
import { getRecords } from '../services/recordService';
import type { Record } from '../types';
import './RecordList.css';

interface RecordListProps {
	onNavigate?: (page: string) => void;
}

function RecordList({ onNavigate }: RecordListProps) {
	const [records, setRecords] = useState<Record[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		loadRecords();
	}, []);

	const loadRecords = async () => {
		try {
			setLoading(true);
			const data = await getRecords(100);
			setRecords(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : '記録の取得に失敗しました');
		} finally {
			setLoading(false);
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
		<div className="record-list-container">
			<div className="record-list-header">
				<h1>記録一覧</h1>
				<p className="record-count">全 {records.length} 件</p>
			</div>

			{error && <div className="error-message">{error}</div>}

			{records.length === 0 ? (
				<div className="no-records-message">
					<p>まだ記録がありません</p>
					<button
						className="primary-btn"
						onClick={() => onNavigate && onNavigate('record')}
					>
						最初の記録を作成
					</button>
				</div>
			) : (
				<div className="records-grid">
					{records.map((record) => (
						<div
							key={record.id}
							className="record-card"
							onClick={() => handleRecordClick(record.id)}
						>
							<div className="record-card-header">
								<div className="record-date">
									{new Date(record.recorded_at).toLocaleString('ja-JP', {
										year: 'numeric',
										month: '2-digit',
										day: '2-digit',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</div>
							</div>

							<div className="record-card-body">
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
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default RecordList;