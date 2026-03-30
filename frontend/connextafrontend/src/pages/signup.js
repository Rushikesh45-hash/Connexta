import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../layouts/publiclayout";
import "../styles/signup.css";
import { registeruser } from "../api/authapi";

const Signup = () => {
  const navigate = useNavigate();

  const [formdata, setFormdata] = useState({
    full_name: "",
    user_name: "",
    email: "",
    password: ""
  });

  const handlechange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };

  const handlesubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await registeruser(formdata);

      if (!data.success) {
        alert(data.message || "Signup failed");
        return;
      }

      alert("Signup successful");

      if (!data.data.isProfileComplete) {
        navigate("/profile-setup");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      console.log(error);
      alert("Server error");
    }
  };

  const handlegoogle = () => {
    window.location.href = "http://localhost:8000/auth/google";
  };

  return (
    <PublicLayout>
      <div className="signup-card">
        <h1>Create Your Account</h1>

        <form className="signup-form" onSubmit={handlesubmit}>
          <label>
            Full Name
            <input
              type="text"
              name="full_name"
              value={formdata.full_name}
              onChange={handlechange}
              required
            />
          </label>

          <label>
            Username
            <input
              type="text"
              name="user_name"
              value={formdata.user_name}
              onChange={handlechange}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formdata.email}
              onChange={handlechange}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formdata.password}
              onChange={handlechange}
              required
            />
          </label>

          <button type="submit" className="btn">
            Sign Up
          </button>
        </form>

        <button className="google-btn" onClick={handlegoogle}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
            alt="google"
          />
          Continue with Google
        </button>

        <p>
          Already have an account?{" "}
          <span className="login-link" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </PublicLayout>
  );
};

export default Signup;