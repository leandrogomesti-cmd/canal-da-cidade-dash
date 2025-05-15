import { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Select, DatePicker, Spin, Alert } from 'antd';
import type { Dayjs } from 'dayjs';
import { useReportsData } from '../hooks/useReportsData';
import '../styles/pages/relatorios.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const { RangePicker } = DatePicker;

function Relatorios() {
  const [timeFilter, setTimeFilter] = useState('day');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [viewMode, setViewMode] = useState('exact');

  const { data, loading, error } = useReportsData(timeFilter, dateRange, viewMode);

  if (error) {
    return <Alert message={error} type="error" />;
  }

  const pieChartData = {
    labels: data?.sectorData.map(item => item.sector) || [],
    datasets: [{
      data: data?.sectorData.map(item => item.count) || [],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    }]
  };

  const pieChartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        align: 'center' as const,
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="reports-container">
      <h2 className="reports-title">Relatórios</h2>
      
      <div className="cards-grid">
        {/* Pie Chart Card */}
        <div className="pie-chart-card">
          <h3 className="card-header">Distribuição por Setor</h3>
          <div className="pie-chart-container">
            {data?.sectorData && data.sectorData.length > 0 && (
              <Pie data={pieChartData} options={pieChartOptions} />
            )}
          </div>
        </div>

        {/* Status Card */}
        <div className="status-card">
          <h3 className="card-header">Ocorrências por Status</h3>
          <div className="status-list">
            {data?.statusData && data.statusData.map((item) => (
              <div key={item.status} className="status-item">
                <span>{item.status}</span>
                <span className="results-number">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Period Card */}
      <div className="period-card">
        <h3 className="card-header">Ocorrências por Período</h3>
        <div className="filters-container">
          <RangePicker 
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
            className="date-range-picker"
            format="DD/MM/YYYY"
            allowClear={false}
            placeholder={['Data inicial', 'Data final']}
          />
        </div>
        <div className="results-container">
          <div className="results-text">
            <div className="mb-4">
              Total de ocorrências no período: 
              <span className="results-number ml-2">{data?.totalOccurrences}</span>
            </div>
            
            {/* Lista de ocorrências */}
            <div className="mt-4 space-y-2">
              <div className="occurrences-list">
                {data?.occurrencesList?.map((occ, index) => (
                  <div key={index} className="occurrence-item">
                    <span className="occurrence-title">{occ.title}</span>
                    <span className="occurrence-separator">-</span>
                    <span className="occurrence-date">{occ.created_at}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Relatorios;

