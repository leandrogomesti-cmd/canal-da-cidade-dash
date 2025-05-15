/// <reference types="vite/client" />
import axios from 'axios';

const mockData = {
  statusData: [
    { status: 'Aberto', count: 45 },
    { status: 'Em Andamento', count: 32 },
    { status: 'Concluído', count: 78 },
    { status: 'Cancelado', count: 12 },
  ],
  sectorData: [
    { sector: 'TI', count: 30 },
    { sector: 'RH', count: 25 },
    { sector: 'Financeiro', count: 25 },
    { sector: 'Comercial', count: 20 },
  ],
  totalOccurrences: 157,
  averagePerPeriod: 12.5,
};

const api = {
  get: async (url: string, p0: { params: { timeFilter: string; startDate: string | undefined; endDate: string | undefined; viewMode: string; }; }) => {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { data: mockData };
  }
};

export { api };