import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { getRecords } from '../services/recordService';
import type { Record } from '../types';
import { useRenderLogger } from '../utils/performanceMonitor';
import './RecordList.css';

interface RecordListProps {
	onNavigate?: (page: string) => void;
}

// 個別の記録カードコンポーネントをメモ化
interface RecordCardItemProps {
	record: Record;
	onClick: (id: number) => void;
}

const RecordCardItem = memo(({ record, onClick }: RecordCardItemProps) => {
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
		<div className="record-card" onClick={handleClick}>
			<div className="record-card-header">
				<div className="record-date">{formattedDate}</div>
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
				{truncatedActivity && (
					<div className="record-activity">{truncatedActivity}</div>
				)}
			</div>
		</div>
	);
});

RecordCardItem.displayName = 'RecordCardItem';

function RecordList({ onNavigate }: RecordListProps) {
	useRenderLogger('RecordList');
	
	const [records, setRecords] = useState<Record[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	// データ読み込み関数をuseCallbackでメモ化
	const loadRecords = useCallback(async () => {
		try {
			setLoading(true);
			const data = await getRecords(100);
			setRecords(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : '記録の取得に失敗しました');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadRecords();
	}, [loadRecords]);

	// イベントハンドラーをuseCallbackでメモ化
	const handleRecordClick = useCallback((recordId: number) => {
		if (onNavigate) {
			onNavigate(`record-detail/${recordId}`);
		}
	}, [onNavigate]);

	const handleCreateRecord = useCallback(() => {
		if (onNavigate) {
			onNavigate('record');
		}
	}, [onNavigate]);

	// 記録リストの表示をuseMemoでメモ化
	const recordsList = useMemo(() => {
		if (records.length === 0) {
			return (
				<div className="no-records-message">
					<p>まだ記録がありません</p>
					<button className="primary-btn" onClick={handleCreateRecord}>
						最初の記録を作成
					</button>
				</div>
			);
		}

		return (
			<div className="records-grid">
				{records.map((record) => (
					<RecordCardItem
						key={record.id}
						record={record}
						onClick={handleRecordClick}
					/>
				))}
			</div>
		);
	}, [records, handleRecordClick, handleCreateRecord]);

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

			{recordsList}
		</div>
	);
}

export default memo(RecordList);
