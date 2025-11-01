import type { Session } from "shared";

interface DeleteSessionModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

/**
 * Modal component for confirming session deletion
 * @param session - The session to be deleted
 * @param isOpen - Whether the modal is visible
 * @param onClose - Handler to close the modal without deleting
 * @param onConfirm - Handler to confirm deletion
 * @param isDeleting - Loading state while deletion is in progress
 */
export const DeleteSessionModal = ({
  session,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteSessionModalProps) => {
  if (!isOpen) return null;

  const handleOverlayClick = (_e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDeleting) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Delete Session?: {session?.name}</h2>
          <button onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Confirm delete"}
          </button>
          <button onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
