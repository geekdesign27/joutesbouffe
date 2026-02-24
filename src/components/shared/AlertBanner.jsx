const ALERT_CLASSES = {
  info: 'alert-info',
  warning: 'alert-warning',
  error: 'alert-error',
  success: 'alert-success',
};

export function AlertBanner({ type = 'info', message, className = '' }) {
  return (
    <div className={`alert ${ALERT_CLASSES[type] || 'alert-info'} ${className}`}>
      <span>{message}</span>
    </div>
  );
}
