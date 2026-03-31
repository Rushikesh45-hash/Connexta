import React, { useEffect, useState } from "react";
import PrivateLayout from "../layouts/privatelayout";
import MatchCard from "../components/matchcard";
import { getmatches } from "../api/matchapi";
import "../styles/dashboard.css";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination state
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchAllMatches = async () => {
    setLoading(true);

    try {
      const data = await getmatches(page, limit);

      if (data.success) {
        setMatches(data.data.matches || []);
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.log(error);
      setMatches([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAllMatches();
  }, [page]);

  return (
    <PrivateLayout>
      <div className="dashboard-container">
        <div className="dashboard-main">
          <div className="dashboard-topbar">
            <div className="dashboard-title-area">
              <h2 className="dashboard-title">All Matches</h2>
              <p className="dashboard-subtitle">
                Explore all your matches in one place.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="loading-skeleton">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </div>
          ) : matches.length === 0 ? (
            <div className="empty-state">
              <h3>No matches found 😕</h3>
              <p>Try updating your profile and preferences.</p>
            </div>
          ) : (
            <div className="match-list">
              {matches.map((user) => (
                <MatchCard key={user._id} user={user} />
              ))}
            </div>
          )}

          {/* Pagination Buttons */}
          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button
              className="view-btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>

            <button className="view-btn" onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default Matches;