import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profilesetup.css";

const ProfileSetup = () => {
  const navigate = useNavigate();

  const [formdata, setFormdata] = useState({
    age: "",
    gender: "",
    Hobbies: "",
    location: "",
    salary: "",
    mobileNo: "",
    education: "",
    bio: "",                                           
    avatar: null
  });

  const handlechange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };

  const handlefilechange = (e) => {
    setFormdata({ ...formdata, avatar: e.target.files[0] });
  };

  const handlesubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataObj = new FormData();

      formDataObj.append("age", formdata.age);
      formDataObj.append("gender", formdata.gender);
      formDataObj.append("location", formdata.location);
      formDataObj.append("salary", formdata.salary);
      formDataObj.append("mobileNo", formdata.mobileNo);
      formDataObj.append("education", formdata.education);
      formDataObj.append("bio", formdata.bio);

      // hobbies convert string -> array
      const hobbiesArray = formdata.Hobbies.split(",").map((h) => h.trim());
      hobbiesArray.forEach((hobby) => formDataObj.append("Hobbies", hobby));

      if (formdata.avatar) {
        formDataObj.append("avatar", formdata.avatar);
      }

      // IMPORTANT: Your backend route is PUT not POST
      const res = await fetch("http://localhost:8000/users/profile", {
        method: "PUT",
        credentials: "include",
        body: formDataObj
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Profile setup failed");
        return;
      }

      alert("Profile created successfully!");
      navigate("/dashboard");

    } catch (error) {
      console.log(error);
      alert("Server error");
    }
  };

  return (
    <div className="profile-setup-page">
      <div className="profile-setup-card">
        <h1 className="profile-title">Complete Your Profile</h1>
        <p className="profile-subtitle">
          Fill in your details to start matching with the best people.
        </p>

        <form className="profile-form" onSubmit={handlesubmit}>
          <div className="profile-row">
            <div className="profile-input-group">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={formdata.age}
                onChange={handlechange}
                placeholder="Enter your age"
                required
              />
            </div>

            <div className="profile-input-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formdata.gender}
                onChange={handlechange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="profile-row">
            <div className="profile-input-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formdata.location}
                onChange={handlechange}
                placeholder="City / State"
                required
              />
            </div>

            <div className="profile-input-group">
              <label>Salary</label>
              <input
                type="number"
                name="salary"
                value={formdata.salary}
                onChange={handlechange}
                placeholder="Enter your salary"
                required
              />
            </div>
          </div>

          <div className="profile-row">
            <div className="profile-input-group">
              <label>Mobile Number</label>
              <input
                type="text"
                name="mobileNo"
                value={formdata.mobileNo}
                onChange={handlechange}
                placeholder="Enter mobile number"
                required
              />
            </div>

            <div className="profile-input-group">
              <label>Education</label>
              <input
                type="text"
                name="education"
                value={formdata.education}
                onChange={handlechange}
                placeholder="Enter education"
                required
              />
            </div>
          </div>

          <div className="profile-input-group">
            <label>Hobbies (comma separated)</label>
            <input
              type="text"
              name="Hobbies"
              value={formdata.Hobbies}
              onChange={handlechange}
              placeholder="Example: gym, music, coding"
              required
            />
          </div>

          <div className="profile-input-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formdata.bio}
              onChange={handlechange}
              placeholder="Write something about yourself..."
              required
            ></textarea>
          </div>

          <div className="profile-input-group">
            <label>Upload Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlefilechange}
              required
            />
          </div>

          <button type="submit" className="profile-btn">
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;