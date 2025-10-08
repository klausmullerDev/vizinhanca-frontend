import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Send, User } from 'lucide-react';

import { api } from '../services/api';
import { socket } from '../services/socket'; // 1. Importa a instância do socket
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Ui/Loader';
import { createResourceURL } from '@/utils/createResourceURL';

type Sender = {
    id: string;
    name: string;
    avatar?: string;
};

type Mensagem = {
    id: string;
    conteudo: string;
    chatId: string; // Adicionado conforme documentação do evento 'nova-mensagem'
    createdAt: string;
    senderId: string;
    sender: Sender;
};

type ChatDetails = {
    id: string;
    pedido: {
        id: string;
        titulo: string;
    };
    // O endpoint de detalhes do chat retorna um array de participantes
    participantes: Sender[];
};

export function ChatPage() {
    const { chatId } = useParams<{ chatId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [mensagens, setMensagens] = useState<Mensagem[]>([]);
    const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);
    const [novoConteudo, setNovoConteudo] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!chatId) return;

        async function carregarChat() {
            try {
                setLoading(true);                
                const [chatDetailsRes, mensagensRes] = await Promise.all([
                    api.get<ChatDetails>(`/chats/${chatId}`),
                    api.get<Mensagem[]>(`/chats/${chatId}/mensagens`) // Endpoint para as mensagens
                ]);
                setChatDetails(chatDetailsRes.data);
                setMensagens(mensagensRes.data);
            } catch (error) {
                console.error("Erro ao carregar o chat:", error);
            } finally {
                setLoading(false);
            }
        }

        carregarChat();
    }, [chatId]);

    // 2. Efeito para gerenciar a conexão WebSocket e a sala do chat
    useEffect(() => {
        if (!chatId) return;

        // Conecta ao servidor
        socket.connect();
        // Entra na sala específica do chat
        socket.emit('join-chat', chatId);

        // Função para lidar com novas mensagens recebidas via WebSocket
        const handleNovaMensagem = (mensagem: Mensagem) => {
            // Adiciona a nova mensagem ao estado, atualizando a UI
            setMensagens((prevMensagens) => [...prevMensagens, mensagem]);
        };

        // Começa a ouvir por novas mensagens
        socket.on('nova-mensagem', handleNovaMensagem);

        // Função de limpeza: executada quando o componente é desmontado
        return () => {
            socket.emit('leave-chat', chatId); // Sai da sala
            socket.off('nova-mensagem', handleNovaMensagem); // Para de ouvir o evento
            socket.disconnect(); // Desconecta do servidor
        };

    }, [chatId]);

    // Efeito para rolar para a última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensagens]);

    const handleEnviarMensagem = async (e: FormEvent) => {
        e.preventDefault();
        if (!novoConteudo.trim() || !chatId || sending) return;

        setSending(true);
        try {
            // 3. O envio continua via POST, mas não precisamos mais da resposta
            await api.post(`/chats/${chatId}/mensagens`, {
                conteudo: novoConteudo,
            });
            // A atualização da UI agora é feita pelo listener do WebSocket ('nova-mensagem')
            setNovoConteudo('');
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader /></div>;
    }

    const otherParticipant = chatDetails?.participantes.find(
        (p) => p.id !== user?.id
    );

    return (
        <div className="flex flex-col h-screen bg-slate-100 font-sans">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center p-3">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 mr-2">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                {otherParticipant ? (
                    <Link to={`/perfil/${otherParticipant.id}`} className="flex items-center gap-3">
                        <img
                            src={createResourceURL(otherParticipant.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.name)}&background=e0e7ff&color=4338ca&size=96`}
                            alt={`Avatar de ${otherParticipant.name}`}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <h1 className="font-bold text-slate-800">{otherParticipant.name}</h1>
                            <p className="text-xs text-slate-500 truncate">Sobre: {chatDetails?.pedido.titulo}</p>
                        </div>
                    </Link>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center"><User /></div>
                        <h1 className="font-bold text-slate-800">Carregando...</h1>
                    </div>
                )}
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {mensagens.map(msg => {
                    const isMyMessage = msg.senderId === user?.id;
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                            {!isMyMessage && (
                                <img
                                    src={createResourceURL(msg.sender.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender.name)}&background=e0e7ff&color=4338ca&size=96`}
                                    alt={msg.sender.name}
                                    className="w-6 h-6 rounded-full object-cover"
                                />
                            )}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isMyMessage ? 'bg-indigo-600 text-white rounded-br-lg' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-lg'}`}>
                                <p className="text-sm">{msg.conteudo}</p>
                                <span className={`text-xs mt-1 block text-right ${isMyMessage ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    {format(new Date(msg.createdAt), 'HH:mm')}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </main>

            <footer className="bg-white p-3 border-t border-slate-200">
                <form onSubmit={handleEnviarMensagem} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={novoConteudo}
                        onChange={(e) => setNovoConteudo(e.target.value)}
                        placeholder="Digite uma mensagem..."
                        className="flex-1 bg-slate-100 border-transparent rounded-full py-2 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button type="submit" disabled={sending || !novoConteudo.trim()} className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </footer>
        </div>
    );
}
