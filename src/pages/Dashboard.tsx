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
import { DashboardHeader } from '../components/Ui/DashboardHeader';

type Author = { id: string; name: string };
type Pedido = {
    id: string;
    titulo: string;
    descricao: string;
    createdAt: string;
    author: Author;
    currentUserHasInterest: boolean;
};

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);


    const [modalDetalhesAberto, setModalDetalhesAberto] = useState<Pedido | null>(null);
    const [modalNovoPedidoAberto, setModalNovoPedidoAberto] = useState(false);
    const [modalEdicaoAberto, setModalEdicaoAberto] = useState<Pedido | null>(null);

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

    const onPedidoCriado = () => {
        setModalNovoPedidoAberto(false);
        setNotification({ message: 'Seu pedido foi publicado com sucesso!', type: 'success' });
        fetchPedidos();
    };

    const onPedidoAtualizado = () => {
        setModalEdicaoAberto(null);
        setNotification({ message: 'Pedido atualizado com sucesso!', type: 'success' });
        fetchPedidos();
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
                setModalDetalhesAberto(prevModalData => ({
                    ...prevModalData!,
                    currentUserHasInterest: true
                }));
            }

            setNotification({ message: 'Interesse registrado! O morador foi notificado.', type: 'success' });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erro ao registrar interesse.';
            setNotification({ message, type: 'error' });
        }
    };

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center pt-20"><Loader /></div>;
        }
        if (pedidos.length === 0) {
            return <EmptyState />;
        }
        return (
            <div className="space-y-6">
                {pedidos.map(pedido => (
                    <PedidoCard
                        key={pedido.id}
                        pedido={pedido}
                        loggedInUser={user}
                        onVerDetalhes={() => setModalDetalhesAberto(pedido)}
                        onEditar={() => setModalEdicaoAberto(pedido)}
                        onDeletar={onPedidoDeletado}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
            <DashboardHeader user={user} />
            <main className="py-8 px-4 max-w-2xl mx-auto">
                {renderContent()}
            </main>
            <FloatingActionButton onClick={() => setModalNovoPedidoAberto(true)} />

            {modalDetalhesAberto && (
                <DetalhesPedidoModal
                    pedido={modalDetalhesAberto}
                    user={user}
                    // A prop myInterests foi removida
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