import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import '../styles/pages/Login.css'
import logo from '../assets/images/logo.png'
import zlogo from '../assets/images/zion_logo.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou senha incorretos.')
    } else {
      navigate('/home')
    }
  }

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h1>Bem vindo! Faça o seu login.</h1>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              placeholder="exemplo@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha:</label>
            <input
              type="password"
              placeholder="******"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>
      </div>

      <div className="logo-container">
        <img src={logo} alt="Canal da Cidade Logo" className="logo" />
        <img src={zlogo} alt="Zion Logo" className="zlogo" />
      </div>

      <footer className="login-footer">
        Copyright 2025 • Terms and conditions • Privacy policy •{' '}
        <Link to="/login-admin" className="admin-link">Usuários</Link>
      </footer>
    </div>
  )
}
