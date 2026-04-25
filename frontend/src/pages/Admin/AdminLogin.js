import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const API_URL = "http://localhost:5000";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.admin));
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="alog-root">
      {/* Background blobs */}
      <div className="alog-blob alog-blob1" />
      <div className="alog-blob alog-blob2" />
      <div className="alog-blob alog-blob3" />

      <div className="alog-card">
        <div className="alog-shield">🛡️</div>
        <h1 className="alog-title">Admin Access</h1>
        <p className="alog-subtitle">Restricted area — authorized personnel only</p>

        {error && (
          <div className="alog-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="alog-field">
          <label>Admin Email</label>
          <input
            name="email"
            type="email"
            placeholder="admin@example.com"
            value={form.email}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="alog-input"
          />
        </div>

        <div className="alog-field">
          <label>Password</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="alog-input"
          />
        </div>

        <button
          className="alog-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Authenticating…" : "🔐 Login to Admin Panel"}
        </button>

        <button
          className="alog-back-link"
          onClick={() => navigate("/")}
        >
          ← Back to main site
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;