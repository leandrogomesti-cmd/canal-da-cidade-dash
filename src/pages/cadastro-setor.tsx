import { useState } from 'react';
import { supabase } from '../services/supabase';
import '../styles/pages/cadastro-setor.css';

export default function CadastroSetor() {
  const [nome, setNome] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { error } = await supabase.from('setores').insert({ nome, responsavel });

    if (error) {
      setError('Erro ao cadastrar setor: ' + error.message);
    } else {
      setSuccess('Setor cadastrado com sucesso!');
      setNome('');
      setResponsavel('');
    }
  };

  return (
    <div className="cadastro-setor-container">
      <form className="cadastro-setor-form" onSubmit={handleCadastro}>
        <h2>Cadastro de Setor</h2>

        <label>Nome do Setor:</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <label>Responsável:</label>
        <input
          type="text"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}