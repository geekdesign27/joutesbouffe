export function Input({ className = '', ...props }) {
  return (
    <input className={`input w-full ${className}`} {...props} />
  );
}
