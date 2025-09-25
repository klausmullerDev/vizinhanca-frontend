import React, { useState, useRef, useEffect } from 'react'; // Adicionado useState, useRef, useEffect
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { formatDistanceToNow } from 'date-fns'; // Adicionado para formatação de data
import { ptBR } from 'date-fns/locale'; // Adicionado para localização em português
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'; // Ícones para o menu de ações
import type { User } from '../../context/AuthContext'; // Importando o tipo User
import { createResourceURL } from '../../context/createResourceURL';

// Tipos (podem ser movidos para um arquivo types.ts)
type Author = {
    id: string;
    name: string;
    avatar?: string; // Adicionado campo avatar
};
type Pedido = { id: string; titulo: string; descricao: string; createdAt: string; author: Author; currentUserHasInterest: boolean; };

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
  loggedInUser: User | null;
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

  // Constrói a URL completa do avatar ou usa um fallback
  const avatarSrc = createResourceURL(pedido.author.avatar)
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(pedido.author.name)}&background=e0e7ff&color=4338ca&size=128`;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 transition-shadow hover:shadow-md">
        <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
                <img 
                    src={avatarSrc} 
                    alt={`Avatar de ${pedido.author.name}`}
                    className="w-10 h-10 rounded-full object-cover bg-slate-200"
                />
                <div>
                    <p className="font-semibold text-slate-800">{pedido.author.name}</p>
                    <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(pedido.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                </div>
            </div>
            {isMyPedido && (
                 <div className="relative group">
                        <button onClick={() => setMenuAberto(!menuAberto)} className="p-2 rounded-full hover:bg-slate-100">
                        <MoreHorizontal className="w-5 h-5 text-slate-500" />
                    </button>
                        <div ref={menuRef} className={`absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-slate-200 transition-opacity z-10 ${menuAberto ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                            <button onClick={() => { onEditar(); setMenuAberto(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Edit className="w-4 h-4" /> Editar</button>
                            <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Apagar</button>
                    </div>
                </div>
            )}
        </div>

        <div className="mt-4">
            <h3 className="text-lg font-bold text-slate-900">{pedido.titulo}</h3>
            <p className="mt-1 text-slate-600 line-clamp-3">{pedido.descricao}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
            <button onClick={onVerDetalhes} className="w-full bg-indigo-50 text-indigo-700 font-bold py-2 px-4 rounded-lg hover:bg-indigo-100 transition-colors">
                Ver Detalhes e Ajudar
            </button>
        </div>
    </div>
  );
};