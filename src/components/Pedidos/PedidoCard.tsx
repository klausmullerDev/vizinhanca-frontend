import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

// Tipos (podem ser movidos para um arquivo types.ts)
type Author = { id: string; name: string };
type Pedido = { id: string; titulo: string; descricao: string; createdAt: string; author: Author };
type User = { id: string; name: string | null; email: string; } | null;

// Ícone
const MoreVerticalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>;

// Função para formatar o tempo (pode ser movida para um arquivo utils)
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "agora mesmo";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
};

interface CardPedidoProps {
  pedido: Pedido;
  loggedInUser: User;
  onVerDetalhes: () => void;
  onEditar: () => void;
  onDeletar: (pedidoId: string) => void;
}

export const PedidoCard: React.FC<CardPedidoProps> = ({ pedido, loggedInUser, onVerDetalhes, onEditar, onDeletar }) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isMyPedido = loggedInUser?.id === pedido.author.id;

  // Hook para fechar o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const handleDelete = async () => {
    setMenuAberto(false);
    if (window.confirm('Tem certeza que deseja apagar este pedido?')) {
      try {
        await api.delete(`/pedidos/${pedido.id}`);
        onDeletar(pedido.id); // Notifica o pai para remover da lista
      } catch (error) {
        alert('Não foi possível apagar o pedido.');
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm transition-shadow hover:shadow-lg overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <Link to={`/perfil/${pedido.author.id}`} className="flex items-center group">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 mr-3 group-hover:ring-2 group-hover:ring-indigo-300">
              {pedido.author.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-800 group-hover:text-indigo-600">{pedido.author.name}</p>
              <p className="text-xs text-slate-500">{formatTimeAgo(pedido.createdAt)}</p>
            </div>
          </Link>
          {isMyPedido && (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuAberto(!menuAberto)} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                <MoreVerticalIcon />
              </button>
              {menuAberto && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-md shadow-lg z-10 animate-in fade-in-0 zoom-in-95">
                  <button onClick={() => { onEditar(); setMenuAberto(false); }} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Editar</button>
                  <button onClick={handleDelete} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Apagar</button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="cursor-pointer" onClick={onVerDetalhes}>
          <h2 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
            {pedido.titulo}
          </h2>
          <p className="text-slate-600 line-clamp-3">{pedido.descricao}</p>
        </div>
      </div>
      <div className="bg-slate-50/70 border-t border-slate-200 px-5 py-3 flex justify-end">
        <button onClick={onVerDetalhes} className="w-full sm:w-auto bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors text-sm">
          Ver Detalhes {isMyPedido ? '' : 'e Ajudar'}
        </button>
      </div>
    </div>
  );
};