import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';


import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import ProtectedRoute from './router/ProtectedRoute';
import CompletarCadastroPage from './pages/CompletarCadastro';
import { DetalhesPedido } from './pages/DetalhesPedido';
import { PerfilPage } from './pages/PerfilPage';
import { EditarPerfilPage } from './pages/EditarPerfilPage';
import { EsqueciSenhaPage } from './pages/EsqueciSenhaPage.tsx'; 
import { RedefinirSenhaPage } from './pages/RedefinirSenhaPage';



const ProfileRedirect = () => {
  const { user } = useAuth();

  return user ? <Navigate to={`/perfil/${user.id}`} replace /> : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
          <Route path="/redefinir-senha/:token" element={<RedefinirSenhaPage />} />

          {/* Rotas Protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/completar-cadastro" 
            element={
              <ProtectedRoute>
                <CompletarCadastroPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pedidos/:id" 
            element={
              <ProtectedRoute>
                <DetalhesPedido />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/perfil/:userId" 
            element={
              <ProtectedRoute>
                <PerfilPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute>
                <ProfileRedirect />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/perfil/editar" 
            element={
              <ProtectedRoute>
                <EditarPerfilPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;