import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/images/logo.png';
import { supabase } from '../services/supabase';
import '../styles/layouts/SidebarLayout.css';

export default function SidebarLayout() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Fechar menu mobile ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="home-container">
      {/* Botão do menu mobile */}
      <button className="mobile-menu-button" onClick={toggleMobileMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay do mobile */}
      <div 
        className={`sidebar-overlay ${isMobileMenuOpen ? 'show' : ''}`}
        onClick={closeMobileMenu}
      ></div>

      {/* Sidebar */}
      <div className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="logo-container">
          <img src={logo} alt="Canal da Cidade" className="logo" />
        </div>

        <nav className="menu">
          <ul>
            <li><a href="/home" onClick={closeMobileMenu}>Visão Geral</a></li>
            <li><a href="/setores" onClick={closeMobileMenu}>Ocorrências por Setores</a></li>
            <li><a href="/relatorios" onClick={closeMobileMenu}>Relatórios</a></li>
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