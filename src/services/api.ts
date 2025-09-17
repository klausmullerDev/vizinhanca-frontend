import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor de Requisição (Request) - Perfeito, sem alterações
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Resposta (Response) - CORRIGIDO
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ALTERADO: A condição agora verifica se o erro 401 NÃO veio da página de login
    if (error.response?.status === 401 && error.config.url !== '/users/login') {
      // Esta lógica agora só roda para rotas protegidas, não para o login.
      // Ex: seu token expirou enquanto você navegava no dashboard.
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }

    // Para todos os outros erros (incluindo o 401 do login),
    // a promise é rejeitada, permitindo que o bloco .catch() do seu componente a capture.
    return Promise.reject(error);
  }
);