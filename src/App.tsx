import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Setores from './pages/Setores';
import Usuarios from './pages/Usuarios';
import Relatorios from './pages/Relatorios';
import LoginAdmin from './pages/login-admin'; // <-- Importação correta
import { useAuth } from './store/useAuth';
import HomeAdmin from './pages/home-admin'; // <-- Importação correta
import SidebarLayout from './layouts/SidebarLayout';
import SetorPage from './pages/SetorPage';
import CadastroSetor from './pages/cadastro-setor';
import { AuthProvider } from './contexts/AuthContext';
import MesaOcorrencias from './pages/mesa-ocorrencias';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
          <Route path="/login-admin" element={<LoginAdmin />} /> {/* <-- Rota adicionada corretamente */}
          <Route path="/home-admin" element={<HomeAdmin />} />
          <Route path="/login" element={<Login />} />

          <Route element={<SidebarLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/setores" element={<Setores />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/setor/:id" element={<SetorPage />} />
            <Route path="/cadastro-setor" element={<CadastroSetor />} />
            <Route path="/mesa-ocorrencias" element={<MesaOcorrencias />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
