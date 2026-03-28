import React from "react";
import "../styles/navbar.css";

const Navbar = () => {
  return (
    <div className="navbar">
      <h3 className="navbar-title">Connexta</h3>

      <div className="navbar-right">
        <span className="navbar-user">User</span>
        <img
          className="navbar-avatar"
          src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
          alt="user"
        />
      </div>
    </div>
  );
};

export default Navbar;