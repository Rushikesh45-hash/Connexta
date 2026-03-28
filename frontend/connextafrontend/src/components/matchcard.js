import React from "react";
import "../styles/matchcard.css";

const MatchCard = ({ user }) => {
  return (
    <div className="match-card">
      <img
        src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
        alt="match"
        className="match-img"
      />

      <div className="match-info">
        <h3>
          {user.full_name || "unknown"}, {user.age || "N/A"}
        </h3>

        <p>📍 {user.location || "unknown"}</p>
        <p>💼 {user.education || "unknown"}</p>
        <p>💰 {user.salary || "unknown"}</p>

        <p className="match-score">❤️ Match Score: {user.matchScore || 0}%</p>

        <div className="match-buttons">
          <button className="btn">Send Request</button>
          <button className="btn outline">View Profile</button>
          <button className="btn danger">Skip</button>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;