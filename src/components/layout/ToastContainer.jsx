import { useToastStore } from '../../hooks/useToast';

const TOAST_CLASSES = {
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info',
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (!toasts.length) return null;

  return (
    <div className="toast toast-end toast-top z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`alert ${TOAST_CLASSES[t.type] || 'alert-info'} cursor-pointer shadow-lg`}
          onClick={() => removeToast(t.id)}
        >
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
