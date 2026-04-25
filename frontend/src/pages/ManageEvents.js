import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "./ManageEvents.css";

const API_URL = "http://localhost:5000";

const ManageEvents = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";

  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [deleteId, setDeleteId] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEvents(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Search + filter
  useEffect(() => {
    let result = events;
    if (search) {
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          (e.venueName && e.venueName.toLowerCase().includes(search.toLowerCase())) ||
          (e.category && e.category.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (filterStatus !== "All") {
      result = result.filter((e) => getStatusLabel(e) === filterStatus);
    }
    setFiltered(result);
  }, [search, filterStatus, events]);

  const getStatusLabel = (ev) => {
    const now = new Date();
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);
    if (ev.status === "draft") return "Draft";
    if (now >= start && now <= end) return "In Progress";
    if (now < start) return "Scheduled";
    return "Completed";
  };

  const getStatusClass = (label) => {
    switch (label) {
      case "In Progress": return "badge-progress";
      case "Scheduled": return "badge-scheduled";
      case "Draft": return "badge-draft";
      case "Completed": return "badge-completed";
      default: return "";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const getCreatorName = (ev) => {
    if (ev.createdBy && typeof ev.createdBy === "object" && ev.createdBy.name) {
      return ev.createdBy.name;
    }
    return "Unknown";
  };

  // ⭐ check if logged-in user is the creator of this event
  const isMyEvent = (ev) => {
    return getCreatorName(ev).toLowerCase() === username.toLowerCase();
  };

  // ⭐ check if event is completed (end date has passed)
  const isEventCompleted = (ev) => {
    return getStatusLabel(ev) === "Completed";
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const updated = events.filter((e) => e._id !== id);
        setEvents(updated);
        setDeleteId(null);
      } else {
        alert(data.message || "Cannot delete this event");
        setDeleteId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const avatarInitials = username.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="me-layout">
      {/* Sidebar */}
      <aside className="me-sidebar">
        <div className="me-logo">
          <span className="me-logo-icon">✨</span>
          <span className="me-logo-text">EventManager</span>
        </div>
        <nav className="me-nav">
          <NavLink to="/dashboard" className="me-nav-item"><span>📊</span> Dashboard</NavLink>
          <NavLink to="/create-event" className="me-nav-item"><span>➕</span> Create Event</NavLink>
          <NavLink to="/manage-events" className="me-nav-item active-link"><span>🗓️</span> Manage Events</NavLink>
          <NavLink to="/participants" className="me-nav-item"><span>👥</span> Participants</NavLink>
          <NavLink to="/analytics" className="me-nav-item"><span>📈</span> Analytics</NavLink>
          <NavLink to="/settings" className="me-nav-item"><span>⚙️</span> Settings</NavLink>
        </nav>
        <div className="me-sidebar-footer">
          <button className="me-logout-btn" onClick={handleLogout}><span>🚪</span> Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="me-main">
        <header className="me-header">
          <div>
            <h1 className="me-title">Manage Events</h1>
            <p className="me-subtitle">Browse, search and manage all events.</p>
          </div>
          <div className="me-user-info">
            <div className="me-bell">🔔</div>
            <div className="me-avatar">{avatarInitials}</div>
            <span className="me-username">{username}</span>
          </div>
        </header>

        {/* Toolbar */}
        <div className="me-toolbar">
          <div className="me-search-wrap">
            <span className="me-search-icon">🔍</span>
            <input
              className="me-search"
              placeholder="Search by title, venue or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="me-filters">
            {["All", "Scheduled", "In Progress", "Completed", "Draft"].map((s) => (
              <button
                key={s}
                className={`me-filter-btn ${filterStatus === s ? "active" : ""}`}
                onClick={() => setFilterStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <button className="me-create-btn" onClick={() => navigate("/create-event")}>
            ➕ New Event
          </button>
        </div>

        {/* Stats row */}
        <div className="me-stats-row">
          <div className="me-stat"><span className="me-stat-num">{events.length}</span><span className="me-stat-label">Total</span></div>
          <div className="me-stat"><span className="me-stat-num">{events.filter(e => getStatusLabel(e) === "Scheduled").length}</span><span className="me-stat-label">Scheduled</span></div>
          <div className="me-stat"><span className="me-stat-num">{events.filter(e => getStatusLabel(e) === "In Progress").length}</span><span className="me-stat-label">Live</span></div>
          <div className="me-stat"><span className="me-stat-num">{events.filter(e => getStatusLabel(e) === "Completed").length}</span><span className="me-stat-label">Completed</span></div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="me-loading">
            <div className="me-spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="me-empty">
            <div className="me-empty-icon">🗓️</div>
            <h3>No events found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="me-create-btn" onClick={() => navigate("/create-event")}>
              ➕ Create Event
            </button>
          </div>
        ) : (
          <div className="me-grid">
            {filtered.map((ev, i) => {
              const statusLabel = getStatusLabel(ev);
              const statusClass = getStatusClass(statusLabel);
              const canDelete = isMyEvent(ev);
              const completed = isEventCompleted(ev); // ⭐ is event over?

              return (
                <div className="me-card" key={ev._id} style={{ animationDelay: `${i * 0.06}s` }}>
                  {/* Banner */}
                  <div className="me-card-banner">
                    {ev.banner ? (
                      <img src={`${API_URL}${ev.banner}`} alt={ev.title} className="me-banner-img" />
                    ) : (
                      <div className="me-banner-placeholder">
                        <span>{ev.category || "Event"}</span>
                      </div>
                    )}
                    <span className={`me-badge ${statusClass}`}>{statusLabel}</span>
                    {ev.ticketType === "Paid" ? (
                      <span className="me-price-tag">${ev.price}</span>
                    ) : (
                      <span className="me-free-tag">Free</span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="me-card-body">
                    <div className="me-card-category">{ev.category || "General"}</div>
                    <h3 className="me-card-title">{ev.title}</h3>
                    <div className="me-card-meta">
                      <div className="me-meta-item">
                        <span className="me-meta-icon">📅</span>
                        <span>{formatDate(ev.startDate)}</span>
                      </div>
                      <div className="me-meta-item">
                        <span className="me-meta-icon">{ev.format === "Virtual" ? "🌐" : "📍"}</span>
                        <span>{ev.format === "Virtual" ? "Virtual" : ev.venueName || ev.address || "TBD"}</span>
                      </div>
                      <div className="me-meta-item">
                        <span className="me-meta-icon">👥</span>
                        <span>{ev.capacity ? `${ev.capacity} seats` : "Unlimited"}</span>
                      </div>
                      <div className="me-meta-item">
                        <span className="me-meta-icon">👤</span>
                        <span>
                          By {getCreatorName(ev)}
                          {canDelete && (
                            <span className="me-my-tag">You</span>
                          )}
                        </span>
                      </div>
                    </div>
                    {ev.description && (
                      <p
                        className="me-card-desc"
                        dangerouslySetInnerHTML={{
                          __html: ev.description.length > 80
                            ? ev.description.substring(0, 80) + "..."
                            : ev.description,
                        }}
                      />
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="me-card-footer">
                    {/* ⭐ Register Now button — disabled if event is Completed */}
                    <button
                      className={`me-btn-register ${completed ? "me-btn-register-disabled" : ""}`}
                      disabled={completed}
                      onClick={() => !completed && navigate(`/events/${ev._id}`)}
                      title={completed ? "Registration closed — event has ended" : "Register for this event"}
                    >
                      {completed ? "Registration Closed" : "Register Now"}
                    </button>

                    <button className="me-btn-view" onClick={() => navigate(`/events/${ev._id}`)}>
                      View
                    </button>

                    {/* ⭐ Delete button only shows for event creator */}
                    {canDelete ? (
                      <button
                        className="me-btn-delete"
                        onClick={() => setDeleteId(ev._id)}
                      >
                        🗑️ Delete
                      </button>
                    ) : (
                      <button className="me-btn-delete-disabled" disabled>
                        🔒 Protected
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="me-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="me-modal" onClick={(e) => e.stopPropagation()}>
            <div className="me-modal-icon">🗑️</div>
            <h3>Delete Event?</h3>
            <p>This action cannot be undone.</p>
            <div className="me-modal-actions">
              <button className="me-modal-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="me-modal-confirm" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;