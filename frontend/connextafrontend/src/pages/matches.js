import React, { useEffect, useState } from "react";
import PrivateLayout from "../layouts/privatelayout";
import MatchCard from "../components/matchcard";
import { getmatches } from "../api/matchapi";
import "../styles/matches.css";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchmatches = async () => {
    setLoading(true);

    const data = await getmatches(page, 10);

    if (data.success) {
      setMatches(data.matches || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchmatches();
  }, [page]);

  return (
    <PrivateLayout>
      <div className="matches-page">
        <h2>All Matches</h2>

        {loading ? (
          <p>Loading...</p>
        ) : matches.length === 0 ? (
          <p>No matches found.</p>
        ) : (
          <div className="match-list">
            {matches.map((user) => (
              <MatchCard key={user._id} user={user} />
            ))}
          </div>
        )}

        <div className="pagination">
          <button
            className="btn outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>

          <span className="page-number">Page {page}</span>

          <button className="btn outline" onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default Matches;