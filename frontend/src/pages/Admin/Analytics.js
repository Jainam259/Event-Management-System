import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

const API_URL = "http://localhost:5000";

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ events: [], users: [], registrations: [] });
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  useEffect(() => {
    const fetch3 = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const h = { Authorization: `Bearer ${token}` };
        const [eRes, uRes, rRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/events`, { headers: h }),
          fetch(`${API_URL}/api/admin/users`, { headers: h }),
          fetch(`${API_URL}/api/admin/registrations`, { headers: h }),
        ]);
        const events = eRes.ok ? await eRes.json() : [];
        const users = uRes.ok ? await uRes.json() : [];
        const registrations = rRes.ok ? await rRes.json() : [];
        setData({ events, users, registrations });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch3();
  }, []);

  // Derived stats
  const { events, users, registrations } = data;

  const totalRevenue = events.reduce(
    (sum, e) => sum + (e.ticketType === "Paid" ? (e.price || 0) * (e.capacity || 0) : 0), 0
  );

  const byCategory = events.reduce((acc, e) => {
    const cat = e.category || "General";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const byFormat = events.reduce((acc, e) => {
    acc[e.format || "Unknown"] = (acc[e.format || "Unknown"] || 0) + 1;
    return acc;
  }, {});

  const byStatus = {
    Scheduled: 0, Live: 0, Completed: 0, Draft: 0,
  };
  events.forEach((ev) => {
    const now = new Date();
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);
    if (ev.status === "draft") byStatus.Draft++;
    else if (now >= start && now <= end) byStatus.Live++;
    else if (now < start) byStatus.Scheduled++;
    else byStatus.Completed++;
  });

  const topCreators = Object.entries(
    events.reduce((acc, e) => {
      const name = e.createdBy?.name || "Unknown";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const freeVsPaid = {
    Free: events.filter((e) => e.ticketType === "Free").length,
    Paid: events.filter((e) => e.ticketType === "Paid").length,
  };

  const BarChart = ({ data, colorClass }) => {
    const max = Math.max(...Object.values(data), 1);
    return (
      <div className="ana-bar-chart">
        {Object.entries(data).map(([key, val]) => (
          <div className="ana-bar-item" key={key}>
            <div className="ana-bar-label">{key}</div>
            <div className="ana-bar-track">
              <div
                className={`ana-bar-fill ${colorClass}`}
                style={{ width: `${(val / max) * 100}%` }}
              />
            </div>
            <div className="ana-bar-value">{val}</div>
          </div>
        ))}
      </div>
    );
  };

  const DonutStat = ({ label, value, total, color }) => {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
      <div className="ana-donut-stat">
        <div className="ana-donut-ring" style={{ "--pct": pct, "--color": color }}>
          <span className="ana-donut-pct">{pct}%</span>
        </div>
        <div className="ana-donut-label">{label}</div>
        <div className="ana-donut-val">{value}</div>
      </div>
    );
  };

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
            <h1 className="admin-page-title">Analytics</h1>
            <p className="admin-page-sub">Platform-wide statistics and insights</p>
          </div>
        </header>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner"></div><p>Loading analytics…</p></div>
        ) : (
          <>
            {/* KPI Row */}
            <div className="ana-kpi-row">
              {[
                { label: "Total Events", value: events.length, icon: "🗓️", color: "#7c3aed" },
                { label: "Total Users", value: users.length, icon: "👤", color: "#0ea5e9" },
                { label: "Registrations", value: registrations.length, icon: "🎟️", color: "#10b981" },
                { label: "Est. Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: "💰", color: "#f59e0b" },
                { label: "Paid Events", value: freeVsPaid.Paid, icon: "💳", color: "#ec4899" },
                { label: "Free Events", value: freeVsPaid.Free, icon: "🎁", color: "#34d399" },
              ].map((k) => (
                <div className="ana-kpi-card" key={k.label} style={{ "--kpi-color": k.color }}>
                  <div className="ana-kpi-icon">{k.icon}</div>
                  <div className="ana-kpi-value">{k.value}</div>
                  <div className="ana-kpi-label">{k.label}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="ana-charts-grid">
              {/* Events by Status */}
              <div className="admin-panel">
                <div className="admin-panel-head"><h3>Events by Status</h3></div>
                <div className="ana-donut-row">
                  <DonutStat label="Scheduled" value={byStatus.Scheduled} total={events.length} color="#60a5fa" />
                  <DonutStat label="Live" value={byStatus.Live} total={events.length} color="#34d399" />
                  <DonutStat label="Completed" value={byStatus.Completed} total={events.length} color="#9ca3af" />
                  <DonutStat label="Draft" value={byStatus.Draft} total={events.length} color="#fbbf24" />
                </div>
              </div>

              {/* Events by Category */}
              <div className="admin-panel">
                <div className="admin-panel-head"><h3>Events by Category</h3></div>
                <BarChart data={byCategory} colorClass="bar-purple" />
              </div>

              {/* Events by Format */}
              <div className="admin-panel">
                <div className="admin-panel-head"><h3>Events by Format</h3></div>
                <BarChart data={byFormat} colorClass="bar-blue" />
              </div>

              {/* Top Creators */}
              <div className="admin-panel">
                <div className="admin-panel-head"><h3>Top Event Creators</h3></div>
                <div className="ana-creator-list">
                  {topCreators.length === 0 ? (
                    <p className="admin-empty-msg">No data</p>
                  ) : topCreators.map(([name, count], i) => (
                    <div className="ana-creator-row" key={name}>
                      <div className="ana-creator-rank">#{i + 1}</div>
                      <div className="ana-creator-avatar">{name[0].toUpperCase()}</div>
                      <div className="ana-creator-name">{name}</div>
                      <div className="ana-creator-count">{count} events</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminAnalytics;