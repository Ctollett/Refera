import { useEffect } from "react";

import { useSessionStore } from "../../stores/sessionStore";

import { CreateSessionCard } from "./CreateSessionCard";
import { SessionCard } from "./SessionCard";

export const SessionGrid = () => {
  const { sessions, loading, error, getSessions } = useSessionStore();

  useEffect(() => {
    getSessions();
  }, [getSessions]);

  if (loading) return <p>Loading sessions...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <div className="session-grid">
        <CreateSessionCard />
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </>
  );
};
