import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

const statusConfig = {
  EM_ANDAMENTO: {
    text: 'Em Andamento',
    icon: <Clock className="w-3 h-3" />,
    className: 'bg-blue-100 text-blue-800',
  },
  FINALIZADO: {
    text: 'Finalizado',
    icon: <CheckCircle className="w-3 h-3" />,
    className: 'bg-green-100 text-green-800',
  },
  CANCELADO: {
    text: 'Cancelado',
    icon: <XCircle className="w-3 h-3" />,
    className: 'bg-red-100 text-red-800',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status as keyof typeof statusConfig];
  if (!config) return null;

  return (
    <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1.5 ${config.className}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};