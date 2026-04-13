import React, { useEffect, useState } from "react";
import PrivateLayout from "../layouts/privatelayout";
import { getBlockedUsers, unblockUser } from "../api/connectionapi";
import { useNavigate } from "react-router-dom";
import "../styles/blockedusers.css";

const BlockedUsersPage = () => {
  const navigate = useNavigate();

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlockedUsers = async () => {
    setLoading(true);

    try {
      const data = await getBlockedUsers();

      if (data.success) {
        setBlockedUsers(data.data || []);
      } else {
        setBlockedUsers([]);
      }
    } catch (error) {
      console.log(error);
      setBlockedUsers([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const handleUnblock = async (blockedId) => {
    try {
      const res = await unblockUser(blockedId);
      alert(res.message || "User unblocked successfully");
      fetchBlockedUsers();
    } catch (error) {
      console.log(error);
      alert("Failed to unblock user");
    }
  };

  return (
    <PrivateLayout>
      <div className="blocked-container">
        <div className="blocked-header">
          <h2>🚫 Blocked Users</h2>
          <p>Here you can see all blocked users and unblock them anytime.</p>
        </div>

        {loading ? (
          <h3 style={{ textAlign: "center" }}>Loading...</h3>
        ) : blockedUsers.length === 0 ? (
          <div className="blocked-empty">
            <h3>No blocked users</h3>
            <p>You haven’t blocked anyone yet.</p>
          </div>
        ) : (
          <div className="blocked-grid">
            {blockedUsers.map((item) => {
              const user = item.blockedId; // because populate gives full profile

              return (
                <div key={item._id} className="blocked-card">
                  <div className="blocked-top">
                    <img
                      src={user.avatar || "https://via.placeholder.com/150"}
                      alt="profile"
                      className="blocked-avatar"
                    />

                    <div className="blocked-info">
                      <h3>{user.full_name}</h3>
                      <p>@{user.user_name}</p>
                      <p>📍 {user.location || "Not Available"}</p>
                    </div>
                  </div>

                  <div className="blocked-actions">
                    <button
                      className="blocked-btn-view"
                      onClick={() => navigate(`/profile/${user._id}`)}
                    >
                      👤 View Profile
                    </button>

                    <button
                      className="blocked-btn-unblock"
                      onClick={() => handleUnblock(user._id)}
                    >
                       Unblock
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

export default BlockedUsersPage;