export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 id="modal-title" className="text-lg font-semibold text-zinc-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
            aria-label="Close"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
