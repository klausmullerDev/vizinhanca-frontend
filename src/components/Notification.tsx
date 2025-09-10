import React, { useEffect } from 'react';

type NotificationProps = {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
};

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-5 right-5 ${bgColor} text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-down flex items-center z-50`}>
            <p>{message}</p>
            <button onClick={onClose} className="ml-4 text-xl font-bold">&times;</button>
        </div>
    );
};

export default Notification;
