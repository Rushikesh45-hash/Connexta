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

  // total matches count from backend
  const [totalMatches, setTotalMatches] = useState(0);

  const fetchmatches = async () => {
    setLoading(true);

    try {
      const data = await getmatches(1, 6);

      if (data.success) {
        setMatches(data.data.matches || []);
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
      <div className="dashboard-main">
        <div className="dashboard-topbar">
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
            <h4>Showing Now</h4>
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
              Complete your profile properly and update preferences to get better
              matches.
            </p>
            <button
              className="empty-btn"
              onClick={() => navigate("/profile-setup")}
            >
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
    </PrivateLayout>
  );
};

export default Dashboard;