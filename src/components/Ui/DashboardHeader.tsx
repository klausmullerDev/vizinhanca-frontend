import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationsContext';
import { NotificationsList } from '../Notifications/NotificationsList';

type User = { id: string; name: string | null; email: string; } | null;

interface DashboardHeaderProps {
    user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm relative">
      <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Mural de Favores</h1>
          <p className="text-xs sm:text-sm text-slate-500">A ajuda que você precisa está ao lado.</p>
        </div>
        <div className="relative" ref={notificationsRef}>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              aria-label="Notificações"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => user && navigate(`/perfil/${user.id}`)}
              className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-indigo-700 ring-2 ring-white cursor-pointer"
              aria-label="Acessar perfil"
            >
              {user?.name?.charAt(0)}
            </button>
          </div>
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 transform origin-top-right transition-all duration-200 ease-out md:max-w-md lg:max-w-lg z-50 flex flex-col max-h-[calc(100vh-80px)]">
              <div className="py-2 px-3 border-b border-gray-100 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
              </div>
              <NotificationsList />
            </div>
            )}
        </div>
      </div>
    </header>
  );
}