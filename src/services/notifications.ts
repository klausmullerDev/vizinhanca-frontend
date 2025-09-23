import { api } from './api';
import type { ApiNotification, UnreadCountResponse } from '../types/notification';

export const notificationsService = {
  getAll: () => api.get<ApiNotification[]>('/notificacoes'),
  getUnreadCount: () => api.get<UnreadCountResponse>('/notificacoes/nao-lidas/quantidade'),
  markAsRead: (id: string) => api.patch(`/notificacoes/${id}/lida`)
};