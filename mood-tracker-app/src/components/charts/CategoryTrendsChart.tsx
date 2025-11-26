import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CategoryTrend {
  date: string;
  category_code: string;
  category_name: string;
  avg_score: number;
}

interface CategoryTrendsChartProps {
  data: CategoryTrend[];
}

function CategoryTrendsChart({ data }: CategoryTrendsChartProps) {
  // データが空の場合
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
        borderRadius: '12px'
      }}>
        <p style={{ color: '#6C757D', fontSize: '1rem', margin: 0 }}>
          この期間のデータがありません
        </p>
      </div>
    );
  }

  // カテゴリーごとにデータを分類
  const categoriesMap = new Map<string, { name: string; data: { date: string; score: number }[] }>();
  
  data.forEach(item => {
    if (!categoriesMap.has(item.category_code)) {
      categoriesMap.set(item.category_code, {
        name: item.category_name,
        data: []
      });
    }
    categoriesMap.get(item.category_code)!.data.push({
      date: item.date,
      score: item.avg_score
    });
  });

  // すべての日付を取得（ソート済み）
  const allDates = [...new Set(data.map(d => d.date))].sort();

  // カテゴリーごとの色を定義
  const colors = [
    { border: 'rgba(255, 107, 157, 1)', background: 'rgba(255, 107, 157, 0.1)' },
    { border: 'rgba(180, 167, 214, 1)', background: 'rgba(180, 167, 214, 0.1)' },
    { border: 'rgba(255, 217, 61, 1)', background: 'rgba(255, 217, 61, 0.1)' },
    { border: 'rgba(107, 203, 119, 1)', background: 'rgba(107, 203, 119, 0.1)' },
    { border: 'rgba(102, 126, 234, 1)', background: 'rgba(102, 126, 234, 0.1)' }
  ];

  // データセットを作成
  const datasets = Array.from(categoriesMap.entries()).map(([code, category], index) => {
    const colorIndex = index % colors.length;
    const scoresByDate = new Map(category.data.map(d => [d.date, d.score]));
    
    return {
      label: category.name,
      data: allDates.map(date => scoresByDate.get(date) ?? null),
      borderColor: colors[colorIndex].border,
      backgroundColor: colors[colorIndex].background,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.3,
      spanGaps: true
    };
  });

  const chartData = {
    labels: allDates.map(date => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }),
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '日付',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'スコア',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12
          },
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}/10`;
          }
        }
      }
    }
  };

  return <Line data={chartData} options={options} />;
}

export default CategoryTrendsChart;
