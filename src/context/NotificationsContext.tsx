import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type { ApiNotification } from '../types/notification';
import { notificationsService } from '../services/notifications';
import { useAuth } from './AuthContext';

interface NotificationsContextData {
  notifications: ApiNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  refetchNotifications: () => Promise<void>;
}

export const NotificationsContext = createContext({} as NotificationsContextData);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationsService.getAll();
      setNotifications(response.data);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationsService.getUnreadCount();
      // Adicionando uma verificação para tornar o acesso mais seguro
      setUnreadCount(response.data?.quantidade?.quantidade ?? 0);
    } catch (error) {
      console.error('Erro ao buscar contagem de notificações:', error);
    }
  }, []);

  const markAsRead = async (id: string) => {
    // Salva o estado original para um rollback seguro
    const originalNotifications = [...notifications];
    const originalCount = unreadCount;

    // Atualização otimista da UI
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, lida: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await notificationsService.markAsRead(id);
    } catch (error) {
      // Rollback em caso de erro, restaurando o estado original
      setNotifications(originalNotifications);
      setUnreadCount(originalCount);
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const refetchNotifications = async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  };

  useEffect(() => {
    // Só busca notificações se o usuário estiver autenticado
    if (isAuthenticated) {
      refetchNotifications();

      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    } else {
      // Limpa o estado se o usuário deslogar
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount, refetchNotifications]);

  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        refetchNotifications 
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);