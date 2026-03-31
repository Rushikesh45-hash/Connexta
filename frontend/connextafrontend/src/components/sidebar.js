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

        <button
          onClick={async () => {
            try {
              const res = await fetch("http://localhost:8000/users/checkprofilecomplete", {
                method: "GET",
                credentials: "include",
              });

              const data = await res.json();

              if (data.success) {
                navigate(`/profile/${data.data._id}`);
              }
            } catch (err) {
              console.log(err);
            }
          }}
          className="sidebar-link"
        >
          👤 My Profile
        </button>

        <NavLink to="/settings" className="sidebar-link">
          Settings
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;