import React, { useEffect, useState } from "react";
import PrivateLayout from "../layouts/privatelayout";
import { getAllProfiles } from "../api/connectionapi";
import MatchCard from "../components/matchcard";
import "../styles/allprofilepage.css";

const AllProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

const fetchProfiles = async () => {
  setLoading(true);

  try {
    const data = await getAllProfiles();
    console.log("ALL PROFILES RESPONSE:", data);

    if (data.success) {
      // if backend returns array directly
      if (Array.isArray(data.data)) {
        setProfiles(data.data);
      }

      // if backend returns inside "users"
      else if (Array.isArray(data.data.users)) {
        setProfiles(data.data.users);
      }

      // if backend returns inside "matches"
      else if (Array.isArray(data.data.matches)) {
        setProfiles(data.data.matches);
      }

      else {
        setProfiles([]);
      }
    } else {
      setProfiles([]);
    }
  } catch (error) {
    console.log(error);
    setProfiles([]);
  }

  setLoading(false);
};

  useEffect(() => {
    fetchProfiles();
  }, []);

  return (
    <PrivateLayout>
      <div className="allprofiles-container">
        <div className="allprofiles-header">
          <h2>🌍 All Profiles</h2>
          <p>Browse all users and send connection requests.</p>
        </div>

        {loading ? (
          <h3 style={{ textAlign: "center" }}>Loading...</h3>
        ) : profiles.length === 0 ? (
          <div className="allprofiles-empty">
            <h3>No profiles found</h3>
          </div>
        ) : (
          <div className="allprofiles-grid">
            {profiles.map((user) => (
              <MatchCard key={user._id} user={user} />
            ))}
          </div>
        )}
      </div>
    </PrivateLayout>
  );
};

export default AllProfilesPage;