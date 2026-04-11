import React, { useEffect, useState } from "react";
import PrivateLayout from "../layouts/privatelayout";
import { getMyConnections } from "../api/connectionapi";
import { useNavigate } from "react-router-dom";
import "../styles/connectionpage.css";

const ConnectionsPage = () => {
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    setLoading(true);

    try {
      const data = await getMyConnections();

      if (data.success) {
        setConnections(data.data || []);
      } else {
        setConnections([]);
      }
    } catch (error) {
      console.log(error);
      setConnections([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const getOtherUser = (connection) => {
    // here we check who is other user in connection because one is requester and one is recipient
    // if current user is requester then show recipient else show requester
    const currentUserId = localStorage.getItem("userId"); // you can replace this with auth state later

    if (connection.requester?._id === currentUserId) {
      return connection.recipient;
    } else {
      return connection.requester;
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleMessage = (userId) => {
    // here we can redirect to chat page and later we will create chatroom
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