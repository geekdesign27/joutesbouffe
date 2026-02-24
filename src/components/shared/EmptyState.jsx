export function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4 opacity-20">📭</div>
      <h3 className="text-lg font-semibold text-base-content/70">{title || 'Aucun élément'}</h3>
      {description && (
        <p className="text-sm text-base-content/50 mt-1 max-w-md">{description}</p>
      )}
      {actionLabel && onAction && (
        <button className="btn btn-primary btn-sm mt-4" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
