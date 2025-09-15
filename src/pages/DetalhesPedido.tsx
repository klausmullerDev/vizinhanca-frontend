import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';

type PedidoDetalhado = {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  autor: {
    name: string;
  };
};

export function DetalhesPedido() {
  const { id } = useParams<{ id: string }>();
  
  const [pedido, setPedido] = useState<PedidoDetalhado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function carregarDetalhes() {
      try {
        setLoading(true);
        const response = await api.get(`/pedidos/${id}`);
        setPedido(response.data);
      } catch (err) {
        setError('Não foi possível encontrar este pedido. Ele pode ter sido removido.');
        console.error('Erro ao buscar detalhes do pedido:', err);
      } finally {
        setLoading(false);
      }
    }

    carregarDetalhes();
  }, [id]); 

  if (loading) {
    return <div className="text-center mt-12">Carregando detalhes do pedido...</div>;
  }

  if (error || !pedido) {
    return <div className="text-center mt-12 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <header className="border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{pedido.titulo}</h1>
          <p className="text-sm text-gray-500 mt-2">
            Pedido por: <span className="font-semibold">{pedido.autor?.name || 'Vizinhança'}</span>
          </p>
        </header>
        
        <main>
          <p className="text-gray-700 leading-relaxed">
            {pedido.descricao}
          </p>
        </main>

        <footer className="mt-8 pt-6 border-t flex justify-end">
          <button className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-300">
            Eu Quero Ajudar!
          </button>
        </footer>
      </div>
    </div>
  );
}