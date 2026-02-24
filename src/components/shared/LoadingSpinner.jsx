export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClass = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
  }[size] || 'loading-md';

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <span className={`loading loading-spinner ${sizeClass} text-primary`} />
    </div>
  );
}
