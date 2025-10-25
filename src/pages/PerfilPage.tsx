import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { LogOut, Edit } from 'lucide-react';

import { createResourceURL } from '@/utils/createResourceURL';
import { PedidoCard } from '../components/Pedidos/PedidoCard';
import { EditarPedidoModal } from '../components/Pedidos/EditarPedidoModal';
import Notification from '../components/Notification';
import { Loader } from '../components/Ui/Loader';
import { ReputacaoUsuario } from '../components/Ui/ReputacaoUsuario';
import { AvaliacaoModal } from '../components/avaliação/AvalicaoModal';


type Avaliador = {
    name: string;
    avatar?: string;
};

type Avaliacao = {
    id: string;
    nota: number;
    comentario: string;
    avaliador: Avaliador;
};

type Reputacao = {
    mediaGeral: number;
    totalAvaliacoes: number;
    avaliacoesRecentes: Avaliacao[];
};

type Endereco = { rua: string; numero: string; cidade: string; estado: string; cep: string; };

type ProfileUser = { 
    id: string;
    name: string;
    email: string;
    createdAt: string;
    endereco?: Endereco;
    avatar?: string;
    reputacao?: Reputacao; 
};

type Interesse = {
    user: { id: string; name: string; avatar?: string; }
};

type Ajudante = { id: string; name: string; } | null;

// TIPO CORRIGIDO (sem o erro de digitação)
export type Pedido = {
    id: string;
    titulo: string;
    descricao: string;
    status: 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
    imagem?: string;
    createdAt: string;
    author: { id: string; name: string; avatar?: string; };
    ajudante?: Ajudante;
    donoJaAvaliou?: boolean;
    ajudanteJaAvaliou?: boolean;
    usuarioJaDemonstrouInteresse: boolean; // <--- CORRIGIDO AQUI
    interesses: Interesse[];
    interessesCount: number;
};

