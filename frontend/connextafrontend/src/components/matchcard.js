import React from "react";
import { useNavigate } from "react-router-dom";
import { sendConnectionRequest } from "../api/connectionapi";
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

  const handleSkip = () => {
    alert("Skipped");
  };

  return (
    <div className="match-card">
      <div className="match-top">
        <img
          className="match-avatar"
          src={user.avatar || "https://via.placeholder.com/150"}
          alt="profile"
        />

        <div className="match-basic">
          <h3>
            {user.full_name}, {user.age}
          </h3>

          <p className="match-location">📍 {user.location}</p>

          <p className="match-score">💘 Match Score: {user.matchScore}%</p>
        </div>
      </div>

      <div className="match-actions">
        <button className="btn-primary" onClick={handleSendRequest}>
          Send Request
        </button>

        <button className="btn-secondary" onClick={handleViewProfile}>
          View Profile
        </button>

        <button className="btn-skip" onClick={handleSkip}>
          Skip
        </button>
      </div>
    </div>
  );
};

export default MatchCard;