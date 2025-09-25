import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { NotificationsList } from './NotificationsList';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  // Efeito para travar o scroll do body quando o painel estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function para garantir que o scroll volte ao normal
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay escuro */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Painel Lateral */}
      <div className={`fixed top-0 left-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <header className="p-4 border-b border-slate-200 flex-shrink-0">
            <h2 className="text-xl font-bold text-slate-800">Notificações</h2>
          </header>
          <NotificationsList onClose={onClose} />
        </div>
      </div>
    </>
  );
};