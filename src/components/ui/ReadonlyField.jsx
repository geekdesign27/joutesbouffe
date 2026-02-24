export function ReadonlyField({ label, value, unit }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm font-medium">{label}</span>}
      <div className="input w-full flex items-center bg-base-200 font-mono font-semibold">
        {value}{unit && ` ${unit}`}
      </div>
    </div>
  );
}
