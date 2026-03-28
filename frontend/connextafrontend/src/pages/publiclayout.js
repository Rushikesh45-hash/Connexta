import React from "react";
import "../styles/publiclayout.css";
import landingImage from "../assests/lan.jpg";

const PublicLayout = ({ children }) => {
  return (
    <div
      className="public-layout"
      style={{ backgroundImage: `url(${landingImage})` }}
    >
      <div className="public-overlay">
        {children}
      </div>
    </div>
  );
};

export default PublicLayout;
