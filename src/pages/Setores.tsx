import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/Setores.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLightbulb, 
  faShieldVirus, 
  faBook, 
  faTools, 
  faLeaf, 
  faHeartbeat, 
  faShieldAlt, 
  faBus, 
  faWater, 
  faHandsHelping,
  faCircle
} from '@fortawesome/free-solid-svg-icons';

interface Setor {
  id: string;
  nome: string;
  responsavel: string;
}

export default function Setores() {
  const [setores, setSetores] = useState<Setor[]>([]);
  const { userData } = useAuth();

  useEffect(() => {
    const fetchSetores = async () => {
      // Remove a verificação de vereador_id pois queremos todos os setores
      const { data, error } = await supabase
        .from('setores')
        .select('*');

      if (!error && data) {
        setSetores(data);
      } else {
        console.error('Erro ao buscar setores:', error);
      }
    };

    fetchSetores();
  }, []); // Remove a dependência do userData

  const getIconeSetor = (setor: string) => {
    switch (setor) {
      case 'Educação':
        return <FontAwesomeIcon icon={faBook} className="icone-setor educacao" />;
      case 'Infraestrutura':
        return <FontAwesomeIcon icon={faTools} className="icone-setor infraestrutura" />;
      case 'Iluminação Pública':
        return <FontAwesomeIcon icon={faLightbulb} className="icone-setor iluminacao-publica" />;
      case 'Meio Ambiente':
        return <FontAwesomeIcon icon={faLeaf} className="icone-setor meio-ambiente" />;
      case 'Saúde':
        return <FontAwesomeIcon icon={faHeartbeat} className="icone-setor saude" />;
      case 'Segurança':
        return <FontAwesomeIcon icon={faShieldAlt} className="icone-setor seguranca" />;
      case 'Transporte':
        return <FontAwesomeIcon icon={faBus} className="icone-setor transporte" />;
      case 'Saneamento':
        return <FontAwesomeIcon icon={faWater} className="icone-setor saneamento" />;
      case 'Assistência Social':
        return <FontAwesomeIcon icon={faHandsHelping} className="icone-setor assistencia-social" />;
      case 'Defesa Civil':
        return <FontAwesomeIcon icon={faShieldVirus} className="icone-setor defesa-civil" />;
      default:
        return <FontAwesomeIcon icon={faCircle} className="icone-setor padrao" />;
    }
  };

  return (
    <div className="setores-container">
      <h1>Lista de Setores</h1>
      <ul className="setores-list">
        {setores.map((setor) => (
          <li key={setor.id} className="setor-item">
            <Link
              to={`/setor/${encodeURIComponent(setor.nome)}`}
              style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              {getIconeSetor(setor.nome)}
              <strong>{setor.nome}</strong> - Responsável: {setor.responsavel}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}