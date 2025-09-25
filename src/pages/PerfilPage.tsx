// pages/PerfilPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

import { createResourceURL } from '@/utils/createResourceURL';
import { PedidoCard } from '../components/Pedidos/PedidoCard';
import { DetalhesPedidoModal } from '../components/Pedidos/DetalhesPedidoModal';
import { EditarPedidoModal } from '../components/Pedidos/EditarPedidoModal';
import Notification from '../components/Notification';
import { EmptyState } from '../components/Ui/EmptyState';

// Ícones e Componentes de UI
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const Loader = () => <div className="border-slate-300 h-12 w-12 animate-spin rounded-full border-4 border-t-indigo-600" />;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;

// Tipos para os dados da API
type Endereco = { rua: string; numero: string; cidade: string; estado: string; cep: string; };
type ProfileUser = { id: string; name: string; email: string; createdAt: string; endereco?: Endereco; avatar?: string; };
type Author = { id: string; name: string; avatar?: string; };
type Pedido = {
    id: string;
    titulo: string;
    descricao: string;
    imagem?: string;
    createdAt: string;
    author: Author;
    currentUserHasInterest: boolean;
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

    const [modalDetalhesAberto, setModalDetalhesAberto] = useState<Pedido | null>(null);
    const [modalEdicaoAberto, setModalEdicaoAberto] = useState<Pedido | null>(null);

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

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const onPedidoAtualizado = () => {
        setModalEdicaoAberto(null);
        setNotification({ message: 'Pedido atualizado com sucesso!', type: 'success' });
        fetchProfileData();
    };

    const onPedidoDeletado = (pedidoId: string) => {
        setPedidos(prevPedidos => prevPedidos.filter(p => p.id !== pedidoId));
        setNotification({ message: 'Pedido apagado com sucesso.', type: 'success' });
    };

    const handleManifestarInteresse = async (pedidoId: string) => {
        try {
            await api.post(`/pedidos/${pedidoId}/interesse`);
            setPedidos(pedidosAtuais =>
                pedidosAtuais.map(p =>
                    p.id === pedidoId ? { ...p, currentUserHasInterest: true } : p
                )
            );
            if (modalDetalhesAberto && modalDetalhesAberto.id === pedidoId) {
                setModalDetalhesAberto(prev => prev ? { ...prev, currentUserHasInterest: true } : null);
            }
            setNotification({ message: 'Interesse registrado! O morador foi notificado.', type: 'success' });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao registrar interesse.';
            setNotification({ message, type: 'error' });
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader /></div>;
    }

    if (error || !profileUser) {
        return <div className="flex flex-col justify-center items-center h-screen text-center"><h2 className="text-xl font-semibold text-red-600">{error || "Usuário não encontrado."}</h2><button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-600 font-semibold">Voltar ao Mural</button></div>;
    }

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <Notification 
                notification={notification}
                onClose={() => setNotification(null)}
            />
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{isMyProfile ? 'Meu Perfil' : `Perfil de ${profileUser.name}`}</h1>
                        <p className="text-sm text-slate-500">Membro desde {new Date(profileUser.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="text-indigo-600 font-semibold text-sm hover:underline">
                        Voltar ao Mural
                    </button>
                </div>
            </header>

            <main className="py-8 px-4 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Coluna de Informações Pessoais */}
                <div className="md:col-span-1">
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-5">
                        <div className="flex items-center space-x-4">
                            <img
                                // ALTERADO: Constrói a URL completa do avatar.
                                src={createResourceURL(profileUser.avatar)
                                    || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=e0e7ff&color=4338ca&size=128`
                                }
                                alt={`Avatar de ${profileUser.name}`}
                                className="w-16 h-16 rounded-full object-cover bg-slate-200"
                            />
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{profileUser.name}</h2>
                                {profileUser.endereco && <p className="text-sm text-slate-500">{`${profileUser.endereco.cidade}, ${profileUser.endereco.estado}`}</p>}
                            </div>
                        </div>
                        <div className="border-t border-slate-200 pt-5">
                            <label className="label-style">Email</label>
                            <p className="p-style">{profileUser.email}</p>
                        </div>
                        {/* Ações do perfil */}
                        {isMyProfile && (
                            <div className="border-t border-slate-200 pt-5 space-y-3">
                                <button onClick={() => navigate('/perfil/editar')} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                                    <EditIcon /> Editar Perfil
                                </button>
                                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-lg hover:bg-red-200 transition-colors">
                                    <LogoutIcon /> Sair da Conta
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Coluna de Pedidos do Usuário */}
                <div className="md:col-span-2">
                    <h3 className="font-bold text-lg mb-4 px-1">Pedidos Criados por {profileUser.name.split(' ')[0]}</h3>
                    <div className="space-y-6">
                        {pedidos.length > 0 ? (
                            pedidos.map(pedido => (
                                <PedidoCard                                    
                                    key={pedido.id}
                                    // CORREÇÃO: Adiciona o objeto 'author' que está faltando,
                                    // usando os dados do usuário do perfil.
                                    pedido={{...pedido, author: { id: profileUser.id, name: profileUser.name, avatar: profileUser.avatar }}}
                                    loggedInUser={loggedInUser}
                                    onVerDetalhes={() => setModalDetalhesAberto(pedido)}
                                    onEditar={() => setModalEdicaoAberto(pedido)}
                                    onDeletar={onPedidoDeletado}
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

            {modalDetalhesAberto && (
                <DetalhesPedidoModal
                    pedido={modalDetalhesAberto}
                    user={loggedInUser}
                    onClose={() => setModalDetalhesAberto(null)}
                    onManifestarInteresse={handleManifestarInteresse}
                />
            )}

            {modalEdicaoAberto && (
                <EditarPedidoModal
                    pedido={modalEdicaoAberto}
                    onClose={() => setModalEdicaoAberto(null)}
                    onPedidoAtualizado={onPedidoAtualizado}
                    setNotification={setNotification}
                />
            )}
        </div>
    );
};