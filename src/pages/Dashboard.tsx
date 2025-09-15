import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CardPedido } from '../components/CardPedido';
import { ModalCriarPedido } from '../components/ModalCriarPedido';

type Pedido = {
  id: string;
  titulo: string;
  descricao: string;
  autor: {
    name: string;
  };
};

export function Dashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); 

  async function carregarPedidos() {
    try {
      setLoading(true);
      const response = await api.get('/pedidos');
      setPedidos(response.data);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      alert('Não foi possível carregar o feed. Tente recarregar a página.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  const handlePedidoCriado = () => {
    carregarPedidos(); 
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-xl font-semibold">Carregando feed da vizinhança...</h1>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Conecta Vizinhança</h1>
        <p className="text-gray-500">A ajuda que você precisa está ao seu lado.</p>
      </header>
      
      <main>
        {pedidos.length > 0 ? (
          pedidos.map(pedido => (
            <CardPedido key={pedido.id} pedido={pedido} />
          ))
        ) : (
          <p className="text-center text-gray-500">Ainda não há pedidos na sua vizinhança. Que tal criar o primeiro?</p>
        )}
      </main>
      
      <button
        onClick={() => setIsModalOpen(true)} 
        className="fixed bottom-8 right-8 bg-indigo-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl font-bold hover:bg-indigo-700 transition-transform transform hover:scale-110"
        aria-label="Criar novo pedido"
      >
        +
      </button>
      <ModalCriarPedido 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPedidoCriado={handlePedidoCriado}
      />
    </div>
  );
}