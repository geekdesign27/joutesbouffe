export function IngredientBadge({ ingredient }) {
  return (
    <div className="flex gap-1">
      {ingredient.perishable && (
        <span className="badge badge-warning badge-xs">Périssable</span>
      )}
      {ingredient.returnable && (
        <span className="badge badge-info badge-xs">Retournable</span>
      )}
      {ingredient.category && (
        <span className="badge badge-ghost badge-xs">{ingredient.category.replace('_', ' ')}</span>
      )}
    </div>
  );
}
