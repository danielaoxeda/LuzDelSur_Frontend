import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ToastNotification,
  type ToastItem,
  type ToastType,
} from '../components/ToastNotification';

interface NotificationContextValue {
  notify: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      window.setTimeout(() => {
        dismiss(id);
      }, 4500);
    },
    [dismiss]
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      notify,
      success: (title, message) => notify('success', title, message),
      error: (title, message) => notify('error', title, message),
      warning: (title, message) => notify('warning', title, message),
      info: (title, message) => notify('info', title, message),
    }),
    [notify]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastNotification toasts={toasts} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider');
  }
  return ctx;
}
