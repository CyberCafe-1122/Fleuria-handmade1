import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map(toast => {
          let IconComponent = CheckCircle2;
          let iconColor = '#25D366';
          if (toast.type === 'error') {
            IconComponent = AlertCircle;
            iconColor = '#EF5350';
          } else if (toast.type === 'info') {
            IconComponent = Info;
            iconColor = '#C5A059';
          }

          return (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <IconComponent size={20} color={iconColor} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{ color: '#D5CCC0', display: 'flex', alignItems: 'center' }}
                aria-label="Dismiss toast"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
