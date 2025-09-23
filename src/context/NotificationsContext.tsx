import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ApiNotification } from '../types/notification';
import { notificationsService } from '../services/notifications';

interface NotificationsContextData {
  notifications: ApiNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  refetchNotifications: () => Promise<void>;
}

export const NotificationsContext = createContext({} as NotificationsContextData);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsService.getAll();
      setNotifications(response.data);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsService.getUnreadCount();
      setUnreadCount(response.data.quantidade.quantidade);
    } catch (error) {
      console.error('Erro ao buscar contagem de notificações:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Optimistic UI update
      const originalNotifications = notifications;
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      await notificationsService.markAsRead(id);
      // Optional: Refetch in the background to ensure data consistency
      // await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    } catch (error) {
      // Rollback on error
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, lida: false } : n)
      );
      setUnreadCount(prev => prev + 1);
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const refetchNotifications = async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

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