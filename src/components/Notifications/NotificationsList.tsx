import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationsContext';

export function NotificationsList() {
  const { notifications, markAsRead } = useNotifications();

  return (
    <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <Bell className="w-12 h-12 mb-3 text-gray-400" />
          <p className="text-center">Nenhuma notificação no momento</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                notification.lida ? 'bg-white' : 'bg-blue-50/60'
              }`}
            >
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-900 mb-1">{notification.mensagem}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {format(new Date(notification.createdAt), "d 'de' MMMM 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                    {!notification.lida && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {notification.pedido && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs text-gray-600">
                  <p className="font-medium">{notification.pedido.titulo}</p>
                  <p className="line-clamp-2">{notification.pedido.descricao}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}