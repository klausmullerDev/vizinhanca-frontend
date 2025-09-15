import { useState } from 'react'; 
import { api } from '../services/api';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPedidoCriado: () => void;
}

export function ModalCriarPedido({ isOpen, onClose, onPedidoCriado }: ModalProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!titulo || !descricao) {
      alert('Por favor, preencha o título e a descrição.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/pedidos', { titulo, descricao });
      alert('Pedido criado com sucesso!');
      setTitulo('');
      setDescricao('');
      onPedidoCriado();
      onClose();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Não foi possível criar o pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Criar Novo Pedido de Ajuda</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="titulo" className="block text-gray-700 font-semibold mb-2">Título</label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Preciso de ajuda para carregar compras"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="descricao" className="block text-gray-700 font-semibold mb-2">Descrição</label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Descreva com mais detalhes o que você precisa."
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
              {loading ? 'Publicando...' : 'Publicar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}