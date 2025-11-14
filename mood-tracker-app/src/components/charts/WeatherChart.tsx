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
  // データは既に時間単位でグループ化されている (dateフィールドが 'MM/DD HH24:00' 形式)
  const labels = data.map(d => d.date);
  const temperatures = data.map(d => d.avg_temperature);
  const humidities = data.map(d => d.avg_humidity);

  // 気温軸の範囲と間隔を計算
  const validTemperatures = temperatures.filter((t): t is number => t !== null && t !== undefined);
  let tempMin = 0;
  let tempMax = 40;
  let tempStepSize = 5;

  if (validTemperatures.length > 0) {
    const dataMin = Math.min(...validTemperatures);
    const dataMax = Math.max(...validTemperatures);

    // 最小値の決定：0度を下回る場合は10の倍数に切り下げ
    if (dataMin < 0) {
      tempMin = Math.floor(dataMin / 10) * 10;
    }

    // 最大値の決定：40度を上回る場合は10の倍数に切り上げ
    if (dataMax > 40) {
      tempMax = Math.ceil(dataMax / 10) * 10;
    }

    // 間隔の決定：範囲に応じて調整
    const range = tempMax - tempMin;
    if (range <= 20) {
      tempStepSize = 2;
    } else if (range <= 40) {
      tempStepSize = 5;
    } else {
      tempStepSize = 10;
    }
  }

  const chartData = {
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

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
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
            // 'MM/DD HH:00' 形式で表示
            return context[0].label;
          },
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              // データセットに応じて単位を追加
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
        type: 'linear',
        display: true,
        position: 'left',
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
        type: 'linear',
        display: true,
        position: 'right',
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
  };

  return (
    <div style={{ height: '300px', position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

export default WeatherChart;