import { useMemo, memo } from 'react';
import { useRenderLogger } from '../../utils/performanceMonitor';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ChartDataPoint } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MoodChartProps {
  data: ChartDataPoint[];
}

function MoodChart({ data }: MoodChartProps) {
  useRenderLogger('MoodChart');
  
  // チャートデータをuseMemoでメモ化
  const chartData = useMemo(() => {
    const labels = data.map(d => d.date);
    const emotionScores = data.map(d => d.avg_emotion);
    const motivationScores = data.map(d => d.avg_motivation);

    return {
      labels,
      datasets: [
        {
          label: '気分',
          data: emotionScores,
          borderColor: 'rgb(255, 107, 157)',
          backgroundColor: 'rgba(255, 107, 157, 0.1)',
          tension: 0.1,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'モチベーション',
          data: motivationScores,
          borderColor: 'rgb(180, 167, 214)',
          backgroundColor: 'rgba(180, 167, 214, 0.1)',
          tension: 0.1,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    };
  }, [data]);

  // オプションをuseMemoでメモ化
  const options: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 600
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: (context) => {
            return context[0].label;
          },
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(1);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        title: {
          display: true,
          text: 'スコア'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        },
        title: {
          display: true,
          text: '日時'
        }
      }
    }
  }), []);

  return (
    <div style={{ height: '300px', position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

export default memo(MoodChart);
