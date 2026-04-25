import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/register.css";
import API_BASE_URL from "../config";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirm_password) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/register/`, formData);
      alert("Registration successful!");
      navigate("/");
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Registration failed."
      );
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Create your EventHub account</h1>
          <p className="register-subtitle">
            Register to explore events and manage your participation
          </p>
        </div>

        {message && <p className="register-message">{message}</p>}

        <form className="register-form" onSubmit={handleRegister}>
          <div className="register-form-group">
            <label className="register-label">Username</label>
            <input
              className="register-input"
              name="username"
              type="text"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="register-form-group">
            <label className="register-label">Email</label>
            <input
              className="register-input"
              name="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="register-row">
            <div className="register-form-group">
              <label className="register-label">First Name</label>
              <input
                className="register-input"
                name="first_name"
                type="text"
                placeholder="First name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="register-form-group">
              <label className="register-label">Last Name</label>
              <input
                className="register-input"
                name="last_name"
                type="text"
                placeholder="Last name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="register-form-group">
            <label className="register-label">Phone</label>
            <input
              className="register-input"
              name="phone"
              type="text"
              placeholder="Phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="register-row">
            <div className="register-form-group">
              <label className="register-label">Password</label>
              <input
                className="register-input"
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="register-form-group">
              <label className="register-label">Confirm Password</label>
              <input
                className="register-input"
                name="confirm_password"
                type="password"
                placeholder="Confirm password"
                value={formData.confirm_password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button className="register-button" type="submit">
            Register
          </button>
        </form>

        <p className="register-footer">
          Already have an account?{" "}
          <Link className="register-link" to="/">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;