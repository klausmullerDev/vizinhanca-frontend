import { Link } from 'react-router-dom';

type Pedido = {
  id: string;
  titulo: string;
  descricao: string;
  autor?: { 
    name: string;
  };
};

interface CardPedidoProps {
  pedido: Pedido;
}

export function CardPedido({ pedido }: CardPedidoProps) {
  const nomeAutor = pedido.autor?.name || 'Vizinhança';

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md max-w-2xl mx-auto mb-6">
      <div className="flex items-center p-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-indigo-500 rounded-full flex-shrink-0 mr-4"></div>
        <span className="font-bold text-gray-800">{nomeAutor}</span>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{pedido.titulo}</h2>
        <p className="text-gray-600">
          {pedido.descricao}
        </p>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
        <Link 
          to={`/pedidos/${pedido.id}`} 
          className="text-gray-600 font-semibold hover:text-gray-900"
        >
          Ver Detalhes
        </Link>
        <button className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300">
          Quero Ajudar!
        </button>
      </div>
    </div>
  );
}