import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Calendar, Check, User } from 'lucide-react';

import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Ui/Loader';
import Notification from '../components/Notification';
import { InterestedUsersStack } from '../components/InterestedUsersStack';
import { createResourceURL } from '@/utils/createResourceURL';

type PedidoDetalhado = {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  createdAt: string;
  imagem?: string; // Adicionado campo para a imagem
  author: { // Corrigido de 'autor' para 'author'
    id: string;
    name: string;
  };
  interesses: {
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
  }[];
  usuarioJaDemonstrouInteresse: boolean;
  interessesCount: number;
};

export function DetalhesPedido() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState<PedidoDetalhado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!id) return;

    async function carregarDetalhes() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/pedidos/${id}`);
        setPedido(response.data);
      } catch (err: any) {
        setError('Não foi possível encontrar este pedido. Ele pode ter sido removido.');
      } finally {
        setLoading(false);
      }
    }

    carregarDetalhes();
  }, [id]);

  const handleManifestarInteresse = async () => {
    if (!pedido) return;
    try {
      await api.post(`/pedidos/${pedido.id}/interesse`);
      setPedido(p => p ? { ...p, usuarioJaDemonstrouInteresse: true } : null);
      setNotification({ message: 'Interesse registrado! O morador foi notificado.', type: 'success' });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao registrar interesse.';
      setNotification({ message, type: 'error' });
    }
  };

  const isMyPedido = user?.id === pedido?.author.id;

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader /></div>;
  }

  if (error || !pedido) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <h2 className="text-xl font-semibold text-red-600">{error || "Pedido não encontrado."}</h2>
        <button onClick={() => navigate('/dashboard')} className="mt-4 bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors text-sm">
          Voltar ao Mural
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Notification notification={notification} onClose={() => setNotification(null)} />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center p-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-slate-100 mr-2 md:mr-4" aria-label="Voltar ao mural">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 line-clamp-1" title={pedido.titulo}>{pedido.titulo}</h1>
        </div>
      </header>

      <main className="py-8 px-4 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Coluna principal */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm p-6 md:p-8">
          {/* Renderiza a imagem do pedido, se existir */}
          {pedido.imagem && (
            <div className="mb-6">
              <img 
                src={createResourceURL(pedido.imagem)} 
                alt={`Imagem do pedido: ${pedido.titulo}`}
                className="w-full h-auto max-h-96 object-contain rounded-lg bg-slate-100"
              />
            </div>
          )}
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Detalhes do Pedido</h2>
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{pedido.descricao}</p>
        </div>

        {/* Coluna da barra lateral */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Ação</h3>
            {isMyPedido ? (
              <button disabled className="w-full bg-slate-200 text-slate-500 font-bold py-3 rounded-lg cursor-not-allowed">Este é o seu pedido</button>
            ) : pedido.usuarioJaDemonstrouInteresse ? (
              <button disabled className="w-full bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                Interesse Enviado!
              </button>
            ) : (
              <button onClick={handleManifestarInteresse} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                Eu Quero Ajudar!
              </button>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informações</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-sm text-slate-500">Pedido por</span>
                  <Link to={`/perfil/${pedido.author.id}`} className="block font-semibold text-slate-800 hover:text-indigo-600">
                    {pedido.author.name}
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-sm text-slate-500">Data</span>
                  <p className="font-semibold text-slate-800">
                    {format(new Date(pedido.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Adiciona a lista de interessados */}
          {pedido.interesses && pedido.interesses.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Interessados</h3>
              <InterestedUsersStack
                interesses={pedido.interesses}
                totalCount={pedido.interessesCount}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}