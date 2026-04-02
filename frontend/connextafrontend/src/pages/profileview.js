import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PrivateLayout from "../layouts/privatelayout";
import axios from "axios";
import "../styles/profileview.css";

const ProfileView = () => {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`http://localhost:8000/users/user/${id}`, {
        withCredentials: true,
      });

      setProfile(res.data.data);
    } catch (err) {
      console.log(err);
      setProfile(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  return (
    <PrivateLayout>
      <div className="profile-container">
        {loading ? (
          <h2>Loading...</h2>
        ) : !profile ? (
          <h2>User profile not found</h2>
        ) : (
          <div className="profile-card">
            <div className="profile-header">
              <div>
                <h2>{profile.full_name}</h2>
                <p className="profile-sub">@{profile.user_name}</p>
                <p className="profile-sub">📍 {profile.location}</p>
              </div>

              <img
                src={profile.avatar || "https://via.placeholder.com/150"}
                alt="avatar"
                className="profile-avatar"
              />
            </div>

            <div className="profile-details">
              <p><b>Full Name:</b> {profile.full_name}</p>
              <p><b>Username:</b> {profile.user_name}</p>
              <p><b>Email:</b> {profile.email || "Not Available"}</p>
              <p><b>Gender:</b> {profile.gender || "Not Available"}</p>
              <p><b>Age:</b> {profile.age || "Not Available"}</p>
              <p><b>Salary:</b> {profile.salary || "Not Available"}</p>
              <p><b>Location:</b> {profile.location || "Not Available"}</p>

              <p><b>Bio:</b> {profile.bio || "No bio available"}</p>

              <p>
                <b>Hobbies:</b>{" "}
                {profile.Hobbies && profile.Hobbies.length > 0
                  ? profile.Hobbies.join(", ")
                  : "Not Available"}
              </p>

              <p><b>Profile Completed:</b> {profile.isProfileComplete ? "Yes" : "No"}</p>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  );
};

export default ProfileView;