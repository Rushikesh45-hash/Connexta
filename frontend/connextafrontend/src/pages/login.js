import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../layouts/publiclayout";
import "../styles/login.css";
import { loginuser } from "../api/authapi";
import { getCurrentUser } from "../api/userapi"; 

const Login = () => {
  const navigate = useNavigate();

  const [formdata, setFormdata] = useState({
    identifier: "",
    password: ""
  });

  const handlechange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };

  const handlesubmit = async (e) => {
    e.preventDefault();

    const logindata = {
      email: formdata.identifier.includes("@") ? formdata.identifier : "",
      user_name: !formdata.identifier.includes("@") ? formdata.identifier : "",
      password: formdata.password
    };

    try {
      const data = await loginuser(logindata);

      if (!data.success) {
        alert(data.message || "Login failed");
        return;
      }

      alert("Login successful");

      const meData = await getCurrentUser();

      if (!meData.success) {
        alert(meData.message || "Unable to fetch profile status");
        return;
      }

      if (!meData.data.isProfileComplete) {
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
      <div className="login-card">
        <h1>Welcome Back</h1>

        <form className="login-form" onSubmit={handlesubmit}>
          <label>
            Email or Username
            <input
              type="text"
              name="identifier"
              value={formdata.identifier}
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
            Login
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
          Don’t have an account?{" "}
          <span className="signup-link" onClick={() => navigate("/signup")}>
            Sign Up
          </span>
        </p>
      </div>
    </PublicLayout>
  );
};

export default Login;