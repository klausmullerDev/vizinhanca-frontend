import React from 'react';

// Tipos
type Author = { id: string; name: string };
// 1. ATUALIZE O TIPO PEDIDO
type Pedido = {
    id: string;
    titulo: string;
    descricao: string;
    createdAt: string;
    author: Author;
    currentUserHasInterest: boolean; // << CAMPO ADICIONADO
};
type User = { id: string; name: string | null; email: string; } | null;

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

// 2. ATUALIZE A INTERFACE DE PROPS
interface DetalhesPedidoModalProps {
    pedido: Pedido;
    user: User;
    // myInterests: Set<string>; << LINHA REMOVIDA
    onClose: () => void;
    onManifestarInteresse: (pedidoId: string) => void;
}

export const DetalhesPedidoModal: React.FC<DetalhesPedidoModalProps> = ({ pedido, user, onClose, onManifestarInteresse }) => {
    return (
        <>
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 animate-in fade-in-0" onClick={onClose}></div>
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg animate-in fade-in-0 zoom-in-95" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-start p-6 border-b border-slate-200">
                        <div className="pr-4">
                            <h2 className="text-xl font-bold text-slate-800">{pedido.titulo}</h2>
                            <p className="text-sm text-slate-500 mt-1">Pedido por <span className="font-semibold text-slate-600">{pedido.author.name}</span></p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 flex-shrink-0"><XIcon /></button>
                    </div>
                    <div className="p-6 space-y-6">
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{pedido.descricao}</p>
                        <div className="pt-4">
                            {user?.id === pedido.author.id ? (
                                <button disabled className="w-full bg-slate-200 text-slate-500 font-bold py-3 rounded-lg cursor-not-allowed">Este é o seu pedido</button>
                            ) :
                                // 3. ATUALIZE A CONDIÇÃO DO BOTÃO
                                pedido.currentUserHasInterest ? (
                                    <button disabled className="w-full bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                        Interesse Enviado!
                                    </button>
                                ) : (
                                    <button onClick={() => onManifestarInteresse(pedido.id)} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">Eu Quero Ajudar!</button>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};