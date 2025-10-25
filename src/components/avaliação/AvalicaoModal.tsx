import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { api } from '../../services/api'; 
import type { Pedido } from '../../pages/PerfilPage';

interface AvaliacaoModalProps {
    pedido: Pedido; 
    onClose: () => void;
    onAvaliacaoEnviada: () => void; 
}

export const AvaliacaoModal: React.FC<AvaliacaoModalProps> = ({ pedido, onClose, onAvaliacaoEnviada }) => {
    const [nota, setNota] = useState(0);
    const [comentario, setComentario] = useState('');
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (nota === 0) {
            setError('Por favor, selecione pelo menos uma estrela.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await api.post(`/pedidos/${pedido.id}/avaliar`, { nota, comentario });
            onAvaliacaoEnviada();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao enviar avaliação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Avaliar o Pedido</h2>
                <p className="text-sm text-slate-600 mb-1">Você está avaliando sua interação no pedido:</p>
                <p className="text-md font-semibold text-indigo-700 mb-4">"{pedido.titulo}"</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Sua nota</label>
                        <div className="flex">
                            {[...Array(5)].map((_, index) => {
                                const ratingValue = index + 1;
                                return (
                                    <label key={ratingValue}>
                                        <input type="radio" name="rating" value={ratingValue} onClick={() => setNota(ratingValue)} className="hidden" />
                                        <FaStar className="cursor-pointer" color={ratingValue <= (hover || nota) ? '#ffc107' : '#e4e5e9'} size={30} onMouseEnter={() => setHover(ratingValue)} onMouseLeave={() => setHover(0)} />
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="comentario" className="block text-sm font-semibold text-slate-600 mb-2">Deixe um comentário (opcional)</label>
                        <textarea id="comentario" value={comentario} onChange={(e) => setComentario(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500" rows={3} placeholder="Como foi a sua experiência?" />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200">Cancelar</button>
                        <button type="submit" disabled={loading} className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">{loading ? 'Enviando...' : 'Enviar Avaliação'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};