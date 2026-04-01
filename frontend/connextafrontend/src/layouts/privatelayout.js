import React from "react";
import Navbar from "../components/navbar";
import "../styles/privatelayout.css";

const PrivateLayout = ({ children }) => {
  return (
    <div className="private-layout">
      <Navbar />
      <div className="private-content">{children}</div>
    </div>
  );
};

export default PrivateLayout;