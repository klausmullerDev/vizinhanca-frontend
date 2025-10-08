import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Calendar, Check, User, Award, Star, MessageSquare } from 'lucide-react';

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
  imagem?: string;
  author: {
    id: string;
    name: string;
  };
  ajudante?: { // Campo alinhado com a API
    id: string;
    name: string;
    avatar?: string;
  } | null;
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

// Tipo alinhado com a nova documentação da API
type ChatResumo = {
  id: string;
  participantes: {
    id: string;
  }[];
};

export function DetalhesPedido() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState<PedidoDetalhado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [chatsDoPedido, setChatsDoPedido] = useState<ChatResumo[]>([]);

  useEffect(() => {
    if (!id) return;

    async function carregarDetalhes() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/pedidos/${id}`);
        const pedidoData = response.data;
        setPedido(pedidoData);

        // Se o usuário logado for o autor OU já demonstrou interesse, busca os chats.
        if (user?.id === pedidoData.author.id || pedidoData.usuarioJaDemonstrouInteresse) {
          // AJUSTE: A rota para buscar chats de um pedido foi atualizada.
          const chatsResponse = await api.get(`/pedidos/${id}/chats`);
          setChatsDoPedido(chatsResponse.data);
        }
      } catch (err: any) {
        setError('Não foi possível encontrar este pedido. Ele pode ter sido removido.');
      } finally {
        setLoading(false);
      }
    }

    carregarDetalhes();
  }, [id, user?.id]);

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

  const handleEscolherAjudante = async (ajudanteId: string) => {
    if (!pedido) return;
    try {
      const response = await api.post(`/pedidos/${pedido.id}/escolher-ajudante`, { userId: ajudanteId }); // CORREÇÃO: Enviando 'userId'
      setPedido(response.data); // A API deve retornar o pedido atualizado
      setNotification({ message: 'Ajudante escolhido com sucesso! Ele(a) foi notificado.', type: 'success' });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao escolher ajudante.';
      setNotification({ message, type: 'error' });
    }
  };

  const handleFinalizarPedido = async () => {
    if (!pedido) return;
    if (!window.confirm("Tem certeza que deseja marcar este pedido como finalizado?")) return;

    try {
      const response = await api.post(`/pedidos/${pedido.id}/finalizar`);
      setPedido(response.data);
      setNotification({ message: 'Pedido finalizado com sucesso!', type: 'success' });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao finalizar o pedido.';
      setNotification({ message, type: 'error' });
    }
  };

  const handleDesistir = async () => {
    if (!pedido) return;
    if (!window.confirm("Tem certeza que deseja desistir desta ajuda? O autor será notificado.")) return;

    try {
      const response = await api.post(`/pedidos/${pedido.id}/desistir`);
      setPedido(response.data);
      setNotification({ message: 'Você desistiu da ajuda. O pedido está aberto novamente.', type: 'success' });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao desistir da ajuda.';
      setNotification({ message, type: 'error' });
    }
  };

  const handleIniciarConversa = async (destinatarioId: string) => {
    if (!pedido || !user) return;

    // Verifica se já existe um chat com este usuário
    const chatExistente = chatsDoPedido.find((chat) =>
      chat.participantes.some((p) => p.id === destinatarioId)
    );

    if (chatExistente) {
      navigate(`/chat/${chatExistente.id}`);
    } else {
      try {
        // Cria um novo chat se não existir
        const response = await api.post('/chats', {
          pedidoId: pedido.id,
          destinatarioId: destinatarioId,
        });
        const { id: chatId } = response.data;
        // Navega para a página de chat
        navigate(`/chat/${chatId}`);
      } catch (error) {
        setNotification({ message: 'Não foi possível iniciar a conversa.', type: 'error' });
      }
    }
  };

  const isMyPedido = user?.id === pedido?.author?.id;
  const isAjudante = user?.id === pedido?.ajudante?.id;

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

  const renderActionBox = () => {
    // Lógica para o AUTOR do pedido
    if (isMyPedido) {
      switch (pedido.status) {
        case 'ABERTO':
          return <button disabled className="w-full bg-slate-200 text-slate-500 font-bold py-3 rounded-lg cursor-not-allowed">Aguardando interessados</button>;
        case 'EM_ANDAMENTO':
          if (pedido.ajudante) { // Garante que o ajudante exista
            return (
              <div className="space-y-3">
                 <button onClick={() => handleIniciarConversa(pedido.ajudante!.id)} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Conversar com Ajudante
                </button>
                <button onClick={handleFinalizarPedido} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  Marcar como Finalizado
                </button>
              </div>
            );
          }
          return null; // Caso não tenha ajudante (não deve acontecer em EM_ANDAMENTO)
        case 'FINALIZADO':
          return (
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-green-800">Pedido Concluído!</p>
              <button className="mt-2 text-sm font-semibold text-indigo-600 hover:underline">
                <Star className="w-4 h-4 inline-block mr-1" />
                Avaliar Ajudante
              </button>
            </div>
          );
        default:
          return null;
      }
    }

    // Lógica para o AJUDANTE escolhido
    if (isAjudante) {
      switch (pedido.status) {
        case 'EM_ANDAMENTO':
          return (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="font-semibold text-blue-800">Você está ajudando!</p>
                <p className="text-sm text-blue-600 mt-1">Entre em contato com {pedido.author?.name}.</p>
                <button onClick={handleDesistir} className="mt-3 text-sm font-semibold text-red-600 hover:underline">
                  Desistir da ajuda
                </button>
              </div>
              <button onClick={() => handleIniciarConversa(pedido.author.id)} className="w-full bg-white border border-slate-300 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Conversar com o autor
              </button>
            </div>
          );
        case 'FINALIZADO':
           return (
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-green-800">Ajuda Concluída!</p>
            </div>
          );
        default:
          return null;
      }
    }

    // Lógica para OUTROS usuários
    if (pedido.status === 'ABERTO') {
      if (pedido.usuarioJaDemonstrouInteresse) {
        return (
          <div className="space-y-3">
            <button disabled className="w-full bg-green-100 text-green-700 font-bold py-3 rounded-lg flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Interesse Enviado!
            </button>
            {/* Botão para o interessado iniciar a conversa */}
            <button onClick={() => handleIniciarConversa(pedido.author.id)} className="w-full bg-white border border-slate-300 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Conversar com o autor
            </button>
          </div>
        );
      }
      return (
        <button onClick={handleManifestarInteresse} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
          Eu Quero Ajudar!
        </button>
      );
    }

    // Status para outros usuários quando o pedido não está mais aberto
    let statusMessage = 'Pedido em andamento';
    if (pedido.status === 'FINALIZADO') statusMessage = 'Pedido finalizado';
    if (pedido.status === 'CANCELADO') statusMessage = 'Pedido cancelado';

    return <button disabled className="w-full bg-slate-200 text-slate-500 font-bold py-3 rounded-lg cursor-not-allowed">{statusMessage}</button>;
  };

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
            {renderActionBox()}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informações</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-sm text-slate-500">Pedido por</span>
                  <Link to={`/perfil/${pedido.author?.id}`} className="block font-semibold text-slate-800 hover:text-indigo-600">
                    {pedido.author?.name}
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

          {/* Mostra o ajudante escolhido se o pedido estiver em andamento ou finalizado */}
          {pedido.ajudante && ['EM_ANDAMENTO', 'FINALIZADO'].includes(pedido.status) && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-500" />
                Ajudante Escolhido
              </h3>
              <Link to={`/perfil/${pedido.ajudante.id}`} className="flex items-center gap-3 group">
                <img
                  src={createResourceURL(pedido.ajudante.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(pedido.ajudante.name)}&background=e0e7ff&color=4338ca&size=96`}
                  alt={`Avatar de ${pedido.ajudante.name}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-semibold text-slate-700 group-hover:text-indigo-600">{pedido.ajudante.name}</span>
              </Link>
            </div>
          )}

          {/* Lista de interessados para o autor escolher */}
          {isMyPedido && pedido.status === 'ABERTO' && pedido.interesses && pedido.interesses.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Interessados</h3>
              <div className="space-y-4">
                {pedido.interesses.map((interesse) => (
                  <div key={interesse.user.id} className="flex items-center justify-between gap-2">
                    <Link to={`/perfil/${interesse.user.id}`} className="flex items-center gap-3 group">
                      <img
                        src={createResourceURL(interesse.user.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(interesse.user.name)}&background=e0e7ff&color=4338ca&size=96`}
                        alt={`Avatar de ${interesse.user.name}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-semibold text-slate-700 group-hover:text-indigo-600 truncate">{interesse.user.name}</span>
                    </Link>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleIniciarConversa(interesse.user.id)} title="Iniciar conversa" className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleEscolherAjudante(interesse.user.id)} className="text-sm font-semibold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors">
                        Escolher
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}