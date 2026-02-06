import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Wait for exit animation
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300);
    }
  };

  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-[#10B981]/10',
      border: 'border-[#10B981]/30',
      iconColor: 'text-[#10B981]',
      textColor: 'text-[#E5E5E5]',
    },
    error: {
      icon: XCircle,
      bg: 'bg-[#EF4444]/10',
      border: 'border-[#EF4444]/30',
      iconColor: 'text-[#EF4444]',
      textColor: 'text-[#E5E5E5]',
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-[#F59E0B]/10',
      border: 'border-[#F59E0B]/30',
      iconColor: 'text-[#F59E0B]',
      textColor: 'text-[#E5E5E5]',
    },
    info: {
      icon: AlertCircle,
      bg: 'bg-[#4F46E5]/10',
      border: 'border-[#4F46E5]/30',
      iconColor: 'text-[#4F46E5]',
      textColor: 'text-[#E5E5E5]',
    },
  };

  const { icon: Icon, bg, border, iconColor, textColor } = config[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className={`fixed top-4 right-4 z-[100] ${bg} border ${border} rounded-xl px-4 py-3 shadow-2xl backdrop-blur-sm max-w-sm`}
        >
          <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} strokeWidth={2} />
            <p className={`text-sm ${textColor} flex-1`}>{message}</p>
            <button
              onClick={handleClose}
              className="w-5 h-5 flex items-center justify-center text-[#AAA] hover:text-[#E5E5E5] transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast Container for managing multiple toasts
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // This would be exposed via a context or hook
  const addToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast, index) => (
        <div key={toast.id} className="pointer-events-auto" style={{ marginTop: index * 8 }}>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
