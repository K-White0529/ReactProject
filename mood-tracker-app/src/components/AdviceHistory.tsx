import { useState, useEffect } from 'react';
import { getAdviceHistory, generatePersonalizedAdvice } from '../services/adviceService';
import type { Advice, AdviceData } from '../services/adviceService';
import { HiSparkles, HiRefresh, HiArrowLeft } from 'react-icons/hi';
import './AdviceHistory.css';

interface AdviceHistoryProps {
	onNavigate?: (page: string) => void;
}

function AdviceHistory({ onNavigate }: AdviceHistoryProps) {
	const [history, setHistory] = useState<Advice[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [generating, setGenerating] = useState<boolean>(false);
	const [error, setError] = useState<string>('');

	useEffect(() => {
		loadHistory();
	}, []);

	const loadHistory = async () => {
		try {
			setLoading(true);
			setError('');
			const data = await getAdviceHistory(20);
			setHistory(data);
		} catch (err) {
			console.error('履歴読み込みエラー:', err);
			setError(err instanceof Error ? err.message : '履歴の読み込みに失敗しました');
		} finally {
			setLoading(false);
		}
	};

	const handleGenerateNew = async () => {
		try {
			setGenerating(true);
			setError('');
			const newAdvice: AdviceData = await generatePersonalizedAdvice();
			// 履歴を再読み込み
			await loadHistory();
		} catch (err) {
			console.error('アドバイス生成エラー:', err);
			setError(err instanceof Error ? err.message : 'アドバイスの生成に失敗しました');
		} finally {
			setGenerating(false);
		}
	};

	const handleBack = () => {
		if (onNavigate) {
			onNavigate('dashboard');
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString('ja-JP', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const getRelativeTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'たった今';
		if (diffMins < 60) return `${diffMins}分前`;
		if (diffHours < 24) return `${diffHours}時間前`;
		if (diffDays === 1) return '昨日';
		if (diffDays < 7) return `${diffDays}日前`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
		
		return `${Math.floor(diffDays / 30)}ヶ月前`;
	};

	if (loading) {
		return (
			<div className="advice-history-container">
				<div className="loading">読み込み中...</div>
			</div>
		);
	}

	return (
		<div className="advice-history-container">
			<div className="advice-history-header">
				<button className="back-btn" onClick={handleBack}>
					<HiArrowLeft size={20} />
					ダッシュボードに戻る
				</button>
				<h1>アドバイス履歴</h1>
				<p className="history-count">全 {history.length} 件</p>
			</div>

			{error && <div className="error-message">{error}</div>}

			<div className="generate-new-section">
				<button 
					className="generate-new-btn"
					onClick={handleGenerateNew}
					disabled={generating}
				>
					<HiRefresh className={generating ? 'spinning' : ''} />
					<span>{generating ? '生成中...' : '新しいアドバイスを生成'}</span>
				</button>
			</div>

			{history.length === 0 ? (
				<div className="empty-state">
					<HiSparkles size={64} className="empty-icon" />
					<p>まだアドバイスの履歴がありません</p>
					<p>「新しいアドバイスを生成」ボタンから最初のアドバイスを作成しましょう！</p>
				</div>
			) : (
				<div className="advice-list">
					{history.map((advice) => (
						<div key={advice.id} className="advice-item">
							<div className="advice-item-header">
								<div className="advice-item-icon">
									<HiSparkles size={20} />
								</div>
								<div className="advice-item-meta">
									<span className="advice-item-date">
										{formatDate(advice.created_at)}
									</span>
									<span className="advice-item-relative">
										{getRelativeTime(advice.created_at)}
									</span>
								</div>
							</div>
							<div className="advice-item-content">
								<p>{advice.advice_text}</p>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default AdviceHistory;
