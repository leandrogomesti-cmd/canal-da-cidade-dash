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

interface Setor {
  id: string;
  nome: string;
  email: string;
}

export default function SetorPage() {
  const { id } = useParams(); // Mudando de nome para id
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [replicaTexto, setReplicaTexto] = useState<string>('');
  const [setorEmail, setSetorEmail] = useState<string>('');

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

    const fetchSetorEmail = async () => {
      const { data: setorData, error } = await supabase
        .from('setores')
        .select('email')
        .eq('nome', id)
        .single();

      if (error) {
        console.error('Erro ao buscar email do setor:', error);
        return;
      }

      if (setorData?.email) {
        setSetorEmail(setorData.email);
      }
    };

    fetchOcorrencias();
    fetchSetorEmail();

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

  const handleSendEmail = () => {
    if (!selectedOcorrencia || !setorEmail) {
      alert('Email do setor não encontrado');
      return;
    }

    const subject = `🔔 Ocorrência: ${selectedOcorrencia.titulo}`;
    
    // Corpo HTML para email mais bonito
    const htmlBody = `
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">📋 Nova Ocorrência</h1>
    <p style="color: #f0f0f0; margin: 5px 0 0 0;">Sistema de Gestão Municipal</p>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef;">
    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color: #495057; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-top: 0;">
        ${selectedOcorrencia.titulo}
      </h2>
      
      <div style="margin: 20px 0;">
        <h3 style="color: #6c757d; margin-bottom: 10px;">📝 Descrição:</h3>
        <p style="background: #f8f9fa; padding: 12px; border-left: 4px solid #007bff; margin: 0;">
          ${selectedOcorrencia.descricao}
        </p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
        <div>
          <strong style="color: #495057;">📍 Status:</strong><br>
          <span style="background: ${selectedOcorrencia.status === 'Finalizada' ? '#28a745' : selectedOcorrencia.status === 'Em análise' ? '#ffc107' : '#6c757d'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
            ${selectedOcorrencia.status}
          </span>
        </div>
        <div>
          <strong style="color: #495057;">🏢 Setor:</strong><br>
          ${selectedOcorrencia.setor}
        </div>
        <div>
          <strong style="color: #495057;">🏠 Endereço:</strong><br>
          ${selectedOcorrencia.endereco || 'Não informado'}
        </div>
        <div>
          <strong style="color: #495057;">📅 Data:</strong><br>
          ${new Date(selectedOcorrencia.created_at).toLocaleDateString('pt-BR')}
        </div>
      </div>
      
      ${selectedOcorrencia.vereador_nome ? `
      <div style="margin: 15px 0;">
        <strong style="color: #495057;">👤 Vereador Responsável:</strong><br>
        ${selectedOcorrencia.vereador_nome}
      </div>
      ` : ''}
      
      ${selectedOcorrencia.replica ? `
      <div style="margin: 20px 0;">
        <h3 style="color: #6c757d; margin-bottom: 10px;">💬 Réplica:</h3>
        <p style="background: #e3f2fd; padding: 12px; border-left: 4px solid #2196f3; margin: 0;">
          ${selectedOcorrencia.replica}
        </p>
      </div>
      ` : ''}
      
      ${selectedOcorrencia.foto_url ? `
      <div style="margin: 20px 0; text-align: center;">
        <h3 style="color: #6c757d; margin-bottom: 15px;">📸 Foto da Ocorrência:</h3>
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px;">
          <img src="${selectedOcorrencia.foto_url}" alt="Foto da Ocorrência" style="max-width: 100%; height: auto; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #856404;">
            <a href="${selectedOcorrencia.foto_url}" style="color: #007bff; text-decoration: none;">🔗 Clique aqui para ver em tamanho original</a>
          </p>
        </div>
      </div>
      ` : ''}
    </div>
  </div>
  
  <div style="background: #6c757d; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
    <p style="margin: 0; font-size: 14px;">
      ⚙️ Esta mensagem foi gerada automaticamente pelo Sistema de Gestão Municipal
    </p>
    <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">
      Data de envio: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
    </p>
  </div>
</body>
</html>`;

    // Fallback em texto simples para clientes que não suportam HTML
    const textBody = `
NOVA OCORRÊNCIA - ${selectedOcorrencia.titulo}

DETALHES:
═══════════════════════════════════════

📝 Descrição: ${selectedOcorrencia.descricao}
📍 Status: ${selectedOcorrencia.status}
🏢 Setor: ${selectedOcorrencia.setor}
🏠 Endereço: ${selectedOcorrencia.endereco || 'Não informado'}
👤 Vereador: ${selectedOcorrencia.vereador_nome || 'Não informado'}
📅 Data: ${new Date(selectedOcorrencia.created_at).toLocaleDateString('pt-BR')}
${selectedOcorrencia.replica ? `💬 Réplica: ${selectedOcorrencia.replica}` : ''}
${selectedOcorrencia.foto_url ? `
📸 FOTO DA OCORRÊNCIA:
${selectedOcorrencia.foto_url}

(Copie e cole o link acima no navegador para visualizar)` : ''}

═══════════════════════════════════════
⚙️ Canal da Cidade de Mirante do Paranapanema
📧 Enviado automaticamente em ${new Date().toLocaleDateString('pt-BR')}
    `.trim();

    // Tenta usar HTML primeiro, se não funcionar usa texto simples
    const mailtoLink = `mailto:${setorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(htmlBody)}`;
    
    // Fallback para texto simples se o HTML for muito longo
    if (mailtoLink.length > 2048) {
      const simpleMailtoLink = `mailto:${setorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(textBody)}`;
      window.location.href = simpleMailtoLink;
    } else {
      window.location.href = mailtoLink;
    }
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
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
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
            <button onClick={handleSendEmail}>
              Enviar Ocorrência ao Setor
            </button>
            <button onClick={closeModal}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}