import React, { useState, type FormEvent } from 'react';
import { api } from '../../services/api';

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

interface NovoPedidoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPedidoCriado: () => void;
    setNotification: (notification: { message: string; type: 'success' | 'error' } | null) => void;
}

export const NovoPedidoModal: React.FC<NovoPedidoModalProps> = ({ isOpen, onClose, onPedidoCriado, setNotification }) => {
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!titulo.trim() || !descricao.trim()) {
            setNotification({ message: 'Título e descrição são obrigatórios.', type: 'error' });
            return;
        }
        setLoading(true);

        try {
            await api.post('/pedidos', { titulo, descricao });
            // Limpa o formulário e chama o callback de sucesso
            setTitulo('');
            setDescricao('');
            onPedidoCriado();
        } catch (error) {
            const message = (error as any).response?.data?.message || 'Não foi possível criar o pedido.';
            setNotification({ message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30" onClick={onClose}></div>
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg animate-in fade-in-0 zoom-in-95" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-6 border-b">
                        <h2 className="text-xl font-bold text-slate-800">Pedir um novo favor</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><XIcon /></button>
                    </div>
                    <form onSubmit={handleCreate} className="p-6 space-y-4">
                        <div>
                            <label htmlFor="titulo" className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                            <input 
                                type="text" 
                                id="titulo" 
                                name="titulo" 
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                required 
                                placeholder='Ex: Furadeira emprestada' 
                                className="block w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                            />
                        </div>
                        <div>
                            <label htmlFor="descricao" className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                            <textarea 
                                id="descricao" 
                                name="descricao" 
                                rows={4} 
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                required 
                                placeholder="Descreva o que você precisa." 
                                className="block w-full border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            ></textarea>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                                {loading ? 'Publicando...' : 'Publicar Pedido'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};