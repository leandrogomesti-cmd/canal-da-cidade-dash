import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Dayjs } from 'dayjs';

interface StatusData {
  status: string;
  count: number;
}

interface SectorData {
  sector: string;
  count: number;
}

interface OccurrenceData {
  title: string;
  created_at: string;
}

interface ReportsData {
  statusData: StatusData[];
  sectorData: SectorData[];
  occurrencesList: OccurrenceData[];
  totalOccurrences: number;
  averagePerPeriod: number;
}

export function useReportsData(
  timeFilter: string,
  dateRange: [Dayjs | null, Dayjs | null] | null,
  viewMode: string
) {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        if (!supabase) {
          throw new Error('Cliente Supabase não inicializado');
        }

        // Busca todas as ocorrências uma única vez
        const { data: allOccurrences, error: supabaseError } = await supabase
          .from('ocorrencias')
          .select('status, setor, created_at, titulo');

        if (supabaseError) {
          throw new Error(`Erro Supabase: ${supabaseError.message}`);
        }

        // Filtra ocorrências por período apenas para a lista de ocorrências
        const filteredOccurrences = dateRange?.[0] && dateRange?.[1]
          ? allOccurrences.filter(occ => {
              const occDate = new Date(occ.created_at);
              return occDate >= dateRange[0]!.toDate() && 
                     occDate <= dateRange[1]!.toDate();
            })
          : allOccurrences;

        // Estatísticas gerais (sempre usa todas as ocorrências)
        const statusCount = allOccurrences.reduce((acc: any, curr: any) => {
          if (!curr.status) return acc;
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
        }, {});

        const setorCount = allOccurrences.reduce((acc: any, curr: any) => {
          if (!curr.setor) return acc;
          acc[curr.setor] = (acc[curr.setor] || 0) + 1;
          return acc;
        }, {});

        // Lista de ocorrências e totais do período filtrado
        const occurrencesList = filteredOccurrences
          .map((occ: any) => ({
            title: occ.titulo || 'Sem título',
            created_at: new Date(occ.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          }))
          .sort((a: OccurrenceData, b: OccurrenceData) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

        const formattedData = {
          // Dados gerais (não filtrados)
          statusData: Object.entries(statusCount).map(([status, count]) => ({
            status,
            count: count as number
          })),
          sectorData: Object.entries(setorCount).map(([sector, count]) => ({
            sector,
            count: count as number
          })),
          // Dados do período (filtrados)
          occurrencesList,
          totalOccurrences: filteredOccurrences.length,
          averagePerPeriod: filteredOccurrences.length
        };

        setData(formattedData);
        setError(null);
      } catch (err) {
        console.error('Erro detalhado:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dateRange]); // Removido timeFilter e viewMode das dependências

  return { data, loading, error };
}