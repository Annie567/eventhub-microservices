import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";
import API_BASE_URL from "../config";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE_URL}/api/token/`, {
        username,
        password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", username);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setMessage("Invalid username or password.");
    }
  };

  const handleViewerAccess = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    navigate("/events");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Welcome to EventHub</h1>
          <p className="login-subtitle">
            Sign in to manage events and registrations
          </p>
        </div>

        {message && <p className="login-message">{message}</p>}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-form-group">
            <label className="login-label">Username</label>
            <input
              className="login-input"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="login-form-group">
            <label className="login-label">Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="login-actions">
            <button className="login-button" type="submit">
              Login
            </button>

            <button
              className="viewer-button"
              type="button"
              onClick={handleViewerAccess}
            >
              Browse as Viewer
            </button>
          </div>
        </form>

        <p className="login-footer">
          No account?{" "}
          <Link className="login-link" to="/register">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;