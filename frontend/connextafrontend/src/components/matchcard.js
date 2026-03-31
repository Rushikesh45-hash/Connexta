import React from "react";
import { useNavigate } from "react-router-dom";
import { sendConnectionRequest } from "../api/connectionapi"; // create this api
import "../styles/matchcard.css";

const MatchCard = ({ user }) => {
  const navigate = useNavigate();

  const handleSendRequest = async () => {
    try {
      const res = await sendConnectionRequest(user._id);
      alert(res.message || "Request Sent!");
    } catch (err) {
      console.log(err);
      alert("Failed to send request");
    }
  };

  const handleViewProfile = () => {
    navigate(`/profile/${user._id}`);
  };

  return (
    <div className="match-card">
      <img
        className="match-avatar"
        src={user.avatar || "https://via.placeholder.com/150"}
        alt="profile"
      />

      <div className="match-info">
        <h3>
          {user.full_name}, {user.age}
        </h3>

        <p>📍 {user.location}</p>

        <p>💘 Match Score: {user.matchScore}%</p>

        <div className="match-actions">
          <button className="btn-primary" onClick={handleSendRequest}>
            Send Request
          </button>

          <button className="btn-secondary" onClick={handleViewProfile}>
            View Profile
          </button>

          <button className="btn-skip" onClick={() => alert("Skipped")}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;