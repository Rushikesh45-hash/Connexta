// import React from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import "../styles/sidebar.css";
// import { getCurrentUser } from "../api/userapi";

// const Sidebar = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="sidebar">
//       <h2 className="sidebar-logo">Connexta</h2>

//       <nav className="sidebar-menu">
//         <NavLink to="/dashboard" className="sidebar-link">
//           Dashboard
//         </NavLink>

//         <NavLink to="/matches" className="sidebar-link">
//           Matches
//         </NavLink>

//         <NavLink to="/requests" className="sidebar-link">
//           Requests
//         </NavLink>

//         <NavLink to="/connections" className="sidebar-link">
//           Connections
//         </NavLink>

//         {/* <NavLink to="/chat" className="sidebar-link">
//           Chat
//         </NavLink> */}
//         <button
//           onClick={async () => {
//             try {
//               const data = await getCurrentUser();

//               if (data.success) {
//                 navigate(`/profile/${data.data.user._id}`);
//               }
//             } catch (error) {
//               console.log(error);
//             }
//           }}
//           className="sidebar-link"
//         >
//           👤 My Profile
//         </button>
//         <NavLink to="/settings" className="sidebar-link">
//           Settings
//         </NavLink>
//       </nav>
//     </div>
//   );
// };

// export default Sidebar;