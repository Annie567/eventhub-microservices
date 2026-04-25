import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/events.css";
import API_BASE_URL from "../config";

function Events() {
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");

  const [filter, setFilter] = useState("all");

  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsRes = await axios.get(`${API_BASE_URL}/api/events/`);
        setEvents(eventsRes.data);
      } catch (err) {
        console.error("Failed to load events:", err);
        setEvents([]);
      }

      if (token) {
        try {
          const userRes = await axios.get(`${API_BASE_URL}/api/me/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCurrentUser(userRes.data);
        } catch (err) {
          console.error("Failed to load current user:", err);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    fetchData();
  }, [token]);

  const fetchEventsOnly = async () => {
    try {
      const eventsRes = await axios.get(`${API_BASE_URL}/api/events/`);
      setEvents(eventsRes.data);
    } catch (err) {
      console.error("Failed to reload events:", err);
    }
  };

  const handleCreateEvent = async () => {
    try {
      if (!title || !description || !startTime || !endTime || !location) {
        alert("Please fill in all fields.");
        return;
      }

      if (new Date(endTime) <= new Date(startTime)) {
        alert("End time must be after start time.");
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/events/`,
        {
          title,
          description,
          start_time: startTime,
          end_time: endTime,
          location,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Event created successfully!");
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setFilter("all");
      fetchEventsOnly();
    } catch (err) {
      console.error(err);
      console.log(err.response?.data);
      alert("Failed to create event.");
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleString();
  };

  const formatStatus = (status) => {
    switch (status) {
      case "ongoing":
        return "Ongoing";
      case "coming":
        return "Coming";
      case "finished":
        return "Finished";
      default:
        return status;
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filter === "all") return true;
      return event.status === filter;
    });
  }, [events, filter]);

  const groupedEvents = useMemo(() => {
    const groups = {
      ongoing: [],
      coming: [],
      finished: [],
    };

    filteredEvents.forEach((event) => {
      if (groups[event.status]) {
        groups[event.status].push(event);
      }
    });

    return groups;
  }, [filteredEvents]);

  const renderEventCard = (event) => (
    <div key={event.id} className="event-card">
      <div className="event-card-header">
        <h3 className="event-title">{event.title}</h3>
        <span className={`event-status status-${event.status}`}>
          {formatStatus(event.status)}
        </span>
      </div>

      <p className="event-description">{event.description}</p>

      <div className="event-details">
        <p className="event-detail-item">
          <strong>Start:</strong> {formatDateTime(event.start_time)}
        </p>
        <p className="event-detail-item">
          <strong>End:</strong> {formatDateTime(event.end_time)}
        </p>
        <p className="event-detail-item">
          <strong>Location:</strong> {event.location}
        </p>
      </div>

      <div className="event-actions">
        <Link
          className="details-link"
          to={`/events/${event.id}`}
          state={{ from: "/events" }}
        >
          View Details
        </Link>
      </div>
    </div>
  );

  const renderSection = (title, items, status) => {
    if (items.length === 0) return null;

    return (
      <section className="events-section">
        <h3 className={`events-section-title ${status}`}>{title}</h3>
        <div className="events-list">
          {items.map((event) => renderEventCard(event))}
        </div>
      </section>
    );
  };

  return (
    <>
      <Navbar />

      <div className="events-page">
        <div className="page-header">
          <h2 className="page-title">Events</h2>
        </div>

        {currentUser?.is_staff === true && (
          <div className="create-event-card">
            <h3 className="section-title">Create Event</h3>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter event description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                className="form-input"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                className="form-input"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button className="primary-button" onClick={handleCreateEvent}>
              Create Event
            </button>
          </div>
        )}

        <div className="filter-bar">
          <label className="filter-label" htmlFor="event-filter">
            Filter by status
          </label>

          <select
            id="event-filter"
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="ongoing">Ongoing</option>
            <option value="coming">Coming</option>
            <option value="finished">Finished</option>
          </select>
        </div>

        {filteredEvents.length > 0 ? (
          <>
            {renderSection("Ongoing Events", groupedEvents.ongoing, "ongoing")}
            {renderSection("Coming Events", groupedEvents.coming, "coming")}
            {renderSection("Finished Events", groupedEvents.finished, "finished")}
          </>
        ) : (
          <div className="empty-state">
            <p>No events found for this filter.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Events;