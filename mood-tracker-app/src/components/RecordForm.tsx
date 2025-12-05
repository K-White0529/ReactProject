import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { createRecord } from '../services/recordService';
import { getCurrentWeather } from '../services/weatherService';
import { getRandomQuestions, saveAnswers } from '../services/analysisService';
import type { RecordInput, CurrentWeather, AnalysisQuestion, AnalysisAnswerInput } from '../types';
import { useRenderLogger } from '../utils/performanceMonitor';
import './RecordForm.css';

interface RecordFormProps {
	onNavigate?: (page: string) => void;
}

// 天気アイコンを取得する純粋関数
const getWeatherIcon = (condition: string): string => {
	const lower = condition.toLowerCase();
	if (lower.includes('clear') || lower.includes('sunny')) return '☀️';
	if (lower.includes('cloud')) return '☁️';
	if (lower.includes('rain')) return '🌧️';
	if (lower.includes('snow')) return '❄️';
	return '🌤️';
};

// 天気情報カードコンポーネント
interface WeatherCardProps {
	weather: CurrentWeather | null;
	loading: boolean;
}

const WeatherCard = memo(({ weather, loading }: WeatherCardProps) => {
	if (loading) {
		return (
			<div className="weather-info-card loading">
				<div className="weather-loading">天気情報を読み込み中...</div>
			</div>
		);
	}

	if (!weather) return null;

	return (
		<div className="weather-info-card">
			<div className="weather-icon-large">
				{getWeatherIcon(weather.weatherCondition)}
			</div>
			<div className="weather-details">
				<div className="weather-location">{weather.location}</div>
				<div className="weather-condition">{weather.weatherCondition}</div>
				<div className="weather-metrics">
					<span className="weather-metric">🌡️ {weather.temperature}°C</span>
					<span className="weather-metric">💧 {weather.humidity}%</span>
				</div>
			</div>
		</div>
	);
});

WeatherCard.displayName = 'WeatherCard';

// 質問項目コンポーネント
interface QuestionItemProps {
	question: AnalysisQuestion;
	index: number;
	value: number;
	onChange: (questionId: number, score: number) => void;
}

const QuestionItem = memo(({ question, index, value, onChange }: QuestionItemProps) => {
	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(question.id, parseInt(e.target.value));
	}, [question.id, onChange]);

	return (
		<div className="question-item">
			<label htmlFor={`question-${question.id}`} className="question-label">
				<span className="question-number">{index + 1}.</span>
				<span className="question-text">{question.question_text}</span>
				<span className="slider-value">{value}</span>
			</label>
			<input
				type="range"
				id={`question-${question.id}`}
				min="1"
				max="10"
				value={value}
				onChange={handleChange}
				className="slider"
			/>
			<div className="slider-labels">
				<span>1 低い</span>
				<span>5</span>
				<span>10 高い</span>
			</div>
		</div>
	);
});

QuestionItem.displayName = 'QuestionItem';

