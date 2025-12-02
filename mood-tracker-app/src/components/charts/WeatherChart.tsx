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

interface WeatherChartProps {
  data: ChartDataPoint[];
}

function WeatherChart({ data }: WeatherChartProps) {
  useRenderLogger('WeatherChart');
  
  // 気温軸の範囲計算をuseMemoでメモ化
  const { tempMin, tempMax, tempStepSize } = useMemo(() => {
    const temperatures = data.map(d => d.avg_temperature).filter((t): t is number => t !== null && t !== undefined);
    
    let min = 0;
    let max = 40;
    let stepSize = 5;

    if (temperatures.length > 0) {
      const dataMin = Math.min(...temperatures);
      const dataMax = Math.max(...temperatures);

      if (dataMin < 0) {
        min = Math.floor(dataMin / 10) * 10;
      }

      if (dataMax > 40) {
        max = Math.ceil(dataMax / 10) * 10;
      }

      const range = max - min;
      if (range <= 20) {
        stepSize = 2;
      } else if (range <= 40) {
        stepSize = 5;
      } else {
        stepSize = 10;
      }
    }

    return { tempMin: min, tempMax: max, tempStepSize: stepSize };
  }, [data]);

  // チャートデータをuseMemoでメモ化
  const chartData = useMemo(() => {
    const labels = data.map(d => d.date);
    const temperatures = data.map(d => d.avg_temperature);
    const humidities = data.map(d => d.avg_humidity);

    return {
      labels,
      datasets: [
        {
          label: '気温 (℃)',
          data: temperatures,
          borderColor: 'rgb(255, 211, 61)',
          backgroundColor: 'rgba(255, 211, 61, 0.1)',
          tension: 0.1,
          fill: true,
          yAxisID: 'y',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: '湿度 (%)',
          data: humidities,
          borderColor: 'rgb(107, 203, 119)',
          backgroundColor: 'rgba(107, 203, 119, 0.1)',
          tension: 0.1,
          fill: true,
          yAxisID: 'y1',
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
              if (context.dataset.label?.includes('気温')) {
                label += context.parsed.y.toFixed(1) + '°C';
              } else if (context.dataset.label?.includes('湿度')) {
                label += context.parsed.y.toFixed(0) + '%';
              } else {
                label += context.parsed.y.toFixed(1);
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '気温 (℃)',
          color: 'rgb(255, 211, 61)',
          font: {
            weight: 600
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        min: tempMin,
        max: tempMax,
        ticks: {
          stepSize: tempStepSize
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '湿度 (%)',
          color: 'rgb(107, 203, 119)',
          font: {
            weight: 600
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: 100
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
  }), [tempMin, tempMax, tempStepSize]);

  return (
    <div style={{ height: '300px', position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

export default memo(WeatherChart);
