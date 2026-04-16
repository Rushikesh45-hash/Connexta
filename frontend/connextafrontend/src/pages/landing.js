import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/landing.css";
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
        <img src={landingImage} alt="match" className="hero-image" />
        <div className="hero-overlay">
          <h1>Find Your Smart matching 🤞❤️</h1>
          <p>Discover a true Connection in fake world</p>
          <button className="btn hero-btn" onClick={() => navigate("/signup")}>
            Start Matching
          </button>
        </div>
      </section>

<footer className="landing-footer">
  <p>&copy; 2026 Connexta. Built with ❤️ for meaningful connections.</p>
</footer>
      <footer className="landing-footer">
        <p>&copy; 2026 Connexta. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;