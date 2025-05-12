// src/layouts/SidebarLayout.tsx
import { Outlet, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import { supabase } from '../services/supabase';
import '../styles/layouts/SidebarLayout.css'; // Se quiser estilizar separadamente

export default function SidebarLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <div className="sidebar">
        <div className="logo-container">
          <img src={logo} alt="Canal da Cidade" className="logo" />
        </div>

        <nav className="menu">
          <ul>
            <li><a href="/home">Visão Geral</a></li>
            <li><a href="/setores">Visão por Setores</a></li>
            <li><a href="/relatorios">Relatórios</a></li>
          </ul>
        </nav>

        <div className="logout-container">
          <button onClick={handleLogout} className="logout-button">
            Sair do sistema
          </button>
        </div>
      </div>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
