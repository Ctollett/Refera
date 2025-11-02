import { useParams } from "react-router-dom";

import ReferenceUpload from "../components/upload/ReferenceUpload";

export const Session = () => {
  const { id } = useParams();
  const sessionId = id || "test-session-123"; // Use URL param or fallback

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Session: {sessionId.slice(0, 8)}...
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <ReferenceUpload sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
};