export const PerfilPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user: loggedInUser, logout } = useAuth();
    const navigate = useNavigate();

    const [profileUser, setProfileUser] = useState<ProfileUser | null>(null); 
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [modalEdicaoAberto, setModalEdicaoAberto] = useState<Pedido | null>(null);

    // Estado para controlar qual pedido está sendo avaliado
    const [pedidoParaAvaliar, setPedidoParaAvaliar] = useState<Pedido | null>(null);

    const isMyProfile = loggedInUser && loggedInUser.id === userId;

    const fetchProfileData = useCallback(async () => {
        if (!userId) {
            setError("ID de usuário não encontrado.");
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const [userResponse, pedidosResponse] = await Promise.all([
                api.get(`/users/${userId}`),
                api.get(`/users/${userId}/pedidos`)
            ]);
            setProfileUser(userResponse.data);
            setPedidos(pedidosResponse.data);
        } catch (err) {
            setError('Não foi possível carregar o perfil. O usuário pode não existir.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { fetchProfileData(); }, [fetchProfileData]);

    const handleLogout = () => { logout(); navigate('/login'); };

    const onPedidoAtualizado = (pedidoAtualizado: Pedido) => {
        setModalEdicaoAberto(null);
        setPedidos(prev => prev.map(p => p.id === pedidoAtualizado.id ? pedidoAtualizado : p));
        setNotification({ message: 'Pedido atualizado com sucesso!', type: 'success' });
    };

    const onPedidoDeletado = (pedidoId: string) => {
        setPedidos(prevPedidos => prevPedidos.filter(p => p.id !== pedidoId));
        setNotification({ message: 'Pedido apagado com sucesso.', type: 'success' });
    };

    const handleManifestarInteresse = async (pedidoId: string) => {
        try {
            await api.post(`/pedidos/${pedidoId}/interesse`);
            setPedidos(pedidosAtuais => {
                return pedidosAtuais.map(p => {
                    if (p.id !== pedidoId) return p;
                    const novoInteresse: Interesse = { user: { id: loggedInUser!.id, name: loggedInUser!.name, avatar: loggedInUser!.avatar } };
                    return {
                        ...p,
                        usuarioJaDemonstrouInteresse: true,
                        interessesCount: (p.interessesCount || 0) + 1,
                        interesses: [...(p.interesses || []), novoInteresse],
                    };
                })
            });
            setNotification({ message: 'Interesse registrado! O morador foi notificado.', type: 'success' });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao registrar interesse.';
            setNotification({ message, type: 'error' });
        }
    };

    const handleCancelarPedido = async (pedidoId: string) => {
        try {
            const response = await api.patch(`/pedidos/${pedidoId}/cancelar`);
            setPedidos(prev => prev.map(p => p.id === pedidoId ? response.data : p));
            setNotification({ message: 'Pedido cancelado com sucesso.', type: 'success' });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao cancelar o pedido.';
            setNotification({ message, type: 'error' });
        }
    };

    // --- NOVAS FUNÇÕES PARA O FLUXO DE CONCLUSÃO E AVALIAÇÃO ---

    const handleConcluirPedido = async (pedidoId: string) => {
        try {
            const response = await api.patch(`/pedidos/${pedidoId}/concluir`);
            setPedidos(prev => prev.map(p => p.id === pedidoId ? response.data : p));
            setNotification({ message: 'Pedido marcado como concluído!', type: 'success' });
        } catch (error: any) {
            setNotification({ message: error.response?.data?.message || 'Erro ao concluir o pedido.', type: 'error' });
        }
    };

    const handleAbrirModalAvaliacao = (pedidoId: string) => {
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (pedido) setPedidoParaAvaliar(pedido);
    };
    
    const handleFecharModalAvaliacao = () => {
        setPedidoParaAvaliar(null);
    };
    
    const handleAvaliacaoEnviada = () => {
        setPedidoParaAvaliar(null);
        setNotification({ message: 'Avaliação enviada com sucesso! Obrigado.', type: 'success' });
        fetchProfileData();
    };

    if (loading) { return <div className="flex justify-center items-center h-screen"><Loader /></div>; }

    if (error || !profileUser) {
        return <div className="flex flex-col justify-center items-center h-screen text-center"><h2 className="text-xl font-semibold text-red-600">{error || "Usuário não encontrado."}</h2><button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-600 font-semibold">Voltar ao Mural</button></div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <Notification notification={notification} onClose={() => setNotification(null)} />
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{isMyProfile ? 'Meu Perfil' : `Perfil de ${profileUser.name}`}</h1>
                        <p className="text-sm text-slate-500">Membro desde {new Date(profileUser.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="text-indigo-600 font-semibold text-sm hover:underline">Voltar ao Mural</button>
                </div>
            </header>

            <main className="py-8 px-4 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-5">
                        <div className="flex items-center space-x-4">
                            <img src={createResourceURL(profileUser.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=e0e7ff&color=4338ca&size=128`} alt={`Avatar de ${profileUser.name}`} className="w-16 h-16 rounded-full object-cover bg-slate-200" />
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{profileUser.name}</h2>
                                {profileUser.endereco && <p className="text-sm text-slate-500">{`${profileUser.endereco.cidade}, ${profileUser.endereco.estado}`}</p>}
                            </div>
                        </div>
                        <ReputacaoUsuario reputacao={profileUser.reputacao} userName={profileUser.name.split(' ')[0]} />
                        <div className="border-t border-slate-200 pt-5">
                            <label className="text-sm font-semibold text-slate-600">Email</label>
                            <p className="text-sm text-slate-500">{profileUser.email}</p>
                        </div>
                        {isMyProfile && (
                            <div className="border-t border-slate-200 pt-5 space-y-3">
                                <button onClick={() => navigate('/perfil/editar')} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"><Edit className="w-5 h-5" /> Editar Perfil</button>
                                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-lg hover:bg-red-200 transition-colors"><LogOut className="w-5 h-5" /> Sair da Conta</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2">
                    <h3 className="font-bold text-lg mb-4 px-1">Pedidos Criados por {profileUser.name.split(' ')[0]}</h3>
                    <div className="space-y-6">
                        {pedidos.length > 0 ? (
                            pedidos.map(pedido => (
                                <PedidoCard                                    
                                    key={pedido.id}
                                    pedido={{ ...pedido, author: { id: profileUser.id, name: profileUser.name, avatar: profileUser.avatar } }}
                                    loggedInUser={loggedInUser}
                                    onManifestarInteresse={handleManifestarInteresse}
                                    onEditar={() => setModalEdicaoAberto(pedido)}
                                    onDeletar={onPedidoDeletado}
                                    onCancelar={handleCancelarPedido}
                                    onConcluir={handleConcluirPedido}
                                    onAvaliar={handleAbrirModalAvaliacao}
                                    onVerDetalhes={() => navigate(`/pedidos/${pedido.id}`)}
                                />
                            ))
                        ) : (
                            <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-8">
                                <p className="text-slate-500 text-center">Este usuário ainda não criou nenhum pedido.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {modalEdicaoAberto && (
                <EditarPedidoModal
                    pedido={modalEdicaoAberto}
                    onClose={() => setModalEdicaoAberto(null)}
                    onPedidoAtualizado={onPedidoAtualizado}
                />
            )}

            {pedidoParaAvaliar && (
                <AvaliacaoModal
                    pedido={pedidoParaAvaliar}
                    onClose={handleFecharModalAvaliacao}
                    onAvaliacaoEnviada={handleAvaliacaoEnviada}
                />
            )}
        </div>
    );
};