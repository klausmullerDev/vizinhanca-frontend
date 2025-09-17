import React, { useEffect } from 'react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Fecha automaticamente após 5 segundos

        return () => clearTimeout(timer);
    }, [onClose]);

    const baseClasses = 'fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white z-50 animate-in slide-in-from-top-5';
    const typeClasses = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            {message}
        </div>
    );
};

export default Notification;