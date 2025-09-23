export interface ApiNotification {
  id: string;
  tipo: 'INTERESSE_RECEBIDO';
  mensagem: string;
  lida: boolean;
  createdAt: string;
  userId: string;
  pedidoId: string;
  pedido: {
    titulo: string;
    descricao: string;
  };
}

export interface UnreadCountResponse {
  quantidade: {
    quantidade: number;
  };
}
