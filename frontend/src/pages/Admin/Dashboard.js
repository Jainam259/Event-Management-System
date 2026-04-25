import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

const API_URL = "http://localhost:5000";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, events: 0, registrations: 0, revenue: 0 });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [emailStats, setEmailStats] = useState({ total: 0, sent: 0, failed: 0 }); // ⭐ NEW
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = { Authorization: `Bearer ${token}` };

        const [eventsRes, usersRes, regsRes, emailRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/events`,       { headers }),
          fetch(`${API_URL}/api/admin/users`,        { headers }),
          fetch(`${API_URL}/api/admin/registrations`,{ headers }),
          fetch(`${API_URL}/api/admin/email-logs`,   { headers }), // ⭐ NEW
        ]);

        const events = eventsRes.ok  ? await eventsRes.json()  : [];
        const users  = usersRes.ok   ? await usersRes.json()   : [];
        const regs   = regsRes.ok    ? await regsRes.json()    : [];
        const emails = emailRes.ok   ? await emailRes.json()   : { stats: { total:0, sent:0, failed:0 } }; // ⭐

        const revenue = events.reduce(
          (sum, e) => sum + (e.ticketType === "Paid" ? (e.price || 0) * (e.capacity || 0) : 0), 0
        );

        setStats({ users: users.length, events: events.length, registrations: regs.length, revenue });
        setRecentEvents(events.slice(0, 5));
        setRecentUsers(users.slice(0, 5));
        setEmailStats(emails.stats || { total: 0, sent: 0, failed: 0 }); // ⭐
      } catch (err) {
        console.error("Admin fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusLabel = (ev) => {
    const now   = new Date();
    const start = new Date(ev.startDate);
    const end   = new Date(ev.endDate);
    if (ev.status === "draft")    return { label: "Draft",     cls: "draft" };
    if (now >= start && now <= end) return { label: "Live",    cls: "live" };
    if (now < start)              return { label: "Scheduled", cls: "scheduled" };
    return { label: "Completed", cls: "completed" };
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="admin-layout">

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="admin-logo-icon">🛡️</span>
          <span className="admin-logo-text">AdminPanel</span>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin/dashboard"    className="admin-nav-item"><span>📊</span> Dashboard</NavLink>
          <NavLink to="/admin/events"       className="admin-nav-item"><span>🗓️</span> All Events</NavLink>
          <NavLink to="/admin/participants" className="admin-nav-item"><span>👥</span> Participants</NavLink>
          <NavLink to="/admin/analytics"    className="admin-nav-item"><span>📈</span> Analytics</NavLink>

          {/* ⭐ Email Logs link */}
          <NavLink to="/admin/email-logs" className="admin-nav-item">
            <span>📧</span> Email Logs
            {emailStats.failed > 0 && (
              <span style={{
                marginLeft: "auto",
                background: "rgba(239,68,68,0.2)",
                color: "#f87171",
                fontSize: "10px",
                fontWeight: 700,
                padding: "1px 7px",
                borderRadius: "20px",
              }}>
                {emailStats.failed} failed
              </span>
            )}
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-profile-mini">
            <div className="admin-avatar-mini">A</div>
            <div>
              <div className="admin-role-label">Administrator</div>
              <div className="admin-role-sub">Super Admin</div>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1 className="admin-page-title">Admin Dashboard</h1>
            <p className="admin-page-sub">Full system overview & control center</p>
          </div>
          <div className="admin-header-right">
            <span className="admin-live-badge">🟢 Live</span>
          </div>
        </header>

        {/* Stats */}
        <div className="admin-stats-grid">
          {[
            { label: "Total Users",    value: stats.users,                       icon: "👤",  color: "blue",   sub: "Registered accounts" },
            { label: "Total Events",   value: stats.events,                      icon: "🗓️", color: "purple", sub: "All time" },
            { label: "Registrations",  value: stats.registrations,               icon: "🎟️", color: "green",  sub: "Event sign-ups" },
            { label: "Est. Revenue",   value: `₹${stats.revenue.toLocaleString()}`, icon: "💰", color: "amber",  sub: "From paid events" },
          ].map((s) => (
            <div className={`admin-stat-card admin-stat-${s.color}`} key={s.label}>
              <div className="admin-stat-icon">{s.icon}</div>
              <div className="admin-stat-body">
                <div className="admin-stat-value">{loading ? "…" : s.value}</div>
                <div className="admin-stat-label">{s.label}</div>
                <div className="admin-stat-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ⭐ Email Summary Banner */}
        <div style={{
          background: emailStats.failed > 0
            ? "rgba(239,68,68,0.07)"
            : "rgba(16,185,129,0.07)",
          border: `1px solid ${emailStats.failed > 0
            ? "rgba(239,68,68,0.2)"
            : "rgba(16,185,129,0.2)"}`,
          borderRadius: 14,
          padding: "14px 20px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 20 }}>📧</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e0e0f5" }}>
                Email Reminders
              </div>
              <div style={{ fontSize: 12, color: "#9a9ab5", marginTop: 2 }}>
                {loading ? "Loading…" : `${emailStats.total} total · ${emailStats.sent} sent · ${emailStats.failed} failed`}
              </div>
            </div>
            {/* Status pills */}
            {!loading && (
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                  ✅ {emailStats.sent} Sent
                </span>
                {emailStats.failed > 0 && (
                  <span style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                    ❌ {emailStats.failed} Failed
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/admin/email-logs")}
            style={{
              padding: "8px 16px", borderRadius: 10,
              border: "1px solid rgba(124,58,237,0.3)",
              background: "rgba(124,58,237,0.1)",
              color: "#c4b5fd", fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            View All Logs →
          </button>
        </div>

        {/* Bottom Grid */}
        <div className="admin-bottom-grid">
          {/* Recent Events */}
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3>Recent Events</h3>
              <button className="admin-view-btn" onClick={() => navigate("/admin/events")}>View All →</button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Creator</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="admin-table-empty">Loading…</td></tr>
                ) : recentEvents.length === 0 ? (
                  <tr><td colSpan={4} className="admin-table-empty">No events yet</td></tr>
                ) : recentEvents.map((ev) => {
                  const { label, cls } = getStatusLabel(ev);
                  const creator = ev.createdBy?.name || "Unknown";
                  return (
                    <tr key={ev._id} onClick={() => navigate(`/events/${ev._id}`)} className="admin-table-row">
                      <td className="admin-td-title">{ev.title}</td>
                      <td>{formatDate(ev.startDate)}</td>
                      <td>{creator}</td>
                      <td><span className={`admin-badge admin-badge-${cls}`}>{label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Recent Users */}
          <div className="admin-panel">
            <div className="admin-panel-head">
              <h3>Recent Users</h3>
            </div>
            <div className="admin-user-list">
              {loading ? (
                <p className="admin-empty-msg">Loading…</p>
              ) : recentUsers.length === 0 ? (
                <p className="admin-empty-msg">No users found</p>
              ) : recentUsers.map((u, i) => (
                <div className="admin-user-row" key={u._id || i}>
                  <div className="admin-user-avatar">
                    {(u.name || u.email || "U")[0].toUpperCase()}
                  </div>
                  <div className="admin-user-info">
                    <div className="admin-user-name">{u.name || "—"}</div>
                    <div className="admin-user-email">{u.email}</div>
                  </div>
                  <span className={`admin-role-tag ${u.role === "admin" ? "role-admin" : "role-user"}`}>
                    {u.role || "user"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;