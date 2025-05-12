import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import '../styles/pages/login-admin.css'

export default function LoginAdmin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error || !data.user) {
      setError('Email ou senha incorretos.')
      return
    }

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('acesso')
      .eq('id', data.user.id)
      .single()

    if (userError || !userData || userData.acesso !== 'admin') {
      setError('Acesso negado. Você não é um administrador.')
      return
    }

    navigate('/home-admin')
  }

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h1>Login Administrativo</h1>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              placeholder="admin@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required />
          </div>

          <div className="form-group">
            <label>Senha:</label>
            <input
              type="password"
              placeholder="******"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button">
            Entrar como Admin
          </button>
        </form>
      </div>
    </div>
  )
}
