import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotifications, type ApiNotification } from '../../context/NotificationsContext';
import { createResourceURL } from '@/utils/createResourceURL';

interface NotificationsListProps {
  onClose: () => void;
}

export function NotificationsList({ onClose }: NotificationsListProps) {
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notificationId: string, pedidoId: string | undefined) => {
    // Se não houver um pedido associado, apenas marca como lida e não fecha o painel.
    if (!pedidoId) {
      markAsRead(notificationId);
      return;
    }
    // Navega para a página do pedido e fecha o painel.
    // A notificação só será marcada como lida se o usuário clicar no botão específico.
    navigate(`/pedidos/${pedidoId}`);
    onClose();
  };

  return (
    <div className="overflow-y-auto">
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <Bell className="w-12 h-12 mb-3 text-gray-400" />
          <p className="text-center">Nenhuma notificação no momento</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {notifications.map((notification: ApiNotification) => (
            <div
              key={notification.id} // A key deve estar no elemento mais externo do map
              className={`p-4 transition-colors ${
                notification.lida ? 'bg-white' : 'bg-blue-50/60'
              } ${notification.pedidoId ? 'cursor-pointer hover:bg-slate-50' : ''}`}
              onClick={() => handleNotificationClick(notification.id, notification.pedidoId)}
            >
              <div className="flex gap-3 items-start">
                {/* 3. Adicionar o avatar do remetente */}
                {notification.remetente ? (
                  <Link to={`/perfil/${notification.remetente.id}`} onClick={(e) => e.stopPropagation()}>
                    <img
                      src={createResourceURL(notification.remetente.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.remetente.name)}&background=e0e7ff&color=4338ca&size=96`}
                      alt={`Avatar de ${notification.remetente.name}`}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  </Link>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-slate-500" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 mb-1">{notification.mensagem}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {format(new Date(notification.createdAt), "d 'de' MMMM 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                    {!notification.lida && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent container's onClick
                          markAsRead(notification.id);
                        }}
                        aria-label="Marcar notificação como lida"
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}