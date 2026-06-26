'use client';

// AddCardsModal — modal shell. CardInput component will be mounted inside by another agent.
export default function AddCardsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Add Cards">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* CardInput will go here */}
        <button className="btn-primary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
