export type NotificationType = 
  | 'INTERESSE_RECEBIDO'
  | 'AJUDANTE_ESCOLHIDO'
  | 'PEDIDO_FINALIZADO'
  | 'NOVA_MENSAGEM'
  | 'AJUDANTE_DESISTIU'
  | 'PEDIDO_CANCELADO';

export interface ApiNotification {
  id: string;
  tipo: NotificationType;
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
