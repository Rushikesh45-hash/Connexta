import React, { useEffect, useState } from "react";
import PrivateLayout from "../layouts/privatelayout";
import MatchCard from "../components/matchcard";
import { getmatches } from "../api/matchapi";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: total matches count from backend
  const [totalMatches, setTotalMatches] = useState(0);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchmatches = async () => {
    setLoading(true);

    try {
      const data = await getmatches(1, 6);

      if (data.success) {
        // backend sends matches inside data.data.matches
        setMatches(data.data.matches || []);

        // NEW: backend sends totalMatches
        setTotalMatches(data.data.totalMatches || 0);
      } else {
        setMatches([]);
        setTotalMatches(0);
      }
    } catch (error) {
      console.log(error);
      setMatches([]);
      setTotalMatches(0);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchmatches();
  }, []);

  return (
    <PrivateLayout>
      <div className="dashboard-container">
        {/* Sidebar Overlay */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
          onClick={() => setSidebarOpen(false)}
        ></div>

        {/* Sidebar */}
        <div className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
          <h3 className="sidebar-title">Connexta</h3>

          <button onClick={() => navigate("/dashboard")} className="sidebar-link">
            🏠 Dashboard
          </button>

          <button onClick={() => navigate("/matches")} className="sidebar-link">
            💘 Matches
          </button>

          <button onClick={() => navigate("/requests")} className="sidebar-link">
            📩 Requests
          </button>

          <button onClick={() => navigate("/connections")} className="sidebar-link">
            🤝 Connections
          </button>

          <button onClick={() => navigate("/chat")} className="sidebar-link">
            💬 Chat
          </button>

          <button onClick={() => navigate("/my-profile")} className="sidebar-link">
            👤 My Profile
          </button>

          <button onClick={() => navigate("/settings")} className="sidebar-link">
            ⚙️ Settings
          </button>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          <div className="dashboard-topbar">
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </button>

            <div className="dashboard-title-area">
              <h2 className="dashboard-title">Match Feed</h2>
              <p className="dashboard-subtitle">
                Discover your best matches based on your preferences.
              </p>
            </div>

            <button className="view-btn" onClick={() => navigate("/matches")}>
              View All
            </button>
          </div>

          {/* Quick Stats */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <h4>Total Matches</h4>
              <p>{totalMatches}</p>
            </div>

            <div className="stat-card">
              <h4>New Today</h4>
              <p>{matches.length}</p>
            </div>

            <div className="stat-card">
              <h4>Suggestions</h4>
              <p>{totalMatches}</p>
            </div>
          </div>

          {/* Match Feed */}
          {loading ? (
            <div className="loading-skeleton">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </div>
          ) : matches.length === 0 ? (
            <div className="empty-state">
              <h3>No matches found 😕</h3>
              <p>
                Complete your profile properly and update preferences to get better matches.
              </p>
              <button className="empty-btn" onClick={() => navigate("/profile-setup")}>
                Complete Profile
              </button>
            </div>
          ) : (
            <div className="match-list">
              {matches.map((user) => (
                <MatchCard key={user._id} user={user} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
};

export default Dashboard;