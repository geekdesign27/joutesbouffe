export function Checkbox({ label, className = '', ...props }) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <input type="checkbox" className="checkbox checkbox-sm" {...props} />
      <span className="text-sm">{label}</span>
    </label>
  );
}
