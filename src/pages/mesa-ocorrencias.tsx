import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/mesa-ocorrencias.css';

interface Ocorrencia {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  vereador_id: string | null;
  vereador_nome?: string;
  created_at: string;
}

const MesaOcorrencias: React.FC = () => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();

  useEffect(() => {
    buscarOcorrencias();
  }, []);

  const buscarOcorrencias = async () => {
    setLoading(true);
    // Busca ocorrências com status 'Mesa'
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*')
      .eq('status', 'Mesa');
    if (!error && data) {
      setOcorrencias(data);
    } else {
      setOcorrencias([]);
    }
    setLoading(false);
  };

  const pegarOcorrencia = async (ocorrencia: Ocorrencia) => {
    if (!userData) {
      alert('Você precisa estar logado para pegar uma ocorrência.');
      return;
    }
    const { error } = await supabase
      .from('ocorrencias')
      .update({
        vereador_id: userData.vereador_id,
        vereador_nome: userData.nome,
        status: 'Recebida',
      })
      .eq('id', ocorrencia.id);
    if (!error) {
      buscarOcorrencias();
      alert('Ocorrência atribuída a você!');
    } else {
      alert('Erro ao pegar ocorrência.');
    }
  };

  return (
    <div className="mesa-ocorrencias-container">
      <h1>Mesa de Ocorrências</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : ocorrencias.length === 0 ? (
        <div className="mesa-sem-ocorrencias">Nenhuma ocorrência disponível na mesa.</div>
      ) : (
        <div className="mesa-ocorrencias-lista">
          {ocorrencias.map((oc) => (
            <div className="mesa-card" key={oc.id}>
              <div className="mesa-card-header">
                <span className="mesa-card-titulo">{oc.titulo}</span>
                <span className={`mesa-card-status mesa-status-${oc.status.toLowerCase()}`}>{oc.status}</span>
              </div>
              <div className="mesa-card-descricao">{oc.descricao}</div>
              <button className="mesa-card-btn" onClick={() => pegarOcorrencia(oc)}>
                Pegar Ocorrência
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesaOcorrencias; 