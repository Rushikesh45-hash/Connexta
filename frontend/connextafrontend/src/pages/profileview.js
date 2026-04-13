import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PrivateLayout from "../layouts/privatelayout";
import axios from "axios";
import { blockUser } from "../api/connectionapi";
import { useNavigate } from "react-router-dom";
import "../styles/profileview.css";

const ProfileView = () => {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  //  to check if current user is viewing own profile or someone else profile
  const [isMyProfile, setIsMyProfile] = useState(false);

  const navigate = useNavigate();

  // this function is used to block user when current user click on block button
  // and once blocked user will not appear in matching/discover list if we update backend matching query
  const handleBlockUser = async () => {
    try {
      // const confirmBlock = window.confirm(
      //   "Are you sure you want to block this user?"
      // );

      // if (!confirmBlock) return;

      const res = await blockUser(profile._id);

      alert(res.message || "User blocked successfully");

      // after blocking redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      alert("Failed to block user");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      try {
        //fetching profile of that id
        const res = await axios.get(`http://localhost:8000/users/user/${id}`, {
          withCredentials: true,
        });

        setProfile(res.data.data);

        // NEW: check current logged in user
        const currentUserRes = await axios.get(
          "http://localhost:8000/users/checkprofilecomplete",
          { withCredentials: true }
        );

        const currentUserId = currentUserRes.data.data.user._id;

        // if current user id is same as profile id then it means user is viewing his own profile
        if (currentUserId === id) {
          setIsMyProfile(true);
        } else {
          setIsMyProfile(false);
        }
      } catch (err) {
        console.log(err);
        setProfile(null);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  return (
    <PrivateLayout>
      <div className="profile-container">
        {loading ? (
          <div className="profile-loading">
            <h2>Loading Profile...</h2>
          </div>
        ) : !profile ? (
          <div className="profile-notfound">
            <h2>User profile not found</h2>
          </div>
        ) : (
          <div className="profile-card">
            {/* top profile section */}
            <div className="profile-header">
              <div className="profile-left">
                <img
                  src={profile.avatar || "https://via.placeholder.com/150"}
                  alt="avatar"
                  className="profile-avatar"
                />

                <div className="profile-basic">
                  <h2>
                    {profile.full_name}{" "}
                    {profile.age ? (
                      <span className="profile-age">({profile.age})</span>
                    ) : null}
                  </h2>

                  <p className="profile-sub">@{profile.user_name}</p>

                  <p className="profile-location">
                    📍 {profile.location || "Not Available"}
                  </p>

                  <div className="profile-badges">
                    <span className="badge">
                      {profile.gender ? profile.gender : "Gender NA"}
                    </span>

                    <span className="badge">
                      💼{" "}
                      {profile.education
                        ? profile.education
                        : "Education NA"}
                    </span>

                    <span className="badge">
                      💰 {profile.salary ? profile.salary : "Salary NA"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                {isMyProfile ? (
                  <button
                    className="btn-primary"
                    onClick={() => navigate("/profile-setup")}
                  >
                    ✏️ Update Profile
                  </button>
                ) : (
                  <>
                    {/* send request and message button we will add later */}
                    {/* here block button is used to block this user */}
                    <button className="btn-danger" onClick={handleBlockUser}>
                      🚫 Block
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="profile-section">
              <h3 className="section-title">About</h3>
              <p className="profile-bio">{profile.bio || "No bio available"}</p>
            </div>

            {/* Details Section */}
            <div className="profile-section">
              <h3 className="section-title">Personal Details</h3>

              <div className="profile-grid">
                <div className="profile-item">
                  <span className="label">Full Name</span>
                  <span className="value">{profile.full_name}</span>
                </div>

                <div className="profile-item">
                  <span className="label">Username</span>
                  <span className="value">{profile.user_name}</span>
                </div>

                <div className="profile-item">
                  <span className="label">Email</span>
                  <span className="value">
                    {profile.email || "Not Available"}
                  </span>
                </div>

                <div className="profile-item">
                  <span className="label">Mobile No</span>
                  <span className="value">
                    {profile.mobileNo || "Not Available"}
                  </span>
                </div>

                <div className="profile-item">
                  <span className="label">Gender</span>
                  <span className="value">
                    {profile.gender || "Not Available"}
                  </span>
                </div>

                <div className="profile-item">
                  <span className="label">Age</span>
                  <span className="value">{profile.age || "Not Available"}</span>
                </div>

                <div className="profile-item">
                  <span className="label">Salary</span>
                  <span className="value">
                    {profile.salary || "Not Available"}
                  </span>
                </div>

                <div className="profile-item">
                  <span className="label">Location</span>
                  <span className="value">
                    {profile.location || "Not Available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Hobbies Section */}
            <div className="profile-section">
              <h3 className="section-title">Hobbies</h3>

              <div className="hobby-container">
                {profile.Hobbies && profile.Hobbies.length > 0 ? (
                  profile.Hobbies.map((hobby, index) => (
                    <span key={index} className="hobby-tag">
                      {hobby}
                    </span>
                  ))
                ) : (
                  <p className="empty-text">Not Available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  );
};

export default ProfileView;