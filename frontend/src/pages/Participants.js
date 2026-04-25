import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/participants.css";
import API_BASE_URL from "../config";

function Participants() {
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [myParticipant, setMyParticipant] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [editingParticipantId, setEditingParticipantId] = useState(null);
  const [adminEditForm, setAdminEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
  });

  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "participant",
  });

  const token = localStorage.getItem("access");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const headers = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const userRes = await axios.get(`${API_BASE_URL}/api/me/`, headers);
      const user = userRes.data;
      setCurrentUser(user);

      const admin =
        user?.role === "admin" ||
        user?.participant?.role === "admin" ||
        user?.is_staff ||
        user?.is_superuser;

      const participantsRes = await axios.get(
        `${API_BASE_URL}/api/participants/`,
        headers
      );
      setParticipants(participantsRes.data);

      if (!admin) {
        try {
          const myRes = await axios.get(
            `${API_BASE_URL}/api/participants/me/`,
            headers
          );
          const data = myRes.data;
          setMyParticipant(data);
          setEditForm({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            phone: data.phone || "",
          });
        } catch {
          setMyParticipant(null);
          setMessage("No participant profile found for this account.");
        }
      } else {
        setMyParticipant(null);
      }
    } catch {
      setMessage("Failed to load participants.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setMessage("Not authenticated.");
      setLoading(false);
      return;
    }

    fetchData();
  }, [fetchData, token]);

  const isAdmin =
    currentUser?.role === "admin" ||
    currentUser?.participant?.role === "admin" ||
    currentUser?.is_staff ||
    currentUser?.is_superuser;

  const handleChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAdminChange = (e) => {
    setAdminEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateChange = (e) => {
    setCreateForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/participants/me/`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMyParticipant(res.data);
      setEditForm({
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
      });
      setMessage("Your profile has been updated successfully.");
    } catch (err) {
      setMessage(
        err?.response?.data?.email?.[0] ||
          err?.response?.data?.detail ||
          "Failed to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const startAdminEdit = (participant) => {
    setEditingParticipantId(participant.id);
    setAdminEditForm({
      first_name: participant.first_name || "",
      last_name: participant.last_name || "",
      email: participant.email || "",
      phone: participant.phone || "",
      role: participant.role || "participant",
    });
  };

  const cancelAdminEdit = () => {
    setEditingParticipantId(null);
    setAdminEditForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "",
    });
  };

  const handleAdminUpdate = async (participantId) => {
    setMessage("");

    try {
      await axios.patch(
        `${API_BASE_URL}/api/participants/${participantId}/`,
        adminEditForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Participant updated successfully.");
      setEditingParticipantId(null);
      fetchData();
    } catch (err) {
      setMessage(
        err?.response?.data?.email?.[0] ||
          err?.response?.data?.detail ||
          "Failed to update participant."
      );
    }
  };

  const handleDeleteParticipant = async (participantId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this participant?"
    );
    if (!confirmed) return;

    setMessage("");

    try {
      await axios.delete(`${API_BASE_URL}/api/participants/${participantId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Participant deleted successfully.");
      fetchData();
    } catch (err) {
      setMessage(
        err?.response?.data?.detail || "Failed to delete participant."
      );
    }
  };

  const handleCreateParticipant = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMessage("");

    try {
      await axios.post(`${API_BASE_URL}/api/participants/`, createForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Participant created successfully.");
      setCreateForm({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "participant",
      });
      fetchData();
    } catch (err) {
      setMessage(
        err?.response?.data?.username?.[0] ||
          err?.response?.data?.email?.[0] ||
          err?.response?.data?.detail ||
          "Failed to create participant."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="participants-page">
        <div className="participants-header">
          <h2 className="participants-title">
            {isAdmin ? "Participants Management" : "My Participant Profile"}
          </h2>
          <p className="participants-subtitle">
            {isAdmin
              ? "View and manage participant profiles across the platform"
              : "View and update your participant information"}
          </p>
        </div>

        {message && <p className="participants-message">{message}</p>}

        {loading ? (
          <div className="participants-empty">Loading participants...</div>
        ) : (
          <>
            {!isAdmin && (
              <div className="participant-card participants-profile-card">
                <div className="participant-card-left">
                  <h3 className="participant-name">My Profile</h3>

                  {myParticipant ? (
                    <form
                      className="participants-edit-form"
                      onSubmit={handleProfileUpdate}
                    >
                      <div className="participants-form-row">
                        <div className="participants-form-group">
                          <label>First Name</label>
                          <input
                            type="text"
                            name="first_name"
                            value={editForm.first_name}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="participants-form-group">
                          <label>Last Name</label>
                          <input
                            type="text"
                            name="last_name"
                            value={editForm.last_name}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="participants-form-row">
                        <div className="participants-form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            name="email"
                            value={editForm.email}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="participants-form-group">
                          <label>Phone</label>
                          <input
                            type="text"
                            name="phone"
                            value={editForm.phone}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="participants-form-row">
                        <div className="participants-form-group">
                          <label>Username</label>
                          <input
                            type="text"
                            value={myParticipant?.username || ""}
                            disabled
                          />
                        </div>

                        <div className="participants-form-group">
                          <label>Role</label>
                          <input
                            type="text"
                            value={myParticipant?.role || ""}
                            disabled
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="participants-action-btn"
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Update My Profile"}
                      </button>
                    </form>
                  ) : (
                    <div className="participants-empty">
                      No participant profile found for this account.
                    </div>
                  )}
                </div>
              </div>
            )}

            {isAdmin && (
              <>
                <div className="participant-card participants-profile-card">
                  <div className="participant-card-left">
                    <h3 className="participant-name">Create New Participant</h3>

                    <form
                      className="participants-edit-form"
                      onSubmit={handleCreateParticipant}
                    >
                      <div className="participants-form-row">
                        <div className="participants-form-group">
                          <label>Username</label>
                          <input
                            type="text"
                            name="username"
                            value={createForm.username}
                            onChange={handleCreateChange}
                            required
                          />
                        </div>

                        <div className="participants-form-group">
                          <label>Password</label>
                          <input
                            type="password"
                            name="password"
                            value={createForm.password}
                            onChange={handleCreateChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="participants-form-row">
                        <div className="participants-form-group">
                          <label>First Name</label>
                          <input
                            type="text"
                            name="first_name"
                            value={createForm.first_name}
                            onChange={handleCreateChange}
                          />
                        </div>

                        <div className="participants-form-group">
                          <label>Last Name</label>
                          <input
                            type="text"
                            name="last_name"
                            value={createForm.last_name}
                            onChange={handleCreateChange}
                          />
                        </div>
                      </div>

                      <div className="participants-form-row">
                        <div className="participants-form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            name="email"
                            value={createForm.email}
                            onChange={handleCreateChange}
                            required
                          />
                        </div>

                        <div className="participants-form-group">
                          <label>Phone</label>
                          <input
                            type="text"
                            name="phone"
                            value={createForm.phone}
                            onChange={handleCreateChange}
                          />
                        </div>
                      </div>

                      <div className="participants-form-row">
                        <div className="participants-form-group">
                          <label>Role</label>
                          <select
                            name="role"
                            value={createForm.role}
                            onChange={handleCreateChange}
                          >
                            <option value="participant">participant</option>
                            <option value="viewer">viewer</option>
                            <option value="admin">admin</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="participants-action-btn"
                        disabled={creating}
                      >
                        {creating ? "Creating..." : "Create Participant"}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="participants-admin-panel">
                  <div className="participants-admin-card">
                    <span className="participants-admin-label">
                      Total Participants
                    </span>
                    <span className="participants-admin-value">
                      {participants.length}
                    </span>
                  </div>
                </div>

                {participants.length > 0 ? (
                  <div className="participants-list">
                    {participants.map((participant) => (
                      <div key={participant.id} className="participant-card">
                        <div className="participant-card-left">
                          {editingParticipantId === participant.id ? (
                            <div className="participants-edit-form">
                              <div className="participants-form-row">
                                <div className="participants-form-group">
                                  <label>First Name</label>
                                  <input
                                    type="text"
                                    name="first_name"
                                    value={adminEditForm.first_name}
                                    onChange={handleAdminChange}
                                  />
                                </div>

                                <div className="participants-form-group">
                                  <label>Last Name</label>
                                  <input
                                    type="text"
                                    name="last_name"
                                    value={adminEditForm.last_name}
                                    onChange={handleAdminChange}
                                  />
                                </div>
                              </div>

                              <div className="participants-form-row">
                                <div className="participants-form-group">
                                  <label>Email</label>
                                  <input
                                    type="email"
                                    name="email"
                                    value={adminEditForm.email}
                                    onChange={handleAdminChange}
                                  />
                                </div>

                                <div className="participants-form-group">
                                  <label>Phone</label>
                                  <input
                                    type="text"
                                    name="phone"
                                    value={adminEditForm.phone}
                                    onChange={handleAdminChange}
                                  />
                                </div>
                              </div>

                              <div className="participants-form-row">
                                <div className="participants-form-group">
                                  <label>Role</label>
                                  <select
                                    name="role"
                                    value={adminEditForm.role}
                                    onChange={handleAdminChange}
                                  >
                                    <option value="participant">
                                      participant
                                    </option>
                                    <option value="viewer">viewer</option>
                                    <option value="admin">admin</option>
                                  </select>
                                </div>
                              </div>

                              <div className="participant-card-right">
                                <button
                                  className="participants-action-btn"
                                  onClick={() =>
                                    handleAdminUpdate(participant.id)
                                  }
                                  type="button"
                                >
                                  Save
                                </button>
                                <button
                                  className="participants-cancel-btn"
                                  onClick={cancelAdminEdit}
                                  type="button"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="participant-name">
                                {participant.first_name} {participant.last_name}
                              </h3>

                              <p className="participant-detail">
                                <strong>Username:</strong> {participant.username}
                              </p>

                              <p className="participant-detail">
                                <strong>Email:</strong> {participant.email}
                              </p>

                              <p className="participant-detail">
                                <strong>Phone:</strong>{" "}
                                {participant.phone ? participant.phone : "N/A"}
                              </p>

                              <p className="participant-detail">
                                <strong>Role:</strong> {participant.role}
                              </p>

                              <p className="participant-detail">
                                <strong>ID:</strong> {participant.id}
                              </p>
                            </>
                          )}
                        </div>

                        {editingParticipantId !== participant.id && (
                          <div className="participant-card-right">
                            <button
                              className="participants-edit-btn"
                              onClick={() => startAdminEdit(participant)}
                              type="button"
                            >
                              Edit
                            </button>

                            <button
                              className="participants-delete-btn"
                              onClick={() =>
                                handleDeleteParticipant(participant.id)
                              }
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="participants-empty">
                    No participants found.
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Participants;