function RecordForm({ onNavigate }: RecordFormProps) {
	useRenderLogger('RecordForm');
	
	const [currentStep, setCurrentStep] = useState<number>(1);
	const [formData, setFormData] = useState<RecordInput>({
		sleep_hours: undefined,
		sleep_quality: undefined,
		meal_quality: undefined,
		meal_regularity: undefined,
		exercise_minutes: undefined,
		exercise_intensity: undefined,
		emotion_score: undefined,
		emotion_note: '',
		motivation_score: undefined,
		activities_done: ''
	});
	const [questions, setQuestions] = useState<AnalysisQuestion[]>([]);
	const [answers, setAnswers] = useState<Map<number, number>>(new Map());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	const [weather, setWeather] = useState<CurrentWeather | null>(null);
	const [weatherLoading, setWeatherLoading] = useState(false);

	// 天気データの読み込みをuseCallbackでメモ化
	const loadWeather = useCallback(async () => {
		try {
			setWeatherLoading(true);
			const data = await getCurrentWeather();
			setWeather(data);
		} catch (error) {
			console.error('Weather load error:', error);
		} finally {
			setWeatherLoading(false);
		}
	}, []);

	useEffect(() => {
		loadWeather();
	}, [loadWeather]);

	// イベントハンドラーをuseCallbackでメモ化
	const handleNumberChange = useCallback((field: keyof RecordInput, value: string) => {
		const numValue = value === '' ? undefined : parseFloat(value);
		setFormData(prev => ({ ...prev, [field]: numValue }));
	}, []);

	const handleSliderChange = useCallback((field: keyof RecordInput, value: number) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	}, []);

	const handleTextChange = useCallback((field: keyof RecordInput, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	}, []);

	const handleAnswerChange = useCallback((questionId: number, score: number) => {
		setAnswers(prev => {
			const newAnswers = new Map(prev);
			newAnswers.set(questionId, score);
			return newAnswers;
		});
	}, []);

	// バリデーション結果をuseMemoでメモ化
	const step1Validation = useMemo(() => {
		const missingFields: string[] = [];

		if (formData.sleep_hours === undefined) missingFields.push('睡眠時間');
		if (formData.sleep_quality === undefined) missingFields.push('睡眠の質');
		if (formData.meal_quality === undefined) missingFields.push('食事の質');
		if (formData.meal_regularity === undefined) missingFields.push('食事の規則性');
		if (formData.exercise_minutes === undefined) missingFields.push('運動時間');
		if (formData.exercise_intensity === undefined) missingFields.push('運動強度');
		if (formData.emotion_score === undefined) missingFields.push('気分スコア');
		if (formData.motivation_score === undefined) missingFields.push('モチベーション');

		return {
			isValid: missingFields.length === 0,
			missingFields
		};
	}, [formData]);

	const step2Validation = useMemo(() => {
		const unansweredCount = questions.length - answers.size;

		return {
			isValid: unansweredCount === 0,
			unansweredCount
		};
	}, [questions.length, answers.size]);

	// Step遷移ハンドラー
	const handleProceedToStep2 = useCallback(async () => {
		if (!step1Validation.isValid) {
			setError(`以下の項目を入力してください: ${step1Validation.missingFields.join('、')}`);
			window.scrollTo({ top: 0, behavior: 'smooth' });
			setTimeout(() => setError(''), 5000);
			return;
		}

		try {
			setLoading(true);
			setError('');

			const randomQuestions = await getRandomQuestions(5);
			setQuestions(randomQuestions);

			setCurrentStep(2);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} catch (err) {
			setError(err instanceof Error ? err.message : '質問の取得に失敗しました');
			window.scrollTo({ top: 0, behavior: 'smooth' });
			setTimeout(() => setError(''), 5000);
		} finally {
			setLoading(false);
		}
	}, [step1Validation]);

	const handleBackToStep1 = useCallback(() => {
		setCurrentStep(1);
		setAnswers(new Map());
	}, []);

	const handleSubmit = useCallback(async () => {
		if (!step2Validation.isValid) {
			setError(`未回答の質問が${step2Validation.unansweredCount}問あります。全ての質問に回答してください。`);
			window.scrollTo({ top: 0, behavior: 'smooth' });
			setTimeout(() => setError(''), 5000);
			return;
		}

		try {
			setLoading(true);
			setError('');
			setSuccess(false);

			const record = await createRecord(formData);

			if (answers.size > 0 && record.id) {
				const answerList: AnalysisAnswerInput[] = Array.from(answers.entries()).map(
					([question_id, answer_score]) => ({
						record_id: record.id,
						question_id,
						answer_score
					})
				);

				await saveAnswers(answerList);
			}

			// フォームリセット
			setFormData({
				sleep_hours: undefined,
				sleep_quality: undefined,
				meal_quality: undefined,
				meal_regularity: undefined,
				exercise_minutes: undefined,
				exercise_intensity: undefined,
				emotion_score: undefined,
				emotion_note: '',
				motivation_score: undefined,
				activities_done: ''
			});
			setAnswers(new Map());
			setCurrentStep(1);

			if (onNavigate) {
				onNavigate('dashboard');
				setTimeout(() => {
					const event = new CustomEvent('recordSaved');
					window.dispatchEvent(event);
				}, 100);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : '記録の保存に失敗しました');
			window.scrollTo({ top: 0, behavior: 'smooth' });
			setTimeout(() => setError(''), 5000);
		} finally {
			setLoading(false);
		}
	}, [step2Validation, formData, answers, onNavigate]);

	// 質問リストの表示をuseMemoでメモ化
	const questionsList = useMemo(() => {
		return questions.map((question, index) => (
			<QuestionItem
				key={question.id}
				question={question}
				index={index}
				value={answers.get(question.id) ?? 5}
				onChange={handleAnswerChange}
			/>
		));
	}, [questions, answers, handleAnswerChange]);

	return (
		<div className="record-form-container">
			<h1 className="page-title">データ登録</h1>

			{currentStep === 1 && (
				<WeatherCard weather={weather} loading={weatherLoading} />
			)}

			{error && <div className="error-message">{error}</div>}
			{success && <div className="success-message">記録を保存しました！</div>}

			<div className="record-form">
				{currentStep === 1 && (
					<>
						{/* 睡眠セクション */}
						<section className="form-section">
							<h2 className="section-title">睡眠</h2>
							<div className="form-row">
								<div className="form-group">
									<label htmlFor="sleep_hours">睡眠時間（時間）</label>
									<input
										type="number"
										id="sleep_hours"
										min="0"
										max="24"
										step="0.5"
										value={formData.sleep_hours ?? ''}
										onChange={(e) => handleNumberChange('sleep_hours', e.target.value)}
										placeholder="例: 7.5"
									/>
								</div>
							</div>
							<div className="form-group">
								<label htmlFor="sleep_quality">
									睡眠の質
									{formData.sleep_quality !== undefined && (
										<span className="slider-value">{formData.sleep_quality}</span>
									)}
								</label>
								<input
									type="range"
									id="sleep_quality"
									min="1"
									max="10"
									value={formData.sleep_quality ?? 5}
									onChange={(e) => handleSliderChange('sleep_quality', parseInt(e.target.value))}
									className="slider"
								/>
								<div className="slider-labels">
									<span>悪い</span>
									<span>普通</span>
									<span>良い</span>
								</div>
							</div>
						</section>

						{/* 食事セクション */}
						<section className="form-section">
							<h2 className="section-title">食事</h2>
							<div className="form-group">
								<label htmlFor="meal_regularity">
									食事の規則性
									{formData.meal_regularity !== undefined && (
										<span className="slider-value">{formData.meal_regularity}</span>
									)}
								</label>
								<input
									type="range"
									id="meal_regularity"
									min="1"
									max="10"
									value={formData.meal_regularity ?? 5}
									onChange={(e) => handleSliderChange('meal_regularity', parseInt(e.target.value))}
									className="slider"
								/>
								<div className="slider-labels">
									<span>不規則</span>
									<span>普通</span>
									<span>規則的</span>
								</div>
							</div>
							<div className="form-group">
								<label htmlFor="meal_quality">
									食事の質
									{formData.meal_quality !== undefined && (
										<span className="slider-value">{formData.meal_quality}</span>
									)}
								</label>
								<input
									type="range"
									id="meal_quality"
									min="1"
									max="10"
									value={formData.meal_quality ?? 5}
									onChange={(e) => handleSliderChange('meal_quality', parseInt(e.target.value))}
									className="slider"
								/>
								<div className="slider-labels">
									<span>悪い</span>
									<span>普通</span>
									<span>良い</span>
								</div>
							</div>
						</section>

						{/* 運動セクション */}
						<section className="form-section">
							<h2 className="section-title">運動</h2>
							<div className="form-row">
								<div className="form-group">
									<label htmlFor="exercise_minutes">運動時間（分）</label>
									<input
										type="number"
										id="exercise_minutes"
										min="0"
										value={formData.exercise_minutes ?? ''}
										onChange={(e) => handleNumberChange('exercise_minutes', e.target.value)}
										placeholder="例: 30"
									/>
								</div>
							</div>
							<div className="form-group">
								<label htmlFor="exercise_intensity">
									運動強度
									{formData.exercise_intensity !== undefined && (
										<span className="slider-value">{formData.exercise_intensity}</span>
									)}
								</label>
								<input
									type="range"
									id="exercise_intensity"
									min="1"
									max="10"
									value={formData.exercise_intensity ?? 5}
									onChange={(e) => handleSliderChange('exercise_intensity', parseInt(e.target.value))}
									className="slider"
								/>
								<div className="slider-labels">
									<span>軽い</span>
									<span>普通</span>
									<span>激しい</span>
								</div>
							</div>
						</section>

						{/* 感情セクション */}
						<section className="form-section">
							<h2 className="section-title">感情</h2>
							<div className="form-group">
								<label htmlFor="emotion_score">
									気分スコア
									{formData.emotion_score !== undefined && (
										<span className="slider-value">{formData.emotion_score}</span>
									)}
								</label>
								<input
									type="range"
									id="emotion_score"
									min="1"
									max="10"
									value={formData.emotion_score ?? 5}
									onChange={(e) => handleSliderChange('emotion_score', parseInt(e.target.value))}
									className="slider"
								/>
								<div className="slider-labels">
									<span>😢 悪い</span>
									<span>😐 普通</span>
									<span>😊 良い</span>
								</div>
							</div>
							<div className="form-group">
								<label htmlFor="emotion_note">感情のメモ</label>
								<textarea
									id="emotion_note"
									rows={3}
									value={formData.emotion_note}
									onChange={(e) => handleTextChange('emotion_note', e.target.value)}
									placeholder="今日の気分について..."
								/>
							</div>
						</section>

						{/* モチベーションセクション */}
						<section className="form-section">
							<h2 className="section-title">モチベーション</h2>
							<div className="form-group">
								<label htmlFor="motivation_score">
									モチベーション
									{formData.motivation_score !== undefined && (
										<span className="slider-value">{formData.motivation_score}</span>
									)}
								</label>
								<input
									type="range"
									id="motivation_score"
									min="1"
									max="10"
									value={formData.motivation_score ?? 5}
									onChange={(e) => handleSliderChange('motivation_score', parseInt(e.target.value))}
									className="slider"
								/>
								<div className="slider-labels">
									<span>低い</span>
									<span>普通</span>
									<span>高い</span>
								</div>
							</div>
						</section>

						{/* やったことセクション */}
						<section className="form-section">
							<h2 className="section-title">やったこと</h2>
							<div className="form-group">
								<label htmlFor="activities_done">今日やったこと</label>
								<textarea
									id="activities_done"
									rows={4}
									value={formData.activities_done}
									onChange={(e) => handleTextChange('activities_done', e.target.value)}
									placeholder="今日行った活動や達成したこと..."
								/>
							</div>
						</section>

						<div className="form-actions">
							<button
								type="button"
								className="btn btn-primary"
								onClick={handleProceedToStep2}
								disabled={loading}
							>
								{loading ? '読み込み中...' : '調子分析入力に進む'}
							</button>
						</div>
					</>
				)}

				{currentStep === 2 && (
					<>
						<div className="step-indicator">
							<p>以下の質問に回答してください（全{questions.length}問）</p>
						</div>

						{questionsList}
					</>
				)}
			</div>

			{currentStep === 2 && (
				<div className="floating-buttons">
					<button
						type="button"
						className="btn btn-secondary"
						onClick={handleBackToStep1}
						disabled={loading}
					>
						前に戻る
					</button>
					<button
						type="button"
						className="btn btn-primary"
						onClick={handleSubmit}
						disabled={loading}
					>
						{loading ? '保存中...' : '記録を保存'}
					</button>
				</div>
			)}
		</div>
	);
}

export default RecordForm;
