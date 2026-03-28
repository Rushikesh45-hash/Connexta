import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/landingpage.css";
import landingImage from "../assests/lann.jpg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1 className="logo">Connexta</h1>
        <nav>
          <button className="btn" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
          <button className="btn outline" onClick={() => navigate("/login")}>
            Login
          </button>
        </nav>
      </header>

      <section className="hero-section">
        <img src={landingImage} alt="Find your match" className="hero-image" />
        <div className="hero-overlay">
          <h1>Find Your Smart matching 🤞❤️</h1>
          <p>Discover a true Connection in fake world</p>

          <button className="btn hero-btn" onClick={() => navigate("/signup")}>
            Start Matching
          </button>
        </div>
      </section>

      <div className="info-bar">
        <span>#1 Matchmaking Service</span>
        <span>⭐ ⭐ ⭐ ⭐ ⭐ Ratings on Playstore by 2.4 lakh users</span>
        <span>80 Lakh Success Stories</span>
      </div>

      <footer className="landing-footer">
        <p>&copy; 2026 Connexta. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;