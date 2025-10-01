import React, { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { NotificationsList } from './NotificationsList';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;

    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStartX;

    // Permite arrastar apenas para a esquerda (negativo)
    if (diff < 0) {
      setTranslateX(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (panelRef.current) {
      // Se o usuário arrastou mais de 1/3 da largura do painel, fecha.
      if (translateX < -panelRef.current.offsetWidth / 3) {
        onClose();
      }
    }
    // Reseta a posição do painel para a animação de fechar ou de voltar.
    setTranslateX(0);
    setTouchStartX(null);
  };

  return (
    <>
      {/* Overlay escuro */}
      <div 
        className={clsx(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      {/* Painel Lateral */}
      <div 
        ref={panelRef}
        className={clsx(
          'fixed top-0 left-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isDragging ? '' : 'transition-transform duration-300 ease-in-out' // Desativa a transição durante o arraste
        )}
        style={{ transform: isOpen ? `translateX(${translateX}px)` : '-translate-x-full' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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