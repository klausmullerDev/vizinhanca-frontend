import 'bootstrap/dist/css/bootstrap.min.css';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';


import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import ProtectedRoute from './router/ProtectedRoute';
import CompletarCadastroPage from './pages/CompletarCadastro';
import { DetalhesPedido } from './pages/DetalhesPedido';
import { PerfilPage } from './pages/PerfilPage';
import { EditarPerfilPage } from './pages/EditarPerfilPage';
import EsqueciSenha from './pages/EsqueciSenha.tsx'; 
import RedefinirSenha from './pages/RedefinirSenha.tsx';



const ProfileRedirect = () => {
  const { user } = useAuth();

  return user ? <Navigate to={`/perfil/${user.id}`} replace /> : <Navigate to="/dashboard" />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/esqueci-senha',
    element: <EsqueciSenha />,
  },
  {
    path: '/redefinir-senha/:token',
    element: <RedefinirSenha />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/completar-cadastro',
    element: (
      <ProtectedRoute>
        <CompletarCadastroPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/pedidos/:id',
    element: (
      <ProtectedRoute>
        <DetalhesPedido />
      </ProtectedRoute>
    ),
  },
  {

    path: '/perfil/:userId',
    element: (
      <ProtectedRoute>
        <PerfilPage />
      </ProtectedRoute>
    )
  },
  {

    path: '/perfil',
    element: (
      <ProtectedRoute>
        <ProfileRedirect />
      </ProtectedRoute>
    )
  },
  {
    path: '/perfil/editar',
    element: (
      <ProtectedRoute>
        <EditarPerfilPage />
      </ProtectedRoute>
    )
  }
]);



function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;