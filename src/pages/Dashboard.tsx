import React, { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Notification from '../components/Notification';
import { useNavigate } from 'react-router-dom';


const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const Loader = () => <div className="border-slate-300 h-12 w-12 animate-spin rounded-full border-4 border-t-indigo-600" />;
const EmptyStateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;



type Author = { id: string; name: string };
type Pedido = { id: string; titulo: string; descricao: string; createdAt: string; author: Author };


export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalNovoPedidoAberto, setModalNovoPedidoAberto] = useState(false);
    const [modalDetalhesAberto, setModalDetalhesAberto] = useState<Pedido | null>(null);
    const [myInterests, setMyInterests] = useState<Set<string>>(new Set());
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // ... (suas funções fetchPedidos, formatTimeAgo, handleCreatePedido, handleManifestarInteresse permanecem inalteradas)
    const fetchPedidos = async () => {
        setLoading(true);
        try {
            const response = await api.get('/pedidos');
            setPedidos(response.data);
        } catch (error) {
            setNotification({ message: 'Erro ao carregar os pedidos.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
    }, []);

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

    const handleCreatePedido = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const titulo = (form.elements.namedItem('titulo') as HTMLInputElement).value;
        const descricao = (form.elements.namedItem('descricao') as HTMLTextAreaElement).value;

        if (!titulo || !descricao) {
            setNotification({ message: 'Título e descrição são obrigatórios.', type: 'error' });
            return;
        }

        try {
            await api.post('/pedidos', { titulo, descricao });
            setNotification({ message: 'Seu pedido foi publicado com sucesso!', type: 'success' });
            setModalNovoPedidoAberto(false);
            fetchPedidos();
        } catch (error) {
            setNotification({ message: 'Não foi possível criar o pedido.', type: 'error' });
        }
    };

    const handleManifestarInteresse = async (pedidoId: string) => {
        if (myInterests.has(pedidoId)) return;

        try {
            await api.post(`/pedidos/${pedidoId}/interesse`);
            setMyInterests(prev => new Set(prev).add(pedidoId));
            setNotification({ message: 'Interesse registrado! O morador foi notificado.', type: 'success' });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao registrar interesse.';
            setNotification({ message, type: 'error' });
            if (message.includes('já manifestou interesse')) {
                setMyInterests(prev => new Set(prev).add(pedidoId));
            }
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}

            <header className="bg-white/80 backdrop-blur-lg border-b border-slate-900/10 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Mural de Favores</h1>
                        <p className="text-xs sm:text-sm text-slate-500">A ajuda que você precisa está ao lado.</p>
                    </div>
                    <button onClick={() => navigate('/perfil')} className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-indigo-700 ring-2 ring-white cursor-pointer" aria-label="Acessar perfil">
                        {user?.name?.charAt(0)}
                    </button>
                </div>
            </header>

            <main className="py-8 px-4 max-w-2xl mx-auto">
                {loading ? (
                    <div className="flex justify-center pt-20"><Loader /></div>
                ) : pedidos.length > 0 ? (
                    <div className="space-y-6">
                        {pedidos.map(pedido => (
                            <div key={pedido.id} className="bg-white border border-slate-200 rounded-lg shadow-sm transition-shadow hover:shadow-lg overflow-hidden">
                                <div className="p-5 sm:p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 mr-3">
                                            {pedido.author.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{pedido.author.name}</p>
                                            <p className="text-xs text-slate-500">{formatTimeAgo(pedido.createdAt)}</p>
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{pedido.titulo}</h2>
                                    <p className="text-slate-600 line-clamp-3">{pedido.descricao}</p>
                                </div>
                                <div className="bg-slate-50/70 border-t border-slate-200 px-5 py-3 flex justify-end">
                                    <button
                                        onClick={() => setModalDetalhesAberto(pedido)}
                                        className="w-full sm:w-auto bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
                                    >
                                        Ver Detalhes e Ajudar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 sm:py-20 px-6 bg-white rounded-lg border-2 border-dashed border-slate-300">
                        <EmptyStateIcon />
                        <h2 className="mt-4 text-xl font-semibold text-slate-700">O mural está vazio.</h2>
                        <p className="mt-2 text-slate-500 max-w-sm mx-auto">Seja o primeiro a pedir um favor e incentive a colaboração na sua vizinhança!</p>
                    </div>
                )}
            </main>


            <button
                onClick={() => setModalNovoPedidoAberto(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-transform hover:scale-110"
                aria-label="Pedir um novo favor"
            >
                <PlusIcon />
            </button>


            {(modalNovoPedidoAberto || modalDetalhesAberto) && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 animate-in fade-in-0"
                    onClick={() => { setModalDetalhesAberto(null); setModalNovoPedidoAberto(false); }}
                ></div>
            )}

            {modalNovoPedidoAberto && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                    <div
                        className="bg-white rounded-lg shadow-2xl w-full max-w-lg animate-in fade-in-0 zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-800">Pedir um novo favor</h2>
                            <button onClick={() => setModalNovoPedidoAberto(false)} className="text-slate-400 hover:text-slate-700"><XIcon /></button>
                        </div>
                        <form onSubmit={handleCreatePedido} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="titulo" className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                                <input type="text" id="titulo" name="titulo" required placeholder='Ex: Furadeira emprestada por 30 minutos' className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                            <div>
                                <label htmlFor="descricao" className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                                <textarea id="descricao" name="descricao" rows={4} required placeholder="Descreva com mais detalhes o que você precisa e como um vizinho poderia ajudar." className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all">Publicar Pedido</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalDetalhesAberto && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                    <div
                        className="bg-white rounded-lg shadow-2xl w-full max-w-lg animate-in fade-in-0 zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start p-6 border-b border-slate-200">
                            <div className="pr-4">
                                <h2 className="text-xl font-bold text-slate-800">{modalDetalhesAberto.titulo}</h2>
                                <p className="text-sm text-slate-500 mt-1">Pedido por <span className="font-semibold text-slate-600">{modalDetalhesAberto.author.name}</span></p>
                            </div>
                            <button onClick={() => setModalDetalhesAberto(null)} className="text-slate-400 hover:text-slate-700 flex-shrink-0"><XIcon /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{modalDetalhesAberto.descricao}</p>
                            <div className="pt-4">
                                {user?.id === modalDetalhesAberto.author.id ? (
                                    <button disabled className="w-full bg-slate-200 text-slate-500 font-bold py-3 rounded-lg cursor-not-allowed">Este é o seu pedido</button>
                                ) : (
                                    myInterests.has(modalDetalhesAberto.id) ? (
                                        <button disabled className="w-full bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                            Interesse Enviado!
                                        </button>
                                    ) : (
                                        <button onClick={() => handleManifestarInteresse(modalDetalhesAberto.id)} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-transform hover:scale-[1.02] shadow-sm hover:shadow-lg">Eu Quero Ajudar!</button>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

