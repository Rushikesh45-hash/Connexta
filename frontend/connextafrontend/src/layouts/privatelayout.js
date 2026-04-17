import React, { useState } from "react";
import Navbar from "../components/navbar";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/userapi";
import "../styles/privatelayout.css";

const PrivateLayout = ({ children }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarNavigate = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const handleMyProfile = async () => {
    try {
      const data = await getCurrentUser();

      if (data.success) {
        setSidebarOpen(false);
        navigate(`/profile/${data.data.user._id}`);
      } else {
        alert(data.message || "Unable to fetch current user");
      }
    } catch (error) {
      console.log(error);
      alert("Server error");
    }
  };

  return (
    <div className="private-layout">
      {/* Navbar with Hamburger */}
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <h3 className="sidebar-title">Connexta</h3>

        <button
          onClick={() => handleSidebarNavigate("/dashboard")}
          className="sidebar-link"
        >
          🏠 Dashboard
        </button>

        <button
          onClick={() => handleSidebarNavigate("/matches")}
          className="sidebar-link"
        >
          💘 Matches
        </button>

        <button
          onClick={() => handleSidebarNavigate("/all-profiles")}
          className="sidebar-link"
        >
          🌍 All Profiles
        </button>

        <button
          onClick={() => handleSidebarNavigate("/blocked-users")}
          className="sidebar-link"
        >
          🚫 Blocked Users
        </button>

        <button
          onClick={() => handleSidebarNavigate("/pending-requests")}
          className="sidebar-link"
        >
          📩 Pending Requests
        </button>

        <button
          onClick={() => handleSidebarNavigate("/connections")}
          className="sidebar-link"
        >
          🤝 Connections
        </button>

        <button onClick={handleMyProfile} className="sidebar-link">
          👤 My Profile
        </button>

        <button
          onClick={() => handleSidebarNavigate("/settings")}
          className="sidebar-link"
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Main Content */}
      <div className="private-content">{children}</div>
    </div>
  );
};

export default PrivateLayout;