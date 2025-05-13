import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/SetorPage.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Ocorrencia {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  [key: string]: any; // To accommodate additional fields from Supabase
}

export default function SetorPage() {
  const { id } = useParams(); // Mudando de nome para id
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [replicaTexto, setReplicaTexto] = useState<string>('');

  useEffect(() => {
    const fetchOcorrencias = async () => {
      console.log('Buscando ocorrências para setor:', id);
      
      // Busca o usuário atual com auth.uid()
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('acesso, vereador_id') // Adicionado vereador_id aqui
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      console.log('Dados do usuário:', userData);

      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        return;
      }

      // Query base
      let query = supabase
        .from('ocorrencias')
        .select('*')
        .eq('setor', id);

      // Aplica filtro por vereador_id apenas se não for admin
      if (userData?.acesso !== 'admin') {
        query = query.eq('vereador_id', userData?.vereador_id);
      }

      const { data, error } = await query;

      console.log('Ocorrências encontradas:', data);
      
      if (error) {
        console.error('Erro ao buscar ocorrências:', error);
        return;
      }

      setOcorrencias(data || []);
    };

    fetchOcorrencias();

    // Atualiza o channel para usar id ao invés de nome
    const channel = supabase
      .channel('ocorrencias-insert')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ocorrencias' },
        (payload) => {
          const novaOcorrencia = payload.new as Ocorrencia;
          if (novaOcorrencia.setor === id) {
            setOcorrencias((prev) => [...prev, novaOcorrencia]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]); // Mudando dependência para id

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Só faz algo se mudou de coluna
    if (source.droppableId !== destination.droppableId) {
      const ocorrenciaFiltrada = ocorrencias
        .filter((o) => o.status === source.droppableId)[source.index];
      const novoStatus = destination.droppableId;

      // Atualiza no banco primeiro
      const { error } = await supabase
        .from('ocorrencias')
        .update({ status: novoStatus })
        .eq('id', ocorrenciaFiltrada.id);

      if (!error) {
        // Busca o usuário atual com auth.uid()
        const { data: userData } = await supabase
          .from('usuarios')
          .select('acesso, vereador_id')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        // Query base
        let query = supabase
          .from('ocorrencias')
          .select('*')
          .eq('setor', id);

        // Aplica filtro por vereador_id apenas se não for admin
        if (userData?.acesso !== 'admin') {
          query = query.eq('vereador_id', userData?.vereador_id);
        }

        const { data } = await query;
        setOcorrencias(data || []);
      }
    }
  };

  const openModal = (ocorrencia: Ocorrencia) => {
    setSelectedOcorrencia(ocorrencia);
    setReplicaTexto(ocorrencia.replica || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOcorrencia(null);
    setIsModalOpen(false);
  };

  const toggleCardExpansion = (id: string) => {
    setExpandedCardId((prevId) => (prevId === id ? null : id));
  };

  return (
    <div className="setor-page-container">
      <h1>Ocorrências do Setor: {id}</h1>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="trello-board">
          {['Enviado', 'Recebida', 'Em análise', 'Finalizada'].map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div
                  className="trello-column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h2>{status}</h2>
                  {ocorrencias
                    .filter((ocorrencia) => ocorrencia.status === status)
                    .map((ocorrencia, index) => (
                      <Draggable
                        key={ocorrencia.id}
                        draggableId={ocorrencia.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className={`trello-card ${ocorrencia.status
                              .toLowerCase()
                              .replace(' ', '-')}`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={(e) => {
                              e.stopPropagation(); // Evita conflitos com eventos de arrastar
                              openModal(ocorrencia);
                            }}
                          >
                            <h3>{ocorrencia.titulo}</h3>
                            <p>{ocorrencia.descricao}</p>
                            <button onClick={() => toggleCardExpansion(ocorrencia.id)}>
                              {expandedCardId === ocorrencia.id ? 'Menos' : 'Mais'}
                            </button>
                            {expandedCardId === ocorrencia.id && (
                              <div className="ocorrencia-detalhes">
                                {ocorrencia.foto_url && (
                                  <img
                                    src={ocorrencia.foto_url}
                                    alt="Foto da Ocorrência"
                                    className="ocorrencia-foto"
                                  />
                                )}
                                <p><strong>Endereço:</strong> {ocorrencia.endereco || 'Não informado'}</p>
                                <p><strong>Enviado em:</strong> {new Date(ocorrencia.created_at).toLocaleDateString()}</p>
                                <p><strong>Setor:</strong> {ocorrencia.setor}</p>
                                <p><strong>Nome do Vereador:</strong> {ocorrencia.vereador_nome || 'Não informado'}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      {isModalOpen && selectedOcorrencia && (
        <div className="modal">
          <h2>Detalhes da Ocorrência</h2>
          <p><strong>Título:</strong> {selectedOcorrencia.titulo}</p>
          <p><strong>Descrição:</strong> {selectedOcorrencia.descricao}</p>
          <label>
            Réplica:
            <textarea
              value={replicaTexto}
              onChange={e => setReplicaTexto(e.target.value)}
              rows={4}
              style={{ width: '100%' }}
            />
          </label>
          <button onClick={async () => {
            // Atualiza no banco
            await supabase
              .from('ocorrencias')
              .update({ replica: replicaTexto })
              .eq('id', selectedOcorrencia.id);

            // Atualiza localmente (opcional)
            setOcorrencias(prev =>
              prev.map(o =>
                o.id === selectedOcorrencia.id ? { ...o, replica: replicaTexto } : o
              )
            );
            setIsModalOpen(false);
          }}>
            Confirmar
          </button>
          <button onClick={closeModal}>Cancelar</button>
        </div>
      )}
    </div>
  );
}