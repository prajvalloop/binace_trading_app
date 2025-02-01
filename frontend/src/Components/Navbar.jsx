import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear authentication (adjust based on your auth logic)
    localStorage.removeItem("authToken"); // Example: Removing token
    navigate("/"); // Redirect to login page
  };

  return (
    <nav className="navbar">
       <div className="brand">
        CryptoLive Ticker
        
      </div>
      <ul className="nav-list">
        <li className="nav-item">
          <NavLink 
            to="/ticker" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Ticker
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink 
            to="/profile" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Profile
          </NavLink>
        </li>
        <li className="nav-item logout" onClick={handleLogout}>
          Log out
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
