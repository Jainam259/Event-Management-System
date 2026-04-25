// src/pages/Admin/EmailLogs.js
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./AdminLayout.css";
import "./EmailLogs.css";

const API_URL = "http://localhost:5000";

const EmailLogs = () => {
  const navigate  = useNavigate();
  const [logs, setLogs]     = useState([]);
  const [stats, setStats]   = useState({ total: 0, sent: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]  = useState("all");

  const token = localStorage.getItem("adminToken");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API_URL}/api/admin/email-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLogs(data.logs || []);
      setStats(data.stats || { total: 0, sent: 0, failed: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const clearLogs = async () => {
    if (!window.confirm("Clear all email logs?")) return;
    await fetch(`${API_URL}/api/admin/email-logs`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchLogs();
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const filtered = filter === "all" ? logs : logs.filter(l => l.status === filter);

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span>✨</span><span className="admin-logo-text">EventManager</span>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard"    className="admin-nav-item"><span>📊</span> Dashboard</NavLink>
          <NavLink to="/admin/events"       className="admin-nav-item"><span>🗓️</span> Manage Events</NavLink>
          <NavLink to="/admin/participants" className="admin-nav-item"><span>👥</span> Participants</NavLink>
          <NavLink to="/admin/email-logs"   className="admin-nav-item active-link"><span>📧</span> Email Logs</NavLink>
          <NavLink to="/admin/analytics"    className="admin-nav-item"><span>📈</span> Analytics</NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <header className="el-header">
          <div>
            <h1 className="el-title">Email Logs</h1>
            <p className="el-subtitle">All reminder emails sent to registered users.</p>
          </div>
          <div className="el-header-actions">
            <button className="el-refresh-btn" onClick={fetchLogs}>🔄 Refresh</button>
            <button className="el-clear-btn" onClick={clearLogs}>🗑️ Clear Logs</button>
          </div>
        </header>

        {/* Stats */}
        <div className="el-stats">
          <div className="el-stat el-stat-blue">
            <div className="el-stat-icon">📧</div>
            <div className="el-stat-num">{stats.total}</div>
            <div className="el-stat-label">Total Emails</div>
          </div>
          <div className="el-stat el-stat-green">
            <div className="el-stat-icon">✅</div>
            <div className="el-stat-num">{stats.sent}</div>
            <div className="el-stat-label">Sent Successfully</div>
          </div>
          <div className="el-stat el-stat-red">
            <div className="el-stat-icon">❌</div>
            <div className="el-stat-num">{stats.failed}</div>
            <div className="el-stat-label">Failed</div>
          </div>
          <div className="el-stat el-stat-purple">
            <div className="el-stat-icon">📊</div>
            <div className="el-stat-num">
              {stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0}%
            </div>
            <div className="el-stat-label">Success Rate</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="el-filters">
          {["all", "sent", "failed"].map(f => (
            <button
              key={f}
              className={`el-filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "sent" ? "✅ Sent" : "❌ Failed"}
              <span className="el-filter-count">
                {f === "all" ? stats.total : f === "sent" ? stats.sent : stats.failed}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="el-loading"><div className="el-spinner"></div><p>Loading logs…</p></div>
        ) : filtered.length === 0 ? (
          <div className="el-empty">
            <div style={{ fontSize: 44 }}>📭</div>
            <h3>No email logs found</h3>
            <p>Reminder emails will appear here after the cron job runs at 9:00 AM IST.</p>
          </div>
        ) : (
          <div className="el-table-wrap">
            <table className="el-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Recipient</th>
                  <th>Email</th>
                  <th>Event</th>
                  <th>Status</th>
                  <th>Sent At</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <tr key={log._id} className="el-row">
                    <td className="el-num">{i + 1}</td>
                    <td className="el-name">{log.name || "—"}</td>
                    <td className="el-email">{log.to}</td>
                    <td className="el-event">{log.eventTitle || "—"}</td>
                    <td>
                      <span className={`el-status ${log.status === "sent" ? "el-sent" : "el-failed"}`}>
                        {log.status === "sent" ? "✅ Sent" : "❌ Failed"}
                      </span>
                    </td>
                    <td className="el-date">{formatDate(log.sentAt)}</td>
                    <td className="el-error">{log.error || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="el-count">
            Showing <strong>{filtered.length}</strong> of <strong>{logs.length}</strong> logs
          </div>
        )}
      </main>
    </div>
  );
};

export default EmailLogs;