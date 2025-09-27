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

    const fetchPedidos = async () => {
        if (!loading) setLoading(true);
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

    const onPedidoCriado = (novoPedido: Pedido) => {
        setModalNovoPedidoAberto(false);
        setPedidos(prevPedidos => [novoPedido, ...prevPedidos]);
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
                        avatar: user.avatar || undefined, 
                    },
                };

                return {
                    ...p,
                    usuarioJaDemonstrouInteresse: true,
                    interessesCount: p.interessesCount + 1,
                    interesses: [...p.interesses, novoInteresse],
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
    
    const filteredPedidos = pedidos.filter(pedido =>
        pedido.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center pt-20"><Loader /></div>;
        }
        if (pedidos.length === 0 && searchTerm === '') {
            return <EmptyState onCriarPedido={() => setModalNovoPedidoAberto(true)} />;
        }
        if (filteredPedidos.length === 0) {
            return <p className="text-center text-slate-500 mt-10">Nenhum pedido encontrado para "{searchTerm}".</p>;
        }
        return (
            <div className="space-y-6">
                {filteredPedidos.map(pedido => (
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
                    pedidoId={modalDetalhesAberto.id}
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
                />
            )}
            {modalEdicaoAberto && (
                <EditarPedidoModal
                    pedido={modalEdicaoAberto}
                    onClose={() => setModalEdicaoAberto(null)}
                    onPedidoAtualizado={onPedidoAtualizado}
                />
            )}
        </div>
    );
};