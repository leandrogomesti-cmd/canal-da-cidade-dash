import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import '../styles/pages/Setores.css';

interface Ocorrencia {
  id: string;
  titulo: string;
  setor: string;
  status: 'Recebida' | 'Em Análise' | 'Finalizada';
}

export default function Setores() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);

  useEffect(() => {
    const fetchOcorrencias = async () => {
      const { data, error } = await supabase
        .from('ocorrencias')
        .select('*');

      if (error) {
        console.error('Erro ao buscar ocorrências:', error);
        return;
      }

      if (data) {
        setOcorrencias(data);
      }
    };

    fetchOcorrencias();
  }, []);

  const updateStatus = async (id: string, newStatus: 'Recebida' | 'Em Análise' | 'Finalizada') => {
    const { error } = await supabase
      .from('ocorrencias')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      return;
    }

    setOcorrencias((prev) =>
      prev.map((ocorrencia) =>
        ocorrencia.id === id ? { ...ocorrencia, status: newStatus } : ocorrencia
      )
    );
  };

  const renderColumn = (status: 'Recebida' | 'Em Análise' | 'Finalizada') => (
    <div className="column">
      <h3>{status}</h3>
      {ocorrencias
        .filter((ocorrencia) => ocorrencia.status === status)
        .map((ocorrencia) => (
          <div
            key={ocorrencia.id}
            className="card"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('id', ocorrencia.id)}
          >
            {ocorrencia.titulo}
          </div>
        ))}
    </div>
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: 'Recebida' | 'Em Análise' | 'Finalizada') => {
    const id = e.dataTransfer.getData('id');
    updateStatus(id, newStatus);
  };

  return (
    <div className="trello-board">
      <div
        className="column"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'Recebida')}
      >
        {renderColumn('Recebida')}
      </div>
      <div
        className="column"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'Em Análise')}
      >
        {renderColumn('Em Análise')}
      </div>
      <div
        className="column"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, 'Finalizada')}
      >
        {renderColumn('Finalizada')}
      </div>
    </div>
  );
}