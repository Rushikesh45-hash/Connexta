import React, { useEffect, useState } from "react";
import PrivateLayout from "../layouts/privatelayout";
import { getPendingRequests, reviewConnectionRequest } from "../api/connectionapi";
import { useNavigate } from "react-router-dom";
import "../styles/pendingrequests.css";

const PendingRequestsPage = () => {
  const navigate = useNavigate();

  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

const fetchPending = async () => {
  setLoading(true);

  try {
    const data = await getPendingRequests();
    setPendingRequests(data.data || []);
  } catch (error) {
    console.log(error);
    setPendingRequests([]);
  }

  setLoading(false);
};

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAccept = async (connectionId) => {
    try {
      const res = await reviewConnectionRequest(connectionId, "accepted");
      alert(res.message || "Request Accepted");
      fetchPending();
    } catch (error) {
      console.log(error);
      alert("Failed to accept request");
    }
  };

  const handleReject = async (connectionId) => {
    try {
      const res = await reviewConnectionRequest(connectionId, "rejected");
      alert(res.message || "Request Rejected");
      fetchPending();
    } catch (error) {
      console.log(error);
      alert("Failed to reject request");
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <PrivateLayout>
      <div className="pending-container">
        <div className="pending-header">
          <h2>📩 Pending Requests</h2>
          <p>Accept or reject connection requests from users.</p>
        </div>

        {loading ? (
          <div className="pending-loading">
            <p>Loading pending requests...</p>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="pending-empty">
            <h3>No pending requests found</h3>
            <p>You don’t have any pending requests right now.</p>
          </div>
        ) : (
          <div className="pending-grid">
            {pendingRequests.map((req) => {
              const user = req.requester;

              return (
                <div key={req._id} className="pending-card">
                  <div className="pending-top">
                    <img
                      src={user.avatar || "https://via.placeholder.com/150"}
                      alt="profile"
                      className="pending-avatar"
                    />
                    <div className="pending-info">
                      <h3>{user.full_name}</h3>
                      <p>📍 {user.location}</p>
                      <p>🎂 Age: {user.age}</p>
                    </div>
                  </div>

                  <div className="pending-actions">
                    <button
                      className="pending-btn-accept"
                      onClick={() => handleAccept(req._id)}
                    >
                      ✅ Accept
                    </button>

                    <button
                      className="pending-btn-view"
                      onClick={() => handleViewProfile(user._id)}
                    >
                      👤 View Profile
                    </button>

                    <button
                      className="pending-btn-reject"
                      onClick={() => handleReject(req._id)}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PrivateLayout>
  );
};

export default PendingRequestsPage;