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
  const labels = data.map(d => {
    const date = new Date(d.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const weatherIcons = data.map(d => {
    const weather = d.weather_condition?.toLowerCase() || '';
    if (weather.includes('clear') || weather.includes('sunny')) return '☀️';
    if (weather.includes('cloud')) return '☁️';
    if (weather.includes('rain')) return '🌧️';
    if (weather.includes('snow')) return '❄️';
    return '🌤️';
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: '気温 (℃)',
        data: data.map(d => d.avg_temperature || null),
        borderColor: 'rgb(255, 211, 61)',
        backgroundColor: 'rgba(255, 211, 61, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: '湿度 (%)',
        data: data.map(d => d.avg_humidity || null),
        borderColor: 'rgb(107, 203, 119)',
        backgroundColor: 'rgba(107, 203, 119, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
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
            const index = context[0].dataIndex;
            return `${context[0].label} ${weatherIcons[index]}`;
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
          callback: function(tickValue, index) {
            return `${labels[index]}\n${weatherIcons[index]}`;
          }
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