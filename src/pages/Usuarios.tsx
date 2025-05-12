import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import '../styles/pages/Usuarios.css'
import logo from '../assets/images/logo.png';

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [tipoUsuario, setTipoUsuario] = useState('Vereador')
  const [vereadorAssociado, setVereadorAssociado] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const vereadores = [
    'Almir', 'Antonio', 'Arildo', 'Clayton', 'Edemilson',
    'Edival', 'Graziela', 'Henrique', 'Luzia', 'Michel', 'Rogério'
  ]

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Cadastro realizado com sucesso! Faça login.')
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  return (
    <div className="usuarios-container">
      <form className="usuarios-form" onSubmit={handleRegister}>
        <h2>Crie sua conta</h2>

        <label>Nome:</label>
        <input
          type="text"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
        />

        <label>Telefone:</label>
        <input
          type="tel"
          value={telefone}
          onChange={e => setTelefone(e.target.value)}
          required
        />

        <label>CPF:</label>
        <input
          type="text"
          value={cpf}
          onChange={e => setCpf(e.target.value)}
          required
        />

        <label>Você é vereador ou secretário?</label>
        <select
          value={tipoUsuario}
          onChange={e => setTipoUsuario(e.target.value)}
        >
          <option value="Vereador">Vereador</option>
          <option value="Secretário">Secretário</option>
        </select>

        {tipoUsuario === 'Secretário' && (
          <>
            <label>Vereador associado:</label>
            <select
              value={vereadorAssociado}
              onChange={e => setVereadorAssociado(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {vereadores.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </>
        )}

        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <label>Senha:</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <label>Confirmar senha:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit">Criar Conta</button>
      </form>

      <footer className="usuarios-footer">
        <img src="/src/assets/images/logo.png" alt="Logo" />
        <span>A conexão direta com a população</span>
        <div className="usuarios-links">
          <a href="#">Terms and conditions</a> • <a href="#">Privacy policy</a>
        </div>
      </footer>
    </div>
  )
}
