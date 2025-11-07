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
        label: '気分',
        data: data.map(d => d.avg_emotion || null),
        borderColor: 'rgb(255, 107, 157)',
        backgroundColor: 'rgba(255, 107, 157, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'モチベーション',
        data: data.map(d => d.avg_motivation || null),
        borderColor: 'rgb(180, 167, 214)',
        backgroundColor: 'rgba(180, 167, 214, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
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
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
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

export default MoodChart;