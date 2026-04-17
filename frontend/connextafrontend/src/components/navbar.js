import React, { useEffect, useRef, useState } from "react";
import "../styles/navbar.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/users/checkprofilecomplete",
        { withCredentials: true }
      );

      if (res.data.success) {
        const userId = res.data.data.user._id;

        const userRes = await axios.get(
          `http://localhost:8000/users/user/${userId}`,
          { withCredentials: true }
        );

        if (userRes.data.success) {
          setCurrentUser(userRes.data.data);
        }
      }
    } catch (error) {
      console.log("Navbar fetch error:", error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // close dropdown if click outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    navigate("/");
  };

  return (
    <div className="navbar">
      {/* Left */}
      <div className="navbar-left">
<button className="hamburger-btn" onClick={toggleSidebar}>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6H20"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M4 12H20"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M4 18H20"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
</button>

        <h3 className="navbar-title" onClick={() => navigate("/dashboard")}>
          Connexta
        </h3>
      </div>

      {/* Right */}
      <div className="navbar-right" ref={dropdownRef}>
        <span className="navbar-user">
          {currentUser?.user_name || currentUser?.full_name || "User"}
        </span>

        <img
          src={currentUser?.avatar || "https://via.placeholder.com/150"}
          alt="user"
          className="navbar-avatar"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        />

        {dropdownOpen && (
          <div className="navbar-dropdown">
            <button
              className="dropdown-btn"
              onClick={() => {
                setDropdownOpen(false);
                navigate(`/profile/${currentUser?._id}`);
              }}
            >
              👤 My Profile
            </button>

            <button
              className="dropdown-btn"
              onClick={() => {
                setDropdownOpen(false);
                navigate("/profile-setup");
              }}
            >
              ✏️ Update Profile
            </button>

            <button className="dropdown-btn logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;