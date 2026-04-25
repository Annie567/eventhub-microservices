import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/navbar.css";
import API_BASE_URL from "../config";

function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        setCurrentUser(null);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/api/me/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCurrentUser(res.data);
      } catch (err) {
        console.error("Failed to load current user:", err);
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    setCurrentUser(null);
    navigate("/login");
  };

  const isLoggedIn = !!currentUser;

  const isAdmin =
    currentUser?.participant?.role === "admin" ||
    currentUser?.is_staff ||
    currentUser?.is_superuser;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {isLoggedIn && (
          <>
            <Link className="navbar-link" to="/dashboard">
              Dashboard
            </Link>
            <span className="navbar-separator">|</span>
          </>
        )}

        <Link className="navbar-link" to="/events">
          Events
        </Link>

        {isLoggedIn && (
          <>
            <span className="navbar-separator">|</span>
            <Link className="navbar-link" to="/participants">
              Participants
            </Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        {isLoggedIn ? (
          <>
            <span className="navbar-user">
              {currentUser?.username || "User"}
            </span>

            {isAdmin && (
              <>
                <span className="navbar-separator">|</span>
                <span className="navbar-role">Admin</span>
              </>
            )}

            <span className="navbar-separator">|</span>
            <button className="navbar-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link className="navbar-link" to="/login">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;