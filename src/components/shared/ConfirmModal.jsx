export function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title || 'Confirmation'}</h3>
        <p className="py-4">{message || 'Êtes-vous sûr de vouloir continuer ?'}</p>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onCancel}>
            Annuler
          </button>
          <button className="btn btn-error" onClick={onConfirm}>
            Supprimer
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onCancel} />
    </dialog>
  );
}
