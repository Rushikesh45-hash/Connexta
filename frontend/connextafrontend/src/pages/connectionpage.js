import React, { useEffect, useState } from "react";
import PrivateLayout from "../layouts/privatelayout";
import { getMyConnections } from "../api/connectionapi";
import { useNavigate } from "react-router-dom";
import "../styles/connectionpage.css";
import axios from "axios";

const ConnectionsPage = () => {
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get("http://localhost:8000/users/checkprofilecomplete", {
        withCredentials: true,
      });

      if (res.data.success) {
        setCurrentUserId(res.data.data.user._id);
      }
    } catch (error) {
      console.log("Error fetching current user:", error);
    }
  };

  const fetchConnections = async () => {
    try {
      const data = await getMyConnections();

      if (data.success) {
        setConnections(data.data || []);
      } else {
        setConnections([]);
      }
    } catch (error) {
      console.log("Error fetching connections:", error);
      setConnections([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCurrentUser();
      await fetchConnections();
      setLoading(false);
    };

    init();
  }, []);

  const getOtherUser = (connection) => {
    if (!currentUserId) return null;

    const requesterId = connection.requester?._id?.toString();
    const recipientId = connection.recipient?._id?.toString();

    if (requesterId === currentUserId.toString()) {
      return connection.recipient;
    }

    if (recipientId === currentUserId.toString()) {
      return connection.requester;
    }

    return null;
  };

  const handleViewProfile = (userId) => {
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };

  const handleMessage = (userId) => {
    if (!userId) {
      alert("Receiver id missing");
      return;
    }

    if (userId === currentUserId) {
      alert("You cannot message yourself.");
      return;
    }

    navigate(`/chatpage?user=${userId}`);
  };

  return (
    <PrivateLayout>
      <div className="connections-container">
        <div className="connections-header">
          <h2>🤝 My Connections</h2>
          <p>Here you can view all your accepted connections and start chatting.</p>
        </div>

        {loading ? (
          <div className="connections-loading">
            <p>Loading connections...</p>
          </div>
        ) : !currentUserId ? (
          <div className="connections-empty">
            <h3>User not logged in</h3>
            <p>Current user id not found. Please login again.</p>
          </div>
        ) : connections.length === 0 ? (
          <div className="connections-empty">
            <h3>No connections found</h3>
            <p>Accept requests or send new requests to build connections.</p>
            <button className="connections-btn" onClick={() => navigate("/matches")}>
              Explore Matches
            </button>
          </div>
        ) : (
          <div className="connections-grid">
            {connections.map((connection) => {
              const user = getOtherUser(connection);

              // show debug card if logic fails
              if (!user) {
                return (
                  <div key={connection._id} className="connection-card">
                    <h3 style={{ color: "red" }}>Error: Other user not found</h3>
                    <p>Requester: {connection.requester?._id}</p>
                    <p>Recipient: {connection.recipient?._id}</p>
                    <p>Current User: {currentUserId}</p>
                  </div>
                );
              }

              return (
                <div key={connection._id} className="connection-card">
                  <img
                    src={user.avatar || "https://via.placeholder.com/150"}
                    alt="profile"
                    className="connection-avatar"
                  />

                  <div className="connection-info">
                    <h3>{user.full_name}</h3>
                    <p>📍 {user.location}</p>
                    <p>🎂 Age: {user.age}</p>
                  </div>

                  <div className="connection-actions">
                    <button
                      className="connection-btn-primary"
                      onClick={() => handleMessage(user._id)}
                    >
                      💬 Message
                    </button>

                    <button
                      className="connection-btn-secondary"
                      onClick={() => handleViewProfile(user._id)}
                    >
                      👤 View Profile
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

export default ConnectionsPage;