import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-logo">Connexta</h2>

      <nav className="sidebar-menu">
        <NavLink to="/dashboard" className="sidebar-link">
          Dashboard
        </NavLink>

        <NavLink to="/matches" className="sidebar-link">
          Matches
        </NavLink>

        <NavLink to="/requests" className="sidebar-link">
          Requests
        </NavLink>

        <NavLink to="/connections" className="sidebar-link">
          Connections
        </NavLink>

        <NavLink to="/chat" className="sidebar-link">
          Chat
        </NavLink>

        <NavLink to="/my-profile" className="sidebar-link">
          My Profile
        </NavLink>

        <NavLink to="/settings" className="sidebar-link">
          Settings
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;