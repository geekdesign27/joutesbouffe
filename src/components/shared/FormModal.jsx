export function FormModal({ open, title, onClose, children, wide }) {
  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className={`modal-box ${wide ? 'max-w-4xl' : 'max-w-lg'}`}>
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        {children}
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}
