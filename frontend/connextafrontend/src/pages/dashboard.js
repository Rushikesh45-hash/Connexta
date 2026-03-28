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

  const fetchmatches = async () => {
    setLoading(true);

    const data = await getmatches(1, 6);

    if (data.success) {
      setMatches(data.matches || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchmatches();
  }, []);

  return (
    <PrivateLayout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Match Feed</h2>

          <button className="btn outline" onClick={() => navigate("/matches")}>
            View All Matches
          </button>
        </div>

        {loading ? (
          <p>Loading matches...</p>
        ) : matches.length === 0 ? (
          <p>No matches found.</p>
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