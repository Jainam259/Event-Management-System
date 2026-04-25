// src/pages/Admin/ManageEvents.js
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

const API_URL = "http://localhost:5000";

const AdminManageEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterVisibility, setFilterVisibility] = useState("All"); // All | Visible | Hidden
  const [actionModal, setActionModal] = useState(null); // { type: 'hide'|'restore'|'delete', event }
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/admin/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.ok ? await res.json() : [];
      setEvents(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = events;
    if (search) {
      result = result.filter(
        (e) =>
          e.title?.toLowerCase().includes(search.toLowerCase()) ||
          e.category?.toLowerCase().includes(search.toLowerCase()) ||
          e.createdBy?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterStatus !== "All") {
      result = result.filter((e) => getStatusLabel(e).label === filterStatus);
    }
    if (filterVisibility === "Visible") {
      result = result.filter((e) => !e.isHidden);
    } else if (filterVisibility === "Hidden") {
      result = result.filter((e) => e.isHidden);
    }
    setFiltered(result);
  }, [search, filterStatus, filterVisibility, events]);

  const getStatusLabel = (ev) => {
    const now = new Date();
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);
    if (ev.status === "draft") return { label: "Draft", cls: "draft" };
    if (now >= start && now <= end) return { label: "Live", cls: "live" };
    if (now < start) return { label: "Scheduled", cls: "scheduled" };
    return { label: "Completed", cls: "completed" };
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  };

  const handleHide = async () => {
    if (!actionModal) return;
    setProcessing(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/admin/events/${actionModal.event._id}/hide`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) => e._id === actionModal.event._id ? { ...e, isHidden: true } : e)
        );
        showToast("✅ Event hidden from frontend. Data still in database.");
      } else {
        const d = await res.json();
        showToast(d.message || "Failed", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setProcessing(false);
      setActionModal(null);
    }
  };

  const handleRestore = async () => {
    if (!actionModal) return;
    setProcessing(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/admin/events/${actionModal.event._id}/unhide`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) => e._id === actionModal.event._id ? { ...e, isHidden: false } : e)
        );
        showToast("✅ Event restored and visible on frontend.");
      } else {
        const d = await res.json();
        showToast(d.message || "Failed", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setProcessing(false);
      setActionModal(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!actionModal) return;
    setProcessing(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/admin/events/${actionModal.event._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e._id !== actionModal.event._id));
        showToast("🗑️ Event permanently deleted from database.");
      } else {
        const d = await res.json();
        showToast(d.message || "Failed", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setProcessing(false);
      setActionModal(null);
    }
  };

  const counts = {
    All: events.length,
    Visible: events.filter((e) => !e.isHidden).length,
    Hidden: events.filter((e) => e.isHidden).length,
  };

  const statusCounts = {
    All: events.length,
    Scheduled: events.filter((e) => getStatusLabel(e).label === "Scheduled").length,
    Live: events.filter((e) => getStatusLabel(e).label === "Live").length,
    Completed: events.filter((e) => getStatusLabel(e).label === "Completed").length,
    Draft: events.filter((e) => getStatusLabel(e).label === "Draft").length,
  };

  return (
    <div className="admin-layout">
      {/* Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type === "error" ? "admin-toast-error" : ""}`}>
          {toast.msg}
        </div>
      )}

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
            <h1 className="admin-page-title">All Events</h1>
            <p className="admin-page-sub">Manage visibility — data is never lost when hidden</p>
          </div>
          <div className="admin-header-right">
            <span className="admin-count-badge">{events.length} Total</span>
            <span className="admin-vis-badge">👁 {counts.Visible} Visible</span>
            <span className="admin-hidden-badge">🚫 {counts.Hidden} Hidden</span>
          </div>
        </header>

        {/* Legend */}
        <div className="admin-legend">
          <div className="legend-item">
            <span className="legend-dot dot-green"></span>
            <span><strong>Hide</strong> — removes from frontend, data stays in DB</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dot-blue"></span>
            <span><strong>Restore</strong> — makes event visible again</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dot-red"></span>
            <span><strong>Perm. Delete</strong> — removes from DB permanently</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="admin-toolbar">
          <div className="admin-search-wrap">
            <span>🔍</span>
            <input
              className="admin-search"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="admin-filters">
            {["All", "Visible", "Hidden"].map((v) => (
              <button
                key={v}
                className={`admin-filter-btn ${filterVisibility === v ? "active" : ""}`}
                onClick={() => setFilterVisibility(v)}
              >
                {v} <span className="admin-filter-count">{counts[v]}</span>
              </button>
            ))}
            <div className="admin-divider" />
            {["All", "Scheduled", "Live", "Completed", "Draft"].map((s) => (
              <button
                key={s}
                className={`admin-filter-btn ${filterStatus === s ? "active" : ""}`}
                onClick={() => setFilterStatus(s)}
              >
                {s} <span className="admin-filter-count">{statusCounts[s] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="admin-panel admin-panel-full">
          <table className="admin-table admin-table-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Event Title</th>
                <th>Category</th>
                <th>Creator</th>
                <th>Start Date</th>
                <th>Tickets</th>
                <th>Status</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="admin-table-empty">
                  <div className="admin-spinner-wrap"><div className="admin-spinner"></div> Loading…</div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="admin-table-empty">No events found</td></tr>
              ) : filtered.map((ev, i) => {
                const { label, cls } = getStatusLabel(ev);
                return (
                  <tr key={ev._id} className={`admin-table-row ${ev.isHidden ? "row-hidden" : ""}`}>
                    <td className="admin-td-num">{i + 1}</td>
                    <td className="admin-td-title">
                      {ev.isHidden && <span className="hidden-flag">🚫 </span>}
                      {ev.title}
                    </td>
                    <td><span className="admin-category-tag">{ev.category || "General"}</span></td>
                    <td>{ev.createdBy?.name || "Unknown"}</td>
                    <td>{formatDate(ev.startDate)}</td>
                    <td>
                      <span className={`admin-ticket-tag ${ev.ticketType === "Paid" ? "paid" : "free"}`}>
                        {ev.ticketType === "Paid" ? `$${ev.price}` : "Free"}
                      </span>
                    </td>
                    <td><span className={`admin-badge admin-badge-${cls}`}>{label}</span></td>
                    <td>
                      {ev.isHidden
                        ? <span className="vis-tag vis-hidden">🚫 Hidden</span>
                        : <span className="vis-tag vis-visible">👁 Visible</span>
                      }
                    </td>
                    <td>
                      <div className="admin-action-btns">
                        <button className="admin-btn-view" onClick={() => navigate(`/events/${ev._id}`)}>View</button>
                        {ev.isHidden ? (
                          <button className="admin-btn-restore" onClick={() => setActionModal({ type: "restore", event: ev })}>
                            ↩ Restore
                          </button>
                        ) : (
                          <button className="admin-btn-hide" onClick={() => setActionModal({ type: "hide", event: ev })}>
                            🚫 Hide
                          </button>
                        )}
                        <button className="admin-btn-delete" onClick={() => setActionModal({ type: "delete", event: ev })}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Hide Modal */}
      {actionModal?.type === "hide" && (
        <div className="admin-modal-overlay" onClick={() => setActionModal(null)}>
          <div className="admin-modal admin-modal-warn" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon">🚫</div>
            <h3>Hide Event?</h3>
            <p>
              <strong>"{actionModal.event.title}"</strong> will be hidden from the frontend and all users.
              <br /><br />
              <span className="modal-note">✅ The data stays safe in the database. You can restore it anytime.</span>
            </p>
            <div className="admin-modal-actions">
              <button className="admin-modal-cancel" onClick={() => setActionModal(null)}>Cancel</button>
              <button className="admin-modal-hide" onClick={handleHide} disabled={processing}>
                {processing ? "Hiding…" : "🚫 Hide Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {actionModal?.type === "restore" && (
        <div className="admin-modal-overlay" onClick={() => setActionModal(null)}>
          <div className="admin-modal admin-modal-restore" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon">↩️</div>
            <h3>Restore Event?</h3>
            <p>
              <strong>"{actionModal.event.title}"</strong> will become visible on the frontend again.
            </p>
            <div className="admin-modal-actions">
              <button className="admin-modal-cancel" onClick={() => setActionModal(null)}>Cancel</button>
              <button className="admin-modal-confirm-restore" onClick={handleRestore} disabled={processing}>
                {processing ? "Restoring…" : "↩ Restore Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Modal */}
      {actionModal?.type === "delete" && (
        <div className="admin-modal-overlay" onClick={() => setActionModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon">⚠️</div>
            <h3>Permanently Delete?</h3>
            <p>
              <strong>"{actionModal.event.title}"</strong> will be <strong>permanently removed from the database</strong>.
              <br /><br />
              <span className="modal-note-danger">❌ This cannot be undone. All event data will be lost forever.</span>
            </p>
            <div className="admin-modal-actions">
              <button className="admin-modal-cancel" onClick={() => setActionModal(null)}>Cancel</button>
              <button className="admin-modal-confirm" onClick={handlePermanentDelete} disabled={processing}>
                {processing ? "Deleting…" : "🗑️ Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageEvents;