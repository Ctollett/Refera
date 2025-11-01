import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Session } from "shared";

import { useSessionStore } from "../../stores/sessionStore";

import { DeleteSessionModal } from "./DeleteSessionModal";

interface SessionCardProps {
  session: Session;
}

export const SessionCard = ({ session }: SessionCardProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { deleteSession } = useSessionStore();
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/sessions/${session.id}`);
  };

  const handleDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await deleteSession(session.id);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div className="session-card">
        <h2>{session.name}</h2>
        <button onClick={handleOpen}>Open Session</button>
        <button onClick={handleDeleteModal}>Delete</button>

        {isDeleteModalOpen && (
          <DeleteSessionModal
            session={session}
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteConfirm}
            isDeleting={false}
          />
        )}
      </div>
    </>
  );
};
