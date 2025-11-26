import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

// Chart.jsのコンポーネントを登録
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface CategoryScore {
  category_code: string;
  category_name: string;
  avg_score: number;
  answer_count: number;
}

interface CategoryRadarChartProps {
  data: CategoryScore[];
}

function CategoryRadarChart({ data }: CategoryRadarChartProps) {
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

  const chartData = {
    labels: data.map(d => d.category_name),
    datasets: [
      {
        label: '平均スコア',
        data: data.map(d => d.avg_score),
        backgroundColor: 'rgba(255, 107, 157, 0.2)',
        borderColor: 'rgba(255, 107, 157, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(255, 107, 157, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 107, 157, 1)',
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          font: {
            size: 12
          }
        },
        pointLabels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#333'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.r.toFixed(1)}/10`;
          }
        }
      }
    }
  };

  return <Radar data={chartData} options={options} />;
}

export default CategoryRadarChart;
