import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/eventDetail.css";
import API_BASE_URL from "../config";

function EventDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const backPath = location.state?.from || "/events";

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
  });

  const token = localStorage.getItem("access");

  const fetchEvent = useCallback(async () => {
    try {
      const eventRes = await axios.get(`${API_BASE_URL}/api/events/${id}/`);
      const eventData = eventRes.data;

      setEvent(eventData);

      setEditForm({
        title: eventData.title || "",
        description: eventData.description || "",
        location: eventData.location || "",
        start_time: eventData.start_time
          ? eventData.start_time.slice(0, 16)
          : "",
        end_time: eventData.end_time
          ? eventData.end_time.slice(0, 16)
          : "",
      });

      if (token) {
        try {
          const [registrationsRes, userRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/registrations/`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            axios.get(`${API_BASE_URL}/api/me/`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

          setRegistrations(registrationsRes.data);
          setCurrentUser(userRes.data);
        } catch (err) {
          console.error("Failed to load authenticated user data:", err);
          setRegistrations([]);
          setCurrentUser(null);
        }
      } else {
        setRegistrations([]);
        setCurrentUser(null);
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to load event.");
    }
  }, [id, token]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const currentParticipantId = currentUser?.participant?.participant_id || null;

  const isAdmin =
    currentUser?.participant?.role === "admin" ||
    currentUser?.is_staff ||
    currentUser?.is_superuser;

  const isRegistered = () => {
    if (!currentParticipantId) return false;

    return registrations.some(
      (r) => r.event === Number(id) && r.participant === currentParticipantId
    );
  };

  const getCurrentRegistration = () => {
    if (!currentParticipantId) return null;

    return registrations.find(
      (r) => r.event === Number(id) && r.participant === currentParticipantId
    );
  };

  const handleRegister = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/registrations/`,
        {
          event: Number(id),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Registered successfully.");
      await fetchEvent();
    } catch (err) {
      console.error(err);

      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.participant ||
        "Failed to register.";

      setMessage(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  };

  const handleLeave = async () => {
    try {
      const registration = getCurrentRegistration();

      if (!registration) {
        setMessage("You are not registered for this event.");
        return;
      }

      await axios.delete(
        `${API_BASE_URL}/api/registrations/${registration.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Successfully left the event.");
      await fetchEvent();
    } catch (err) {
      console.error(err);

      const errorMessage =
        err?.response?.data?.detail || "Failed to leave event.";

      setMessage(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  };

  const handleAdminRemoveParticipant = async (registrationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this participant from the event?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/api/registrations/${registrationId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Participant removed successfully.");
      await fetchEvent();
    } catch (err) {
      console.error(err);
      setMessage("Failed to remove participant.");
    }
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateEvent = async () => {
    try {
      if (
        !editForm.title ||
        !editForm.description ||
        !editForm.location ||
        !editForm.start_time ||
        !editForm.end_time
      ) {
        setMessage("Please fill in all event fields.");
        return;
      }

      if (new Date(editForm.end_time) <= new Date(editForm.start_time)) {
        setMessage("End time must be after start time.");
        return;
      }

      await axios.put(
        `${API_BASE_URL}/api/events/${id}/`,
        {
          title: editForm.title,
          description: editForm.description,
          location: editForm.location,
          start_time: editForm.start_time,
          end_time: editForm.end_time,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Event updated successfully.");
      setIsEditing(false);
      await fetchEvent();
    } catch (err) {
      console.error(err);

      const errorMessage =
        err?.response?.data?.detail || "Failed to update event.";

      setMessage(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  };

  const handleDeleteEvent = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/events/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/events");
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete event.");
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case "coming":
        return "Coming";
      case "ongoing":
        return "Ongoing";
      case "finished":
        return "Finished";
      default:
        return status;
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleString();
  };

  const registrationAvailable = event?.status === "ongoing";

  const currentEventRegistrations = registrations.filter(
    (r) => r.event === Number(id)
  );

  const isLoggedIn = !!token && !!currentUser;

  if (!event) {
    return (
      <>
        <Navbar />
        <div className="event-detail-page">
          <div className="event-detail-card">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="event-detail-page">
        <div className="event-detail-card">
          <div className="event-detail-header">
            <h2 className="event-detail-title">{event.title}</h2>
            <span className={`event-detail-status status-${event.status}`}>
              {formatStatus(event.status)}
            </span>
          </div>

          {message && <p className="event-message">{message}</p>}

          {isAdmin && (
            <div className="admin-actions-row">
              <button
                className="btn secondary"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel Edit" : "Edit Event"}
              </button>

              <button className="danger-button" onClick={handleDeleteEvent}>
                Delete Event
              </button>
            </div>
          )}

          {isEditing && isAdmin && (
            <div className="edit-event-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={editForm.start_time}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>End Time</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={editForm.end_time}
                  onChange={handleEditChange}
                />
              </div>

              <button className="btn join" onClick={handleUpdateEvent}>
                Save Changes
              </button>
            </div>
          )}

          <div className="event-action-row">
            {!isAdmin && isLoggedIn && (
              registrationAvailable ? (
                isRegistered() ? (
                  <button className="btn leave" onClick={handleLeave}>
                    Leave
                  </button>
                ) : (
                  <button className="btn join" onClick={handleRegister}>
                    Register
                  </button>
                )
              ) : event.status === "coming" ? (
                <p className="disabled-text">
                  Registration will open when the event starts.
                </p>
              ) : (
                <p className="disabled-text">Registration is not available.</p>
              )
            )}

            {!isAdmin && !isLoggedIn && (
              <p className="disabled-text">
                Log in to register for this event.
              </p>
            )}
          </div>

          <div className="event-info-grid">
            <p>
              <strong>Description:</strong> {event.description}
            </p>
            <p>
              <strong>Start:</strong> {formatDateTime(event.start_time)}
            </p>
            <p>
              <strong>End:</strong> {formatDateTime(event.end_time)}
            </p>
            <p>
              <strong>Location:</strong> {event.location}
            </p>
          </div>

          <div className="participants-section">
            <h3>Participants</h3>

            {isLoggedIn ? (
              <>
                <p>
                  <strong>Total:</strong> {currentEventRegistrations.length}
                </p>

                {currentEventRegistrations.length > 0 ? (
                  <div className="participants-list">
                    {currentEventRegistrations.map((r) => (
                      <div key={r.id} className="participant-item participant-row">
                        <span className="participant-name">
                          {r.participant_name || `Participant #${r.participant}`}
                        </span>

                        {isAdmin && (
                          <button
                            className="danger-button small-button"
                            onClick={() => handleAdminRemoveParticipant(r.id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No participants yet.</p>
                )}
              </>
            ) : (
              <p>Log in to view participant details.</p>
            )}
          </div>

          <div className="back-row">
            <Link to={backPath} className="back-link">
              Back
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default EventDetail;