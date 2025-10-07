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
import { RefreshCw } from 'lucide-react';

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
    status: string; // Adicionado o status do pedido
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

    // Estados para o "Puxar para Atualizar"
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullPosition, setPullPosition] = useState({ startY: 0, distance: 0 });

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
    
    const handleCancelarPedido = async (pedidoId: string) => {
        try {
            const response = await api.patch(`/pedidos/${pedidoId}/cancelar`);
            // Atualiza o pedido específico na lista com os dados retornados pela API
            setPedidos(prev => prev.map(p => p.id === pedidoId ? response.data : p));
            setNotification({ message: 'Pedido cancelado com sucesso.', type: 'success' });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao cancelar o pedido.';
            setNotification({ message, type: 'error' });
        }
    };



    // --- Lógica para Puxar para Atualizar ---
    const PULL_THRESHOLD = 80; // Distância em pixels para acionar o refresh

    const handleTouchStart = (e: React.TouchEvent) => {
        // Só inicia o gesto se o scroll estiver no topo
        if (window.scrollY === 0) {
            setPullPosition({ startY: e.targetTouches[0].clientY, distance: 0 });
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (pullPosition.startY === 0) return;

        const currentY = e.targetTouches[0].clientY;
        const distance = currentY - pullPosition.startY;

        // Permite puxar para baixo e aplica uma resistência
        if (distance > 0) {
            e.preventDefault(); // Previne o scroll padrão do navegador
            setPullPosition(prev => ({ ...prev, distance: distance / 2.5 }));
        }
    };

    const handleTouchEnd = async () => {
        if (pullPosition.startY === 0) return;

        if (pullPosition.distance > PULL_THRESHOLD) {
            setIsRefreshing(true);
            await fetchPedidos(searchTerm);
            setIsRefreshing(false);
        }

        // Reseta as posições
        setPullPosition({ startY: 0, distance: 0 });
    };
    // --- Fim da Lógica ---

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
                        onCancelar={handleCancelarPedido}
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
            <div 
                className="relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Indicador de Refresh */}
                <div className="absolute top-0 left-0 right-0 flex justify-center pt-3" style={{ opacity: Math.min(pullPosition.distance / PULL_THRESHOLD, 1) }}>
                    <RefreshCw 
                        className={`text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} 
                        style={{ transform: `rotate(${pullPosition.distance * 2}deg)` }}
                    />
                </div>
                <main className="py-8 pb-24 px-4 max-w-2xl mx-auto transition-transform duration-200" style={{ transform: `translateY(${pullPosition.distance}px)` }}>
                    {renderContent()}
                </main>
            </div>
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