import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "./Dashboard.css";

const API_URL = "http://localhost:5000";

const Dashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";

  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, participants: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

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
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        const now = new Date();
        const upcoming = data.filter(
          (e) => e.status === "published" && new Date(e.startDate) > now
        );
        const totalRevenue = data.reduce(
          (sum, e) => sum + (e.ticketType === "Paid" ? (e.price || 0) * (e.capacity || 0) : 0), 0
        );
        const totalParticipants = data.reduce((sum, e) => sum + (e.capacity || 0), 0);

        setEvents(data);
        setStats({ total: data.length, upcoming: upcoming.length, participants: totalParticipants, revenue: totalRevenue });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return { month: "—", day: "—" };
    const d = new Date(dateStr);
    return { month: d.toLocaleString("en", { month: "short" }).toUpperCase(), day: d.getDate() };
  };

  const getStatusBadge = (event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    if (event.status === "draft") return { label: "Draft", cls: "pending" };
    if (now >= start && now <= end) return { label: "In Progress", cls: "progress" };
    if (now < start) return { label: "Scheduled", cls: "scheduled" };
    return { label: "Completed", cls: "completed" };
  };

  const getCategoryIcon = (cat) => {
    const icons = { Technology: "💻", Career: "🎯", Education: "📚", Social: "🎉", Sports: "⚽", Music: "🎵", Business: "💼", Health: "❤️", Art: "🎨" };
    return icons[cat] || "📌";
  };

  const getCreatorName = (ev) => {
    if (ev.createdBy && typeof ev.createdBy === "object" && ev.createdBy.name) return ev.createdBy.name;
    return "Unknown";
  };

  const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)} days ago`;
  };

  const avatarInitials = username.split(" ").map(n => n[0]).join("").toUpperCase();
  const dotColors = ["blue", "green", "pink", "blue", "green"];
  const displayEvents = events.slice(0, 4);

  return (
    <div className="dashboard-root">

      {/* ── Sidebar ─────────────────────────────── */}
      <aside className="db-sidebar">
        <div className="db-logo">
          <span className="db-logo-icon">✨</span>
          <span className="db-logo-text">EventManager</span>
        </div>
        <nav className="db-nav">
          <NavLink to="/dashboard"     className="db-nav-link"><span>📊</span> Dashboard</NavLink>
          <NavLink to="/create-event"  className="db-nav-link"><span>➕</span> Create Event</NavLink>
          <NavLink to="/manage-events" className="db-nav-link"><span>🗓️</span> Manage Events</NavLink>
          <NavLink to="/participants"  className="db-nav-link"><span>👥</span> Participants</NavLink>
          <NavLink to="/analytics"     className="db-nav-link"><span>📈</span> Analytics</NavLink>
          <NavLink to="/settings"      className="db-nav-link"><span>⚙️</span> Settings</NavLink>
        </nav>
        <div className="db-sidebar-footer">
          <button className="db-logout-btn" onClick={handleLogout}><span>🚪</span> Logout</button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────── */}
      <main className="db-main">

        {/* Header */}
        <header className="db-header">
          <div>
            <h1 className="db-title">Overview Dashboard</h1>
            <p className="db-subtitle">Welcome back, here is what's happening today.</p>
          </div>
          <div className="db-user">
            <div className="db-bell">🔔<span className="db-badge"></span></div>
            <div className="db-avatar">{avatarInitials}</div>
            <span className="db-username">{username}</span>
          </div>
        </header>

        {/* Stats */}
        <section className="db-stats">
          <div className="db-stat-card">
            <div className="db-stat-head"><span className="db-stat-label">Total Events</span><span className="db-stat-icon ic-blue">📅</span></div>
            <h2 className="db-stat-val c-blue">{loading ? "…" : stats.total}</h2>
            <p className="db-stat-trend up">↑ All time</p>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-head"><span className="db-stat-label">Upcoming</span><span className="db-stat-icon ic-purple">⏳</span></div>
            <h2 className="db-stat-val c-purple">{loading ? "…" : stats.upcoming}</h2>
            <p className="db-stat-trend flat">→ Scheduled events</p>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-head"><span className="db-stat-label">Total Capacity</span><span className="db-stat-icon ic-green">👥</span></div>
            <h2 className="db-stat-val c-green">{loading ? "…" : stats.participants.toLocaleString()}</h2>
            <p className="db-stat-trend up">↑ Across all events</p>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-head"><span className="db-stat-label">Est. Revenue</span><span className="db-stat-icon ic-pink">💳</span></div>
            <h2 className="db-stat-val c-pink">{loading ? "…" : `₹${stats.revenue.toLocaleString()}`}</h2>
            <p className="db-stat-trend up">↑ From paid events</p>
          </div>
        </section>

        {/* Bottom */}
        <section className="db-bottom">

          {/* ── All Events ── */}
          <div className="db-panel">
            <div className="db-panel-head">
              <h3>All Events</h3>
              <button className="db-view-all" onClick={() => navigate("/manage-events")}>View All →</button>
            </div>

            {loading ? (
              <div className="db-ev-loading"><div className="db-spin"></div><span>Loading events…</span></div>
            ) : displayEvents.length === 0 ? (
              <div className="db-no-events">
                <div className="db-no-icon">🗓️</div>
                <p>No events yet.</p>
                <button className="db-create-btn" onClick={() => navigate("/create-event")}>➕ Create First Event</button>
              </div>
            ) : (
              <div className="db-event-list">
                {displayEvents.map((ev) => {
                  const { month, day } = formatDate(ev.startDate);
                  const { label, cls } = getStatusBadge(ev);
                  const creator = getCreatorName(ev);
                  const isPaid = ev.ticketType === "Paid";

                  return (
                    <div className="db-event-card" key={ev._id} onClick={() => navigate(`/events/${ev._id}`)}>

                      {/* Date box */}
                      <div className="db-date-box">
                        <span className="db-month">{month}</span>
                        <span className="db-day">{day}</span>
                      </div>

                      {/* Main info */}
                      <div className="db-event-info">
                        <div className="db-ev-title-row">
                          <h4 className="db-ev-title">{ev.title}</h4>
                        </div>

                        <div className="db-ev-meta">
                          <span className="db-ev-venue">
                            {ev.format === "Virtual" ? "🌐 Virtual" : `📍 ${ev.venueName || ev.address || "TBD"}`}
                          </span>
                          <span className="db-ev-sep">·</span>
                          <span className="db-ev-capacity">👥 {(ev.capacity || 0).toLocaleString()} seats</span>
                          {ev.startDate && ev.endDate && (
                            <>
                              <span className="db-ev-sep">·</span>
                              <span className="db-ev-time-range">
                                🕐 {new Date(ev.startDate).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="db-ev-tags">
                          {ev.category && (
                            <span className="db-tag db-tag-cat">{getCategoryIcon(ev.category)} {ev.category}</span>
                          )}
                          {ev.format && (
                            <span className="db-tag db-tag-fmt">{ev.format}</span>
                          )}
                          <span className={`db-tag ${isPaid ? "db-tag-paid" : "db-tag-free"}`}>
                            {isPaid ? `💳 ₹${ev.price || 0}` : "🆓 Free"}
                          </span>
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="db-ev-right">
                        <span className={`db-badge-status ${cls}`}>{label}</span>
                        <div className="db-ev-creator">
                          <div className="db-ev-avatar">{getInitials(creator)}</div>
                          <span className="db-ev-creator-name">{creator}</span>
                        </div>
                        <span className="db-ev-ago">{timeAgo(ev.createdAt)}</span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="db-panel">
            <div className="db-panel-head"><h3>Recent Activity</h3></div>
            <div className="db-timeline">
              {loading ? (
                <p style={{ color: "#9a9ab5" }}>Loading…</p>
              ) : events.length === 0 ? (
                <p style={{ color: "#6b6b8a", fontSize: "14px" }}>No activity yet. Create an event to get started!</p>
              ) : (
                events.slice(0, 5).map((ev, i) => (
                  <div className="db-timeline-item" key={ev._id}>
                    <div className={`db-dot ${dotColors[i % dotColors.length]}`}></div>
                    <div className="db-timeline-content">
                      <p><strong>{getCreatorName(ev)}</strong> created <em>{ev.title}</em></p>
                      <span className="db-time">{timeAgo(ev.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </section>
      </main>
    </div>
  );
};

export default Dashboard;