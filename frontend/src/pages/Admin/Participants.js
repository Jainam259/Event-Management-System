// src/pages/Admin/Participants.js
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

const API_URL = "http://localhost:5000";

const AdminParticipants = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API_URL}/api/admin/participants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.ok ? await res.json() : [];
        setRegistrations(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!search) { setFiltered(registrations); return; }
    setFiltered(
      registrations.filter(
        (r) =>
          r.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.email?.toLowerCase().includes(search.toLowerCase()) ||
          r.eventId?.title?.toLowerCase().includes(search.toLowerCase()) ||
          r.organization?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, registrations]);

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  };

  const totalTickets = registrations.reduce((s, r) => s + (r.ticketCount || 1), 0);
  const uniqueEvents = new Set(registrations.map((r) => r.eventId?._id)).size;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="admin-logo-icon">🛡️</span>
          <span className="admin-logo-text">AdminPanel</span>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className="admin-nav-item"><span>📊</span> Dashboard</NavLink>
          <NavLink to="/admin/events" className="admin-nav-item"><span>🗓️</span> All Events</NavLink>
          <NavLink to="/admin/participants" className="admin-nav-item"><span>👥</span> Participants</NavLink>
          <NavLink to="/admin/analytics" className="admin-nav-item"><span>📈</span> Analytics</NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-profile-mini">
            <div className="admin-avatar-mini">A</div>
            <div>
              <div className="admin-role-label">Administrator</div>
              <div className="admin-role-sub">Super Admin</div>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}><span>🚪</span> Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1 className="admin-page-title">Participants</h1>
            <p className="admin-page-sub">All event registrations across the platform</p>
          </div>
        </header>

        {/* Stats */}
        <div className="admin-stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 24 }}>
          <div className="admin-stat-card admin-stat-blue">
            <div className="admin-stat-icon">🎟️</div>
            <div className="admin-stat-body">
              <div className="admin-stat-value">{registrations.length}</div>
              <div className="admin-stat-label">Total Registrations</div>
            </div>
          </div>
          <div className="admin-stat-card admin-stat-purple">
            <div className="admin-stat-icon">🗓️</div>
            <div className="admin-stat-body">
              <div className="admin-stat-value">{uniqueEvents}</div>
              <div className="admin-stat-label">Events with Registrations</div>
            </div>
          </div>
          <div className="admin-stat-card admin-stat-green">
            <div className="admin-stat-icon">👤</div>
            <div className="admin-stat-body">
              <div className="admin-stat-value">{totalTickets}</div>
              <div className="admin-stat-label">Total Tickets Booked</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="admin-toolbar" style={{ marginBottom: 16 }}>
          <div className="admin-search-wrap">
            <span>🔍</span>
            <input
              className="admin-search"
              placeholder="Search by name, email, event or organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="admin-count-badge">{filtered.length} results</span>
        </div>

        {/* Table */}
        <div className="admin-panel admin-panel-full">
          <table className="admin-table admin-table-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Organization</th>
                <th>Event</th>
                <th>Tickets</th>
                <th>Registered On</th>
                <th>Event Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="admin-table-empty">
                  <div className="admin-spinner-wrap"><div className="admin-spinner"></div> Loading…</div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="admin-table-empty">
                  {registrations.length === 0
                    ? "No registrations yet"
                    : "No results match your search"}
                </td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r._id} className="admin-table-row">
                  <td className="admin-td-num">{i + 1}</td>
                  <td className="admin-td-title">{r.name || "—"}</td>
                  <td style={{ fontSize: 12, color: "#9a9ab5" }}>{r.email || "—"}</td>
                  <td style={{ fontSize: 12 }}>{r.phone || "—"}</td>
                  <td style={{ fontSize: 12 }}>{r.organization || "—"}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {r.eventId?.isHidden && <span title="Hidden event" style={{ fontSize: 11 }}>🚫</span>}
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#e0e0f5" }}>
                        {r.eventId?.title || "—"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="admin-ticket-tag paid">{r.ticketCount || 1}</span>
                  </td>
                  <td style={{ fontSize: 12 }}>{formatDate(r.createdAt)}</td>
                  <td>
                    {r.eventId?.isHidden
                      ? <span className="vis-tag vis-hidden">🚫 Hidden</span>
                      : <span className="vis-tag vis-visible">👁 Visible</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminParticipants;