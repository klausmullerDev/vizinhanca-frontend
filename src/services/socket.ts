import { io } from 'socket.io-client';

// A URL do servidor de WebSocket é a mesma da nossa API.
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

// A conexão é estabelecida aqui e exportada para ser usada em outros lugares.
export const socket = io(SOCKET_URL, {
  // Desabilita a conexão automática. Conectaremos manualmente quando necessário.
  autoConnect: false,
});

// Opcional: Logs para debug no console do navegador, úteis durante o desenvolvimento.
socket.on('connect', () => {
  console.log('🔌 Conectado ao servidor de WebSocket!');
});

socket.on('disconnect', () => {
  console.log('🔌 Desconectado do servidor de WebSocket.');
});