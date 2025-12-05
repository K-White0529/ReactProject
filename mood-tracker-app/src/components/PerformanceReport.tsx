/**
 * パフォーマンス計測レポートコンポーネント
 * 開発環境でのみ表示されます
 */
import { useEffect, useState } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';
import './PerformanceReport.css';

function PerformanceReport() {
	const [isVisible, setIsVisible] = useState(false);
	const [stats, setStats] = useState<Array<{ componentName: string; renderCount: number }>>([]);

	useEffect(() => {
		// 開発環境のみ
		if (import.meta.env.MODE !== 'development') return;

		// 5秒ごとに統計を更新
		const interval = setInterval(() => {
			const currentStats = performanceMonitor.getStats();
			setStats(currentStats);
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	// 開発環境以外では何も表示しない
	if (import.meta.env.MODE !== 'development') return null;

	return (
		<>
			<button
				className="performance-toggle"
				onClick={() => setIsVisible(!isVisible)}
				title="パフォーマンスレポート"
			>
				📊
			</button>

			{isVisible && (
				<div className="performance-report">
					<div className="performance-header">
						<h3>レンダリング統計</h3>
						<button
							className="close-btn"
							onClick={() => setIsVisible(false)}
						>
							×
						</button>
					</div>
					<div className="performance-content">
						{stats.length === 0 ? (
							<p className="no-data">データがありません</p>
						) : (
							<table className="stats-table">
								<thead>
									<tr>
										<th>コンポーネント</th>
										<th>レンダリング回数</th>
									</tr>
								</thead>
								<tbody>
									{stats.map((stat) => (
										<tr key={stat.componentName}>
											<td>{stat.componentName}</td>
											<td className={stat.renderCount > 10 ? 'high-count' : ''}>
												{stat.renderCount}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
						<div className="performance-actions">
							<button
								className="reset-btn"
								onClick={() => performanceMonitor.reset()}
							>
								リセット
							</button>
							<button
								className="print-btn"
								onClick={() => performanceMonitor.printStats()}
							>
								コンソールに出力
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default PerformanceReport;
