import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { generatePersonalizedAdvice, getLatestAdvice } from '../services/adviceService';
import type { AdviceData, Advice } from '../services/adviceService';
import { HiSparkles, HiRefresh, HiClock } from 'react-icons/hi';
import { useRenderLogger } from '../utils/performanceMonitor';
import { createSafeTextWithBreaks } from '../utils/sanitize';
import './AdviceCard.css';

interface AdviceCardProps {
	onNavigateToHistory?: () => void;
}

// 日付フォーマット関数（純粋関数）
const formatDate = (dateString: string): string => {
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
	
	return date.toLocaleDateString('ja-JP', {
		month: 'short',
		day: 'numeric'
	});
};

function AdviceCard({ onNavigateToHistory }: AdviceCardProps) {
	useRenderLogger('AdviceCard');
	
	const [advice, setAdvice] = useState<string>('');
	const [generatedAt, setGeneratedAt] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);
	const [generating, setGenerating] = useState<boolean>(false);
	const [error, setError] = useState<string>('');

	// データ読み込み関数をuseCallbackでメモ化
	const loadLatestAdvice = useCallback(async () => {
		try {
			setLoading(true);
			setError('');
			const latestAdvice: Advice | null = await getLatestAdvice();
			
			if (latestAdvice) {
				setAdvice(latestAdvice.advice_text);
				setGeneratedAt(latestAdvice.created_at);
			} else {
				setAdvice('');
				setGeneratedAt('');
			}
		} catch (err) {
			console.error('アドバイス読み込みエラー:', err);
			setError('アドバイスの読み込みに失敗しました');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadLatestAdvice();
	}, [loadLatestAdvice]);

	// アドバイス生成ハンドラーをuseCallbackでメモ化
	const handleGenerateAdvice = useCallback(async () => {
		try {
			setGenerating(true);
			setError('');
			const newAdvice: AdviceData = await generatePersonalizedAdvice();
			setAdvice(newAdvice.advice);
			setGeneratedAt(newAdvice.generated_at);
		} catch (err) {
			console.error('アドバイス生成エラー:', err);
			setError(err instanceof Error ? err.message : 'アドバイスの生成に失敗しました');
		} finally {
			setGenerating(false);
		}
	}, []);

	// フォーマット済み日付をuseMemoでメモ化
	const formattedDate = useMemo(() => {
		return generatedAt ? formatDate(generatedAt) : '';
	}, [generatedAt]);

	if (loading) {
		return (
			<div className="advice-card loading">
				<div className="advice-card-header">
					<div className="advice-card-title">
						<HiSparkles className="advice-icon" />
						<span>今日のアドバイス</span>
					</div>
				</div>
				<div className="advice-content">
					<p className="loading-text">読み込み中...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="advice-card">
			<div className="advice-card-header">
				<div className="advice-card-title">
					<HiSparkles className="advice-icon" />
					<span>今日のアドバイス</span>
				</div>
				<div className="advice-card-actions">
					<button
						className="advice-action-btn refresh-btn"
						onClick={handleGenerateAdvice}
						disabled={generating}
						title="新しいアドバイスを生成"
					>
						<HiRefresh className={generating ? 'spinning' : ''} />
					</button>
				</div>
			</div>

			{error ? (
				<div className="advice-content error">
					<p className="error-text">{error}</p>
					<button className="retry-btn" onClick={loadLatestAdvice}>
						再読み込み
					</button>
				</div>
			) : advice ? (
				<>
					<div className="advice-content">
						<p className="advice-text" dangerouslySetInnerHTML={createSafeTextWithBreaks(advice)} />
					</div>

					{formattedDate && (
						<div className="advice-footer">
							<div className="advice-timestamp">
								<HiClock size={14} />
								<span>{formattedDate}</span>
							</div>
							{onNavigateToHistory && (
								<button 
									className="history-link"
									onClick={onNavigateToHistory}
								>
									履歴を見る
								</button>
							)}
						</div>
					)}
				</>
			) : (
				<div className="advice-content empty">
					<p className="empty-text">まだアドバイスがありません</p>
					<p className="empty-hint">更新ボタンをクリックして最初のアドバイスを生成しましょう！</p>
				</div>
			)}
		</div>
	);
}

export default memo(AdviceCard);
