import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ToastContextType {
  showToast: (message: string, type?: 'error' | 'success') => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white transition-all
            ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}
          role="alert"
          aria-live="assertive"
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};
