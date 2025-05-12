import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
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
  const { nome } = useParams<{ nome: string }>();
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  useEffect(() => {
    console.log('Setor selecionado:', nome);

    const fetchOcorrencias = async () => {
      const { data, error } = await supabase
        .from('ocorrencias')
        .select('id, titulo, descricao, status, endereco, created_at, setor, vereador_nome, foto_url')
        .eq('setor', nome);

      if (error) {
        console.error('Erro ao buscar ocorrências:', error);
        return;
      }

      console.log('Ocorrências retornadas:', data);
      setOcorrencias(data || []);
    };

    fetchOcorrencias();
  }, [nome]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const updatedOcorrencias = [...ocorrencias];
      const [movedItem] = updatedOcorrencias.splice(source.index, 1);
      movedItem.status = destination.droppableId;
      updatedOcorrencias.splice(destination.index, 0, movedItem);

      setOcorrencias(updatedOcorrencias);

      // Atualizar o status no Supabase
      await supabase
        .from('ocorrencias')
        .update({ status: destination.droppableId })
        .eq('id', movedItem.id);
    }
  };

  const openModal = (ocorrencia: Ocorrencia) => {
    setSelectedOcorrencia(ocorrencia);
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
      <h1>Ocorrências do Setor: {nome}</h1>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="trello-board">
          {['Recebida', 'Em análise', 'Finalizada'].map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div
                  className="trello-column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h2>{status}</h2>
                  {ocorrencias
                    .filter((ocorrencia) => {
                      const match = ocorrencia.status === status;
                      console.log(
                        `Ocorrência filtrada para status ${status}:`,
                        match ? ocorrencia : 'Nenhuma'
                      );
                      return match;
                    })
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
    </div>
  );
}