import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';


import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import ProtectedRoute from './router/ProtectedRoute';
import CompletarCadastroPage from './pages/CompletarCadastro';
import { DetalhesPedido } from './pages/DetalhesPedido';

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
    // 2. Adicione a nova rota dinâmica aqui
    path: '/pedidos/:id',
    element: (
      <ProtectedRoute>
        <DetalhesPedido />
      </ProtectedRoute>
    ),
  },
]);


function App() {
  return (
    <AuthProvider>

        <RouterProvider router={router} />

    </AuthProvider>
  );
}

export default App;