import { SessionGrid } from "../components/sessions";

/**
 * Dashboard Page
 * Displays user's saved sessions organized by folders
 */
const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <SessionGrid />
    </div>
  );
};

export default Dashboard;
