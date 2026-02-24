export function Textarea({ className = '', ...props }) {
  return (
    <textarea className={`textarea w-full ${className}`} {...props} />
  );
}
