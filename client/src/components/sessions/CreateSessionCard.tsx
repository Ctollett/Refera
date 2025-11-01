import { useNavigate } from "react-router-dom";
import type { CreateSession } from "shared/src/types/session.types";

import { useSessionStore } from "../../stores/sessionStore";

export const CreateSessionCard = () => {
  const { createSession, loading, error } = useSessionStore();
  const navigate = useNavigate();

  const handleCreateSession = async () => {
    const sessionData: CreateSession = {
      name: "New Session",
      folderId: null,
    };
    try {
      const newSession = await createSession(sessionData);
      navigate(`/sessions/${newSession.id}`);
    } catch (error) {
      console.log("Error creating session", error);
    }
  };

  if (error) return <p>{error}</p>;

  return (
    <>
      <div className="create-session-card">
        <button onClick={handleCreateSession} disabled={loading}>
          {loading ? "Creating..." : "Create Session"}
        </button>
      </div>
    </>
  );
};
