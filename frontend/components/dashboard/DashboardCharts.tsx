'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Filler,
  Legend
);

const PRIMARY_COLOR = '#F97316';

export const SalesLineChart = ({ data }: { data: number[] }) => {
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data,
      borderColor: PRIMARY_COLOR,
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: PRIMARY_COLOR,
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2,
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(249, 115, 22, 0.08)',
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index' as const, intersect: false } },
    scales: { x: { display: false }, y: { display: false } },
  };

  return <Line data={chartData} options={options} />;
};

export const ConversionAreaChart = ({ data }: { data: number[] }) => {
  const chartData = {
    labels: ['FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL'],
    datasets: [{
      data,
      borderColor: PRIMARY_COLOR,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      x: { grid: { display: false }, border: { display: false }, ticks: { color: '#ABABAB', font: { size: 10 } } }, 
      y: { display: false } 
    },
  };

  return <Line data={chartData} options={options} />;
};

export const ChannelsDoughnutChart = ({ data }: { data: number[] }) => {
  const chartData = {
    labels: ['Organic', 'Referral', 'Direct'],
    datasets: [{
      data,
      backgroundColor: ['#F97316', '#FBBF24', '#E5E7EB'],
      borderWidth: 0,
      hoverOffset: 6,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '70%',
    plugins: { legend: { display: false } },
  };

  return <Doughnut data={chartData} options={options} />;
};

export const RetentionBarChart = ({ data }: { data: number[] }) => {
  const chartData = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    datasets: [{
      data,
      backgroundColor: data.map((_, i) => i % 2 === 0 ? '#FDBA74' : PRIMARY_COLOR),
      borderRadius: 4,
      barPercentage: 0.65,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      x: { grid: { display: false }, border: { display: false }, ticks: { color: '#ABABAB', font: { size: 10 } } }, 
      y: { display: false } 
    },
  };

  return <Bar data={chartData} options={options} />;
};

export const WeeklyRadarChart = ({ datasets }: { datasets: Record<string, unknown>[] }) => {
  const chartData = {
    labels: ['Excitement', 'Happiness', 'Sadness', 'Anger', 'Fear', 'Surprise', 'Disgust', 'Love'],
    datasets: datasets.map((ds, i) => ({
      ...ds,
      borderColor: i === 0 ? PRIMARY_COLOR : '#FBBF24',
      backgroundColor: i === 0 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(251, 191, 36, 0.1)',
      borderWidth: 2,
      pointRadius: 3,
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { display: false },
        grid: { color: 'rgba(0, 0, 0, 0.06)' },
        angleLines: { color: 'rgba(0, 0, 0, 0.06)' },
        pointLabels: { color: '#888888', font: { size: 10 } },
      }
    },
    plugins: { legend: { display: false } },
  };

  return <Radar data={chartData} options={options} />;
};
