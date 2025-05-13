import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { supabase } from '../services/supabase';
import logo from '../assets/images/logo.png';
import '../styles/pages/home-admin.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeartbeat,
  faBook,
  faTools,
  faLeaf,
  faBullhorn,
  faCircle,
  faWater,
  faShieldAlt,
  faBus,
  faHandsHelping,
  faSun // <-- adicione aqui
} from '@fortawesome/free-solid-svg-icons';

// Tipos para as ocorrências
interface Ocorrencia {
  id: string;
  latitude: number;
  longitude: number;
  setor: string;
  titulo: string;
}

// Tipos para contagem de setores
interface SetorContagem {
  nome: string;
  contagem: number;
}

export default function Home() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [setoresAtivos, setSetoresAtivos] = useState<SetorContagem[]>([]);
  const [todosSetores, setTodosSetores] = useState<string[]>([]);
  const [usuarioAtual, setUsuarioAtual] = useState<any>(null);
  const navigate = useNavigate();

  // Configuração do Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyDW_3j6lM0fBH_LbEDy754BZoAFdjoQLEE' // Substitua pela sua chave API do Google Maps
  });

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  const center = {
    lat: -23.5505, // Coordenadas de São Paulo como padrão
    lng: -46.6333
  };

  // Buscar dados do usuário atual
  useEffect(() => {
    const getUsuario = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', user.id)
          .single();
          
        setUsuarioAtual(data);
      } else {
        navigate('/login');
      }
    };
    
    getUsuario();
  }, [navigate]);

  // Buscar todos os setores do banco
  useEffect(() => {
    const fetchSetores = async () => {
      const { data, error } = await supabase
        .from('setores')
        .select('nome');
      if (data) {
        setTodosSetores(data.map((s: any) => s.nome));
      }
    };
    fetchSetores();
  }, []);

  // Buscar ocorrências e montar lista de setores com contagem
  useEffect(() => {
    const fetchOcorrencias = async () => {
      const { data, error } = await supabase
        .from('ocorrencias')
        .select('setor');
      if (data) {
        // Conta quantas ocorrências por setor
        const contagem: Record<string, number> = {};
        data.forEach((o: any) => {
          contagem[o.setor] = (contagem[o.setor] || 0) + 1;
        });
        // Junta todos os setores, mesmo sem ocorrência
        const setoresCompletos = todosSetores.map(nome => ({
          nome,
          contagem: contagem[nome] || 0
        }));
        setSetoresAtivos(setoresCompletos);
      }
    };
    if (todosSetores.length > 0) fetchOcorrencias();
  }, [todosSetores]);

  // Buscar ocorrências do Supabase e configurar assinatura em tempo real
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
        
        // Calcular contagem por setor
        const contagemPorSetor: Record<string, number> = {};
        
        data.forEach((ocorrencia: Ocorrencia) => {
          if (contagemPorSetor[ocorrencia.setor]) {
            contagemPorSetor[ocorrencia.setor]++;
          } else {
            contagemPorSetor[ocorrencia.setor] = 1;
          }
        });
        
        // Converter para array de objetos
        const setoresAtivosArray = Object.keys(contagemPorSetor).map(setor => ({
          nome: setor,
          contagem: contagemPorSetor[setor]
        }));
        
        setSetoresAtivos(setoresAtivosArray);
      }
    };
    
    fetchOcorrencias();
    
    // Criar canal para escutar inserções na tabela 'ocorrencias'
    const channel = supabase
      .channel('ocorrencias-insert')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ocorrencias' },
        (payload) => {
          const novaOcorrencia = payload.new as Ocorrencia;
          setOcorrencias(prev => [...prev, novaOcorrencia]);
          
          // Atualizar contagem de setores
          setSetoresAtivos(prev => {
            const setorExistente = prev.find(s => s.nome === novaOcorrencia.setor);
            
            if (setorExistente) {
              return prev.map(s => 
                s.nome === novaOcorrencia.setor ? { ...s, contagem: s.contagem + 1 } : s
              );
            } else {
              return [...prev, { nome: novaOcorrencia.setor, contagem: 1 }];
            }
          });
        }
      )
      .subscribe();

    // Limpar a assinatura ao desmontar o componente
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Lista de ícones para os diferentes setores
  const getIconeSetor = (setor: string) => {
    switch (setor) {
      case 'Educação':
        return <FontAwesomeIcon icon={faBook} className="icone-setor educacao" />;
      case 'Infraestrutura':
        return <FontAwesomeIcon icon={faTools} className="icone-setor obras" />;
      case 'Iluminação Pública':
        return <FontAwesomeIcon icon={faSun} className="icone-setor iluminacao-publica" />;
      case 'Meio Ambiente':
        return <FontAwesomeIcon icon={faLeaf} className="icone-setor meio-ambiente" />;
      case 'Saúde':
        return <FontAwesomeIcon icon={faHeartbeat} className="icone-setor saude" />;
      case 'Comunicação':
        return <FontAwesomeIcon icon={faBullhorn} className="icone-setor comunicacao" />;
      case 'Saneamento':
        return <FontAwesomeIcon icon={faWater} className="icone-setor saneamento" />;
      case 'Defesa Cívil':
        return <FontAwesomeIcon icon={faShieldAlt} className="icone-setor defesa-civil" />;
      case 'Transporte':
        return <FontAwesomeIcon icon={faBus} className="icone-setor transporte" />;
      case 'Segurança':
        return <FontAwesomeIcon icon={faShieldAlt} className="icone-setor seguranca" />;
      case 'Assistência Social':
        return <FontAwesomeIcon icon={faHandsHelping} className="icone-setor assistencia-social" />;
      case 'Iluminação':
        return <FontAwesomeIcon icon={faSun} className="icone-setor iluminacao" />;
      default:
        return <FontAwesomeIcon icon={faCircle} className="icone-setor padrao" />;
    }
  };

  return (
    <div className="home-container">

      
      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="usuario-info">
            <span className="usuario-nome">{usuarioAtual?.nome || 'Usuário'}</span>
            <div className="usuario-avatar">
              {usuarioAtual?.foto_url ? (
                <img src={usuarioAtual.foto_url} alt={usuarioAtual.nome} />
              ) : (
                <div className="avatar-placeholder">{usuarioAtual?.nome?.[0] || 'U'}</div>
              )}
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <div className="content-area">
          {/* Map */}
          <div className="map-container">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={10}
                options={{
                  mapTypeControl: true,
                  mapTypeControlOptions: {
                    style: 2, // HORIZONTAL_BAR
                    position: 1, // TOP_LEFT
                  }
                }}
              >
                {ocorrencias.map((ocorrencia) => (
                  <Marker
                  key={ocorrencia.id}
                  position={{
                    lat: ocorrencia.latitude,
                    lng: ocorrencia.longitude
                  }}
                  title={`${ocorrencia.titulo} - ${ocorrencia.setor}`}
                />
                ))}
              </GoogleMap>
            ) : (
              <div className="loading-map">Carregando mapa...</div>
            )}
            <div className="map-attribution">
              <small>Dados cartográficos ©2025 Google • Termos • Informar erro no mapa</small>
            </div>
          </div>
          
          {/* Setores Ativos */}
          <div className="setores-container">
            <h2>Setores mais ativos</h2>
            <ul className="home-setores-list">
              {setoresAtivos.sort((a, b) => b.contagem - a.contagem).map((setor) => (
                <li className="home-setor-item" key={setor.nome}>
                  <div className="setor-item-link" /* Removido Link, agora é apenas div */>
                    {getIconeSetor(setor.nome)}
                    <span className="setor-nome">{setor.nome}: </span>
                    <span className="setor-contagem">{setor.contagem}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
