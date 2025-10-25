import React, { useState, useEffect, type FormEvent } from 'react';
import { api } from '../../services/api';

type Pedido = {
    id: string;
    titulo: string;
    descricao: string;
    status: 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
    imagem?: string;
    createdAt: string;
    author: { id: string; name: string; avatar?: string; };
    usuarioJaDemonstrouInteresse: boolean;
    interesses: any[];
    interessesCount: number;
};

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

interface EditarPedidoModalProps {
    pedido: Pedido;
    onClose: () => void;
    onPedidoAtualizado: (pedidoAtualizado: Pedido) => void;
}

export const EditarPedidoModal: React.FC<EditarPedidoModalProps> = ({ pedido, onClose, onPedidoAtualizado }) => {
    const [titulo, setTitulo] = useState(pedido.titulo);
    const [descricao, setDescricao] = useState(pedido.descricao);
    const [loading, setLoading] = useState(false);

    // Sincroniza o estado se o pedido prop mudar
    useEffect(() => {
        setTitulo(pedido.titulo);
        setDescricao(pedido.descricao);
    }, [pedido]);

    const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!titulo.trim() || !descricao.trim()) {
            // A notificação de erro pode ser gerenciada pelo componente pai se necessário
            return;
        }
        setLoading(true);

        try {
            const response = await api.patch(`/pedidos/${pedido.id}`, { titulo, descricao });
            onPedidoAtualizado(response.data);
        } catch (error) {
            console.error('Erro ao atualizar o pedido:', error);
            // O componente pai (Dashboard) já lida com notificações de erro da API
        } finally {
            setLoading(false);
        }
    };

    return (
        <>  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold">Editando: {pedido.titulo}</h2>
                {/* SEU FORMULÁRIO DE EDIÇÃO VEM AQUI */}
                <button onClick={onClose} className="mt-4">Fechar</button>
            </div>
            </div>
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30" onClick={onClose}></div>
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg animate-in fade-in-0 zoom-in-95" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-xl font-bold text-slate-800">Editar Pedido</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><XIcon /></button>
                    </div>
                    <form onSubmit={handleUpdate} className="p-6 space-y-4">
                        <div>
                            <label htmlFor="titulo-edit" className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                            <input 
                                type="text" 
                                id="titulo-edit" 
                                name="titulo" 
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                required 
                                className="block w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                            />
                        </div>
                        <div>
                            <label htmlFor="descricao-edit" className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                            <textarea 
                                id="descricao-edit" 
                                name="descricao" 
                                rows={4} 
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                required 
                                className="block w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            ></textarea>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};