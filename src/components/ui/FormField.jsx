export function FormField({ label, children, hint, error, className = '', required }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <span className="text-sm font-medium">
          {label}{required && ' *'}
        </span>
      )}
      {children}
      {hint && <p className="text-xs text-base-content/60">{hint}</p>}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
