import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "./Participants.css";

const API_URL = "http://localhost:5000";

const Participants = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";

  const [participants, setParticipants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [stats, setStats] = useState({ totalParticipants: 0, totalEvents: 0, totalCapacity: 0, activeUsers: 0, totalTicketsBooked: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selected, setSelected] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/participants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setParticipants(data.participants || []);
        setFiltered(data.participants || []);
        setStats(data.stats || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = participants;
    if (search) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterType === "Active")   result = result.filter((p) => (p.ticketsBooked || 0) > 0);
    if (filterType === "Inactive") result = result.filter((p) => (p.ticketsBooked || 0) === 0);
    setFiltered(result);
  }, [search, filterType, participants]);

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  const getAvatarColor = (name) => {
    const colors = [
      "linear-gradient(135deg,#7c3aed,#9333ea)",
      "linear-gradient(135deg,#0ea5e9,#6366f1)",
      "linear-gradient(135deg,#ec4899,#f43f5e)",
      "linear-gradient(135deg,#10b981,#059669)",
      "linear-gradient(135deg,#f59e0b,#ef4444)",
      "linear-gradient(135deg,#8b5cf6,#06b6d4)",
    ];
    const idx = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[idx];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "—";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  };

  const maxTickets = Math.max(...participants.map((p) => p.ticketsBooked || 0), 1);
  const avatarInitials = username.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="pp-layout">
      {/* Sidebar */}
      <aside className="pp-sidebar">
        <div className="pp-logo">
          <span className="pp-logo-icon">✨</span>
          <span className="pp-logo-text">EventManager</span>
        </div>
        <nav className="pp-nav">
          <NavLink to="/dashboard"     className="pp-nav-item"><span>📊</span> Dashboard</NavLink>
          <NavLink to="/create-event"  className="pp-nav-item"><span>➕</span> Create Event</NavLink>
          <NavLink to="/manage-events" className="pp-nav-item"><span>🗓️</span> Manage Events</NavLink>
          <NavLink to="/participants"  className="pp-nav-item active-link"><span>👥</span> Participants</NavLink>
          <NavLink to="/analytics"     className="pp-nav-item"><span>📈</span> Analytics</NavLink>
          <NavLink to="/settings"      className="pp-nav-item"><span>⚙️</span> Settings</NavLink>
        </nav>
        <div className="pp-sidebar-footer">
          <button className="pp-logout-btn" onClick={handleLogout}><span>🚪</span> Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="pp-main">
        {/* Header */}
        <header className="pp-header">
          <div>
            <h1 className="pp-title">Participants</h1>
            <p className="pp-subtitle">All registered members and their booking activity.</p>
          </div>
          <div className="pp-user-info">
            <div className="pp-bell">🔔</div>
            <div className="pp-avatar-top">{avatarInitials}</div>
            <span className="pp-username">{username}</span>
          </div>
        </header>

        {/* Stats */}
        <div className="pp-stats-grid">
          <div className="pp-stat-card pp-stat-purple">
            <div className="pp-stat-icon-wrap pp-icon-purple">👥</div>
            <div><div className="pp-stat-num">{loading ? "…" : stats.totalParticipants}</div><div className="pp-stat-label">Total Members</div></div>
          </div>
          <div className="pp-stat-card pp-stat-blue">
            <div className="pp-stat-icon-wrap pp-icon-blue">⚡</div>
            <div><div className="pp-stat-num">{loading ? "…" : stats.activeUsers}</div><div className="pp-stat-label">Active Bookers</div></div>
          </div>
          <div className="pp-stat-card pp-stat-green">
            <div className="pp-stat-icon-wrap pp-icon-green">📅</div>
            <div><div className="pp-stat-num">{loading ? "…" : stats.totalEvents}</div><div className="pp-stat-label">Total Events</div></div>
          </div>
          <div className="pp-stat-card pp-stat-pink">
            <div className="pp-stat-icon-wrap pp-icon-pink">🎟️</div>
            <div><div className="pp-stat-num">{loading ? "…" : (stats.totalTicketsBooked || 0)}</div><div className="pp-stat-label">Tickets Booked</div></div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="pp-toolbar">
          <div className="pp-search-wrap">
            <span className="pp-search-icon">🔍</span>
            <input
              className="pp-search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && <button className="pp-search-clear" onClick={() => setSearch("")}>✕</button>}
          </div>
          <div className="pp-filters">
            {["All", "Active", "Inactive"].map((f) => (
              <button key={f} className={`pp-filter-btn ${filterType === f ? "active" : ""}`} onClick={() => setFilterType(f)}>
                {f} {f !== "All" && <span className="pp-filter-count">{participants.filter(p => f === "Active" ? (p.ticketsBooked||0) > 0 : (p.ticketsBooked||0) === 0).length}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="pp-loading"><div className="pp-spinner"></div><p>Loading participants...</p></div>
        ) : filtered.length === 0 ? (
          <div className="pp-empty">
            <div className="pp-empty-icon">👥</div>
            <h3>No participants found</h3>
            <p>{search ? "Try a different search term" : "No members match this filter"}</p>
          </div>
        ) : (
          <div className="pp-table-wrap">
            <table className="pp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Events Registered</th>
                  <th>Tickets Booked</th>
                  <th>Upcoming</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const tickets = p.ticketsBooked || 0;
                  const barWidth = maxTickets > 0 ? Math.round((tickets / maxTickets) * 100) : 0;
                  const isActive = tickets > 0;

                  return (
                    <tr key={p._id} className="pp-row" style={{ animationDelay: `${i * 0.04}s` }}>
                      <td className="pp-num">{i + 1}</td>

                      {/* Member */}
                      <td>
                        <div className="pp-member">
                          <div className="pp-avatar-sm" style={{ background: getAvatarColor(p.name) }}>
                            {getInitials(p.name)}
                          </div>
                          <div>
                            <div className="pp-name">{p.name}</div>
                            {p.recentEvent && <div className="pp-recent-event">📌 {p.recentEvent}</div>}
                          </div>
                        </div>
                      </td>

                      <td className="pp-email">{p.email}</td>
                      <td className="pp-date">{formatDate(p.joinedAt)}</td>

                      {/* Events Registered */}
                      <td>
                        <span className="pp-count-badge">{p.eventsRegistered || 0}</span>
                      </td>

                      {/* ⭐ Tickets Booked - big & clear */}
                      <td>
                        <div className="pp-tickets-wrap">
                          <div className="pp-tickets-top">
                            <span className={`pp-tickets-big ${isActive ? "pp-tickets-active" : "pp-tickets-zero"}`}>
                              {tickets}
                            </span>
                            <span className="pp-tickets-unit">{tickets === 1 ? "ticket" : "tickets"}</span>
                          </div>
                          <div className="pp-mini-bar-track">
                            <div
                              className={`pp-mini-bar-fill ${isActive ? "pp-bar-active" : ""}`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Upcoming */}
                      <td>
                        <span className={`pp-upcoming ${(p.upcomingEvents || 0) > 0 ? "has-upcoming" : ""}`}>
                          {p.upcomingEvents || 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`pp-status-badge ${isActive ? "active" : "inactive"}`}>
                          {isActive ? "✦ Active" : "Inactive"}
                        </span>
                      </td>

                      {/* View */}
                      <td>
                        <button className="pp-view-btn" onClick={() => setSelected(p)}>View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="pp-count">
            Showing <strong>{filtered.length}</strong> of <strong>{participants.length}</strong> participants
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selected && (
        <div className="pp-modal-overlay" onClick={() => setSelected(null)}>
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="pp-modal-close" onClick={() => setSelected(null)}>✕</button>

            <div className="pp-modal-avatar" style={{ background: getAvatarColor(selected.name) }}>
              {getInitials(selected.name)}
            </div>
            <h2 className="pp-modal-name">{selected.name}</h2>
            <p className="pp-modal-email">{selected.email}</p>

            <span className={`pp-status-badge large ${(selected.ticketsBooked || 0) > 0 ? "active" : "inactive"}`}>
              {(selected.ticketsBooked || 0) > 0 ? "✦ Active Participant" : "Inactive Member"}
            </span>

            {/* Stats row */}
            <div className="pp-modal-stats">
              <div className="pp-modal-stat">
                <div className="pp-modal-stat-num">{selected.eventsRegistered || 0}</div>
                <div className="pp-modal-stat-label">Events</div>
              </div>
              <div className="pp-modal-stat">
                <div className="pp-modal-stat-num pp-modal-tickets-num">{selected.ticketsBooked || 0}</div>
                <div className="pp-modal-stat-label">Tickets</div>
              </div>
              <div className="pp-modal-stat">
                <div className="pp-modal-stat-num">{selected.upcomingEvents || 0}</div>
                <div className="pp-modal-stat-label">Upcoming</div>
              </div>
            </div>

            {/* ⭐ Ticket breakdown */}
            {(selected.registrations || []).length > 0 ? (
              <div className="pp-modal-regs">
                <div className="pp-modal-regs-title">🎟️ Booking Breakdown</div>
                {selected.registrations.map((reg, idx) => (
                  <div key={idx} className="pp-modal-reg-item">
                    <div className="pp-modal-reg-left">
                      <span className="pp-modal-reg-dot" />
                      <span className="pp-modal-reg-name">{reg.eventTitle}</span>
                    </div>
                    <div className="pp-modal-reg-right">
                      <div className="pp-modal-ticket-pills">
                        {Array.from({ length: Math.min(reg.ticketCount, 8) }).map((_, ti) => (
                          <span key={ti} className="pp-ticket-pill">🎟️</span>
                        ))}
                        {reg.ticketCount > 8 && <span className="pp-ticket-more">+{reg.ticketCount - 8}</span>}
                      </div>
                      <span className="pp-modal-reg-count">{reg.ticketCount} seat{reg.ticketCount !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                ))}
                <div className="pp-modal-reg-total">
                  <span>Total Seats Booked</span>
                  <strong>{selected.ticketsBooked}</strong>
                </div>
              </div>
            ) : (
              <div className="pp-modal-no-bookings">
                <span>🎫</span>
                <p>No event bookings yet</p>
              </div>
            )}

            {/* Info */}
            <div className="pp-modal-info">
              <div className="pp-modal-info-row">
                <span className="pp-modal-info-label">📅 Joined</span>
                <span>{formatDate(selected.joinedAt)}</span>
              </div>
              {selected.recentEvent && (
                <div className="pp-modal-info-row">
                  <span className="pp-modal-info-label">🗓 Created</span>
                  <span>{selected.recentEvent}</span>
                </div>
              )}
              <div className="pp-modal-info-row">
                <span className="pp-modal-info-label">🕐 Member Since</span>
                <span>{timeAgo(selected.joinedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Participants;