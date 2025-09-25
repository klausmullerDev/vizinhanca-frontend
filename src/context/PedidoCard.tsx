import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import type { User } from '../../src/context/AuthContext';

type Author = {
    id: string;
    name: string;
    avatar?: string;
};

type Pedido = {
    id: string;
    titulo: string;
    descricao: string;
    createdAt: string;
    author: Author;
    currentUserHasInterest: boolean;
};

interface PedidoCardProps {
    pedido: Pedido;
    loggedInUser: User | null;
    onVerDetalhes: () => void;
    onEditar: () => void;
    onDeletar: (id: string) => void;
}

export const PedidoCard: React.FC<PedidoCardProps> = ({ pedido, loggedInUser, onVerDetalhes, onEditar, onDeletar }) => {
    const isMyPedido = loggedInUser?.id === pedido.author.id;

    const avatarSrc = pedido.author.avatar
        ? (pedido.author.avatar.startsWith('http') ? pedido.author.avatar : `${import.meta.env.VITE_API_BASE_URL}${pedido.author.avatar}`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(pedido.author.name)}&background=e0e7ff&color=4338ca&size=128`;

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
                        <button className="p-2 rounded-full hover:bg-slate-100">
                            <MoreHorizontal className="w-5 h-5 text-slate-500" />
                        </button>
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
                            <button onClick={onEditar} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Edit className="w-4 h-4" /> Editar</button>
                            <button onClick={() => onDeletar(pedido.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Apagar</button>
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