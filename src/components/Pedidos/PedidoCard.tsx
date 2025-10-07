import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoreHorizontal, Edit, Trash2, Check, XCircle } from 'lucide-react';
import type { User } from '../../context/AuthContext'; // Ajuste no tipo
import { createResourceURL } from '@/utils/createResourceURL';
import { InterestedUsersStack } from '../InterestedUsersStack';


type Author = {
    id: string;
    name: string;
    avatar?: string;
};

type Interesse = {
    user: {
        id: string;
        name: string;
        avatar?: string;
    }
};

type Pedido = {
    id: string;
    titulo: string;
    descricao: string;
    imagem?: string;
    status: string;
    createdAt: string;
    author: Author;
    usuarioJaDemonstrouInteresse: boolean;
    interesses: Interesse[];
    interessesCount: number; 
};

interface CardPedidoProps {
  pedido: Pedido;
  loggedInUser: User | null;
  onManifestarInteresse: (pedidoId: string) => void;
  onEditar: () => void;
  onDeletar: (pedidoId: string) => void;
  onCancelar: (pedidoId: string) => void;
}

export const PedidoCard: React.FC<CardPedidoProps> = ({ pedido, loggedInUser, onManifestarInteresse, onEditar, onDeletar, onCancelar }) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMyPedido = loggedInUser?.id === pedido.author.id;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuRef]);

  const handleDelete = async () => {
    setMenuAberto(false);
    if (window.confirm('Tem certeza que deseja apagar este pedido?')) {
      try {
        await api.delete(`/pedidos/${pedido.id}`);
        onDeletar(pedido.id);
      } catch (error) {
        alert('Não foi possível apagar o pedido.');
      }
    }
  };

  const handleCancel = async () => {
    setMenuAberto(false);
    if (window.confirm('Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.')) {
      // A lógica da API será chamada pelo componente pai (Dashboard/Perfil)
      // para manter o estado centralizado.
      onCancelar(pedido.id);
    }
  };

  const avatarSrc = createResourceURL(pedido.author.avatar)
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(pedido.author.name)}&background=e0e7ff&color=4338ca&size=128`;

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-slate-200/80 p-4">
        <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
                <Link to={`/perfil/${pedido.author.id}`}>
                    <img 
                        src={avatarSrc} 
                        alt={`Avatar de ${pedido.author.name}`}
                        className="w-10 h-10 rounded-full object-cover bg-slate-200 hover:ring-2 hover:ring-indigo-300 transition-all"
                    />
                </Link>
                <div>
                    <Link to={`/perfil/${pedido.author.id}`} className="font-semibold text-slate-800 hover:underline">{pedido.author.name}</Link>
                    <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(pedido.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                </div>
            </div>
            {isMyPedido && (
                 <div className="relative group">
                    <button onClick={() => setMenuAberto(!menuAberto)} className="p-2 rounded-full hover:bg-slate-100" aria-label="Opções do pedido">
                        <MoreHorizontal className="w-5 h-5 text-slate-500" />
                    </button>
                    <div ref={menuRef} className={`absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-slate-200 transition-all z-10 ${menuAberto ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                        {pedido.status === 'ABERTO' && (
                            <button onClick={() => { onEditar(); setMenuAberto(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Edit className="w-4 h-4" /> Editar</button>
                        )}
                        {['ABERTO', 'EM_ANDAMENTO'].includes(pedido.status) && (
                            <button onClick={handleCancel} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><XCircle className="w-4 h-4" /> Cancelar</button>
                        )}
                        <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Apagar</button>
                    </div>
                </div>
            )}
        </div>

        {pedido.imagem && (
            <div className="mt-4 -mx-4 bg-slate-100">
                <img 
                    src={createResourceURL(pedido.imagem)} 
                    alt={`Imagem do pedido: ${pedido.titulo}`}
                    className="w-full h-auto max-h-[400px] object-cover"
                />
            </div>
        )}

        <div className="mt-4">
            <h3 className="text-lg font-semibold text-slate-800">{pedido.titulo}</h3>
            <p className="mt-1 text-slate-600 line-clamp-3">{pedido.descricao}</p>
        </div>

        {(pedido.interesses?.length > 0 || pedido.interessesCount > 0) && (
            <div className="mt-4">
                <InterestedUsersStack
                    interesses={pedido.interesses}
                    totalCount={pedido.interessesCount}
                />
            </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-200">
            <Link to={`/pedidos/${pedido.id}`} className="w-full">
                <button 
                    className="w-full font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    // Desabilita o clique se não for para a página de detalhes
                    onClick={(e) => {
                        // Se o pedido não estiver aberto e não for o do usuário, o botão é só um link
                        if (pedido.status !== 'ABERTO' || isMyPedido) {
                            return;
                        }
                        // Se for para manifestar interesse, previne a navegação e chama a função
                        if (!pedido.usuarioJaDemonstrouInteresse) {
                            e.preventDefault();
                            onManifestarInteresse(pedido.id);
                        }
                    }}
                    // Estilo dinâmico baseado no status
                    style={{
                        backgroundColor: isMyPedido ? '#f1f5f9' : (pedido.status !== 'ABERTO' ? '#f1f5f9' : (pedido.usuarioJaDemonstrouInteresse ? '#dcfce7' : '#4f46e5')),
                        color: isMyPedido ? '#64748b' : (pedido.status !== 'ABERTO' ? '#64748b' : (pedido.usuarioJaDemonstrouInteresse ? '#166534' : 'white')),
                        cursor: (isMyPedido || (pedido.status !== 'ABERTO')) ? 'pointer' : (pedido.usuarioJaDemonstrouInteresse ? 'pointer' : 'pointer'),
                    }}
                >
                    {isMyPedido && 'Ver meu pedido'}
                    {!isMyPedido && pedido.status === 'ABERTO' && !pedido.usuarioJaDemonstrouInteresse && 'Eu quero ajudar!'}
                    {!isMyPedido && pedido.status === 'ABERTO' && pedido.usuarioJaDemonstrouInteresse && <><Check className="w-5 h-5" /> Interesse Enviado</>}
                    {!isMyPedido && pedido.status === 'EM_ANDAMENTO' && 'Ver andamento'}
                    {!isMyPedido && pedido.status === 'CANCELADO' && 'Pedido cancelado'}
                    {!isMyPedido && pedido.status === 'FINALIZADO' && 'Ver detalhes'}
                </button>
            </Link>
        </div>
    </div>
  );
};