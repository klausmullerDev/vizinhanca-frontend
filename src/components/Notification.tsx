import { X } from 'lucide-react';

interface NotificationData {
  message: string;
  type: 'success' | 'error';
}

interface NotificationProps {
  notification: NotificationData | null;
  onClose?: () => void;
}

const Notification = ({ notification, onClose }: NotificationProps) => {
  if (!notification) return null;

  const { message, type } = notification;
  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg border ${bgColor} ${borderColor} max-w-md z-50 animate-fade-in`}>
      <div className="flex justify-between items-start gap-2">
        <p className={`${textColor}`}>{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className={`${textColor} hover:opacity-70 p-1 rounded-full hover:bg-black/5`}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;