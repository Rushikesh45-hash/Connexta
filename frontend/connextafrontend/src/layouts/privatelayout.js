import React from "react";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import "../styles/privatelayout.css";

const PrivateLayout = ({ children }) => {
  return (
    <div className="private-layout">
      <Sidebar />

      <div className="private-main">
        <Navbar />
        <div className="private-content">{children}</div>
      </div>
    </div>
  );
};

export default PrivateLayout;