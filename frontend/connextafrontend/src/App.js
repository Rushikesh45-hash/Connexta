import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./pages/landing";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Matches from "./pages/matches";
import ProfileSetup from "./pages/profilesetup";
import ProfileView from "./pages/profileview";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/profile/:id" element={<ProfileView />} />
      </Routes>
    </Router>
  );
};

export default App;