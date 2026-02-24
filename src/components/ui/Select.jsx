export function Select({ options, placeholder, className = '', ...props }) {
  return (
    <select className={`select w-full ${className}`} {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
