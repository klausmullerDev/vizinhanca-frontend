import React, { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

import { PedidoCard } from '../components/Pedidos/PedidoCard';
import { DetalhesPedidoModal } from '../components/Pedidos/DetalhesPedidoModal';
import { NovoPedidoModal } from '../components/Pedidos/NovoPedidoModal';
import { EditarPedidoModal } from '../components/Pedidos/EditarPedidoModal';

import Notification from '../components/Notification';
import { Loader } from '../components/Ui/Loader';
import { EmptyState } from '../components/Ui/EmptyState';
import { FloatingActionButton } from '../components/Ui/FloatingActionButton';
import { AppHeader } from '../components/Ui/AppHeader';
import { NotificationsPanel } from '../components/Notifications/NotificationsPanel';

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
    createdAt: string;
    author: Author;
    usuarioJaDemonstrouInteresse: boolean;
    interesses: Interesse[];
    interessesCount: number;
};

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);

    const [modalDetalhesAberto, setModalDetalhesAberto] = useState<Pedido | null>(null);
    const [modalNovoPedidoAberto, setModalNovoPedidoAberto] = useState(false);
    const [modalEdicaoAberto, setModalEdicaoAberto] = useState<Pedido | null>(null);

    // Alterado para aceitar um termo de busca
    const fetchPedidos = async (search = '') => {
        setLoading(true);
        try {
            // Passa o termo de busca como query param para a API
            const response = await api.get('/pedidos', {
                params: { search }
            });
            setPedidos(response.data);
        } catch (error) {
            setNotification({ message: 'Erro ao carregar os pedidos.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Efeito para buscar os pedidos na montagem e quando o termo de busca muda (com debounce)
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchPedidos(searchTerm);
        }, 300); // Aguarda 300ms após o usuário parar de digitar

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    const onPedidoCriado = (novoPedido: Pedido) => {
        setModalNovoPedidoAberto(false);
        // Adiciona os dados do autor ao novo pedido antes de atualizar o estado
        const pedidoComAutor = {
            ...novoPedido,
            author: {
                id: user!.id,
                name: user!.name,
                avatar: user!.avatar,
            },
            interesses: [], // Garante que a lista de interesses exista
        };
        setPedidos(prevPedidos => [pedidoComAutor, ...prevPedidos]);
        setNotification({ message: 'Seu pedido foi publicado com sucesso!', type: 'success' });
    };

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
        if (!user) {
            setNotification({ message: 'Você precisa estar logado para interagir.', type: 'error' });
            return;
        }

        const pedidosOriginais = [...pedidos];

        const novosPedidos = pedidos.map(p => {
            if (p.id === pedidoId) {
                const novoInteresse: Interesse = {
                    user: {
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar,
                    },
                };

                return {
                    ...p,
                    usuarioJaDemonstrouInteresse: true,
                    interessesCount: p.interessesCount + 1,
                    interesses: [...(p.interesses || []), novoInteresse], // Mantém a correção anterior
                };
            }
            return p;
        });
        setPedidos(novosPedidos);

        try {
            await api.post(`/pedidos/${pedidoId}/interesse`);
        } catch (error: any) {
            setPedidos(pedidosOriginais);
            const message = error.response?.data?.message || 'Erro ao registrar interesse.';
            setNotification({ message, type: 'error' });
        }
    };
    
    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center pt-20"><Loader /></div>;
        }
        if (pedidos.length === 0 && searchTerm === '') {
            return <EmptyState />;
        }
        if (pedidos.length === 0 && searchTerm) {
            return <p className="text-center text-slate-500 mt-10">Nenhum pedido encontrado para "{searchTerm}".</p>;
        }
        return (
            <div className="space-y-6"> 
                {pedidos.map(pedido => (
                    <PedidoCard
                        key={pedido.id}
                        pedido={pedido}
                        loggedInUser={user}
                        onManifestarInteresse={handleManifestarInteresse}
                        onEditar={() => setModalEdicaoAberto(pedido)}
                        onDeletar={onPedidoDeletado}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <AppHeader 
                user={user}
                searchValue={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                onNotificationsClick={() => setIsNotificationsPanelOpen(true)}
            />
            <Notification 
                notification={notification} 
                onClose={() => setNotification(null)} 
            />
            <main className="py-8 pb-24 px-4 max-w-2xl mx-auto">
                {renderContent()}
            </main>
            <FloatingActionButton onClick={() => setModalNovoPedidoAberto(true)} />

            <NotificationsPanel 
                isOpen={isNotificationsPanelOpen}
                onClose={() => setIsNotificationsPanelOpen(false)}
            />

            {modalDetalhesAberto && (
                <DetalhesPedidoModal
                    pedido={modalDetalhesAberto}
                    user={user}
                    onClose={() => setModalDetalhesAberto(null)}
                    onManifestarInteresse={handleManifestarInteresse}
                />
            )}
            {modalNovoPedidoAberto && (
                <NovoPedidoModal
                    isOpen={modalNovoPedidoAberto}
                    onClose={() => setModalNovoPedidoAberto(false)}
                    onPedidoCriado={onPedidoCriado}
                    // A prop setNotification foi removida do modal
                />
            )}
            {modalEdicaoAberto && (
                <EditarPedidoModal
                    pedido={modalEdicaoAberto}
                    onClose={() => setModalEdicaoAberto(null)}
                    onPedidoAtualizado={onPedidoAtualizado}
                    // setNotification={setNotification} // Removido, pois o modal não precisa mais dele
                />
            )}
        </div>
    );
};