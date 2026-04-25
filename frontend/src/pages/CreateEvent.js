import React, { useState, useRef, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./CreateEvent.css";

const API_URL = "http://localhost:5000";

const CreateEvent = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const fileInputRef = useRef(null);
  const editorRef = useRef(null); // ⭐ fix for innerHTML null error

  const [event, setEvent] = useState({
    title: "",
    category: "",
    description: "",
    startDate: "",
    endDate: "",
    timezone: "",
    format: "In-Person",
    venueName: "",
    address: "",
    virtualLink: "",
    ticketType: "Free",
    price: "",
    capacity: "",
    banner: null,
  });

  const [bannerPreview, setBannerPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEvent((prev) => ({ ...prev, banner: file }));
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setEvent((prev) => ({ ...prev, banner: file }));
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const applyFormat = (cmd) => document.execCommand(cmd, false, null);

  // ⭐ fix: safely read innerHTML via ref instead of e.currentTarget
  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      setEvent((prev) => ({ ...prev, description: editorRef.current.innerHTML }));
    }
  }, []);

  const submitEvent = async (status) => {
    setError("");
    setSuccess("");

    if (!event.title.trim()) {
      setError("Event title is required.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/"); return; }

      const formData = new FormData();
      Object.entries(event).forEach(([key, val]) => {
        if (val !== null && val !== "") formData.append(key, val);
      });
      formData.append("status", status);

      const res = await fetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create event");

      setSuccess(status === "draft" ? "Event saved as draft!" : "Event created successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.message || "Something went wrong. Is your backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  const avatarInitials = username.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="ce-layout">
      {/* Sidebar */}
      <aside className="ce-sidebar">
        <div className="ce-logo">
          <span className="ce-logo-icon">✨</span>
          <span className="ce-logo-text">EventManager</span>
        </div>
        <nav className="ce-nav">
          <NavLink to="/dashboard" className="ce-nav-item"><span>📊</span> Dashboard</NavLink>
          <NavLink to="/create-event" className="ce-nav-item active-link"><span>➕</span> Create Event</NavLink>
          <NavLink to="/manage-events" className="ce-nav-item"><span>🗓️</span> Manage Events</NavLink>
          <NavLink to="/participants" className="ce-nav-item"><span>👥</span> Participants</NavLink>
          <NavLink to="/analytics" className="ce-nav-item"><span>📈</span> Analytics</NavLink>
          <NavLink to="/settings" className="ce-nav-item"><span>⚙️</span> Settings</NavLink>
        </nav>
        <div className="ce-sidebar-footer">
          <button className="ce-logout-btn" onClick={handleLogout}><span>🚪</span> Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="ce-main">
        <header className="ce-header">
          <div>
            <h1 className="ce-page-title">Create New Event</h1>
            <p className="ce-page-subtitle">Fill in the details to publish your next event.</p>
          </div>
          <div className="ce-user-info">
            <div className="ce-bell">🔔</div>
            <div className="ce-avatar">{avatarInitials}</div>
            <span className="ce-username">{username}</span>
          </div>
        </header>

        {error && <div className="ce-alert ce-alert-error">❌ {error}</div>}
        {success && <div className="ce-alert ce-alert-success">✅ {success}</div>}

        <div className="ce-form-grid">
          {/* Basic Information */}
          <div className="ce-card">
            <h3 className="ce-card-title">Basic Information</h3>

            <div className="ce-field">
              <label>Event Title</label>
              <input name="title" placeholder="Event Title" value={event.title} onChange={handleChange} className="ce-input" />
            </div>

            <div className="ce-field">
              <label>Category</label>
              <select name="category" value={event.category} onChange={handleChange} className="ce-select">
                <option value="">Conference, Workshop, etc.</option>
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Meetup">Meetup</option>
                <option value="Festival">Festival</option>
                <option value="Webinar">Webinar</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="ce-field">
              <label>Description</label>
              <div className="ce-editor">
                <div className="ce-editor-toolbar">
                  <button type="button" onClick={() => applyFormat("bold")}><b>B</b></button>
                  <button type="button" onClick={() => applyFormat("italic")}><i>I</i></button>
                  <button type="button" onClick={() => applyFormat("underline")}><u>U</u></button>
                  <button type="button">🔗</button>
                  <button type="button">&lt;/&gt;</button>
                  <button type="button">≡</button>
                  <button type="button">☰</button>
                  <button type="button">⁼</button>
                </div>
                {/* ⭐ fix: ref={editorRef} and onInput={handleEditorInput} */}
                <div
                  ref={editorRef}
                  className="ce-editor-body"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                />
              </div>
            </div>
          </div>

          {/* Date & Location */}
          <div className="ce-col-right">
            <div className="ce-card">
              <h3 className="ce-card-title">Date & Time</h3>
              <div className="ce-row">
                <div className="ce-field">
                  <label>Start Date & Time</label>
                  <input type="datetime-local" name="startDate" value={event.startDate} onChange={handleChange} className="ce-input" />
                </div>
                <div className="ce-field">
                  <label>End Date & Time</label>
                  <input type="datetime-local" name="endDate" value={event.endDate} onChange={handleChange} className="ce-input" />
                </div>
              </div>
              <div className="ce-field">
                <label>Timezone</label>
                <select name="timezone" value={event.timezone} onChange={handleChange} className="ce-select">
                  <option value="">Select a Timezone</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern (ET)</option>
                  <option value="America/Los_Angeles">Pacific (PT)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="Europe/London">London (GMT)</option>
                </select>
              </div>
            </div>

            <div className="ce-card">
              <h3 className="ce-card-title">Location Details</h3>
              <div className="ce-field">
                <label>Format</label>
                <div className="ce-radio-group">
                  {["In-Person", "Virtual", "Hybrid"].map((f) => (
                    <label key={f} className="ce-radio">
                      <input type="radio" name="format" value={f} checked={event.format === f} onChange={handleChange} />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
              {(event.format === "In-Person" || event.format === "Hybrid") && (
                <>
                  <div className="ce-field">
                    <label>Venue Name</label>
                    <input name="venueName" placeholder="Venue Name" value={event.venueName} onChange={handleChange} className="ce-input" />
                  </div>
                  <div className="ce-field">
                    <label>Address</label>
                    <input name="address" placeholder="Address" value={event.address} onChange={handleChange} className="ce-input" />
                  </div>
                </>
              )}
              {(event.format === "Virtual" || event.format === "Hybrid") && (
                <div className="ce-field">
                  <label>Virtual Link</label>
                  <input name="virtualLink" placeholder="https://your-meeting-link.com" value={event.virtualLink} onChange={handleChange} className="ce-input" />
                </div>
              )}
            </div>
          </div>

          {/* Ticketing & Media */}
          <div className="ce-card ce-card-tall">
            <h3 className="ce-card-title">Ticketing & Media</h3>

            <div className="ce-field">
              <label>Ticket Type</label>
              <div className="ce-radio-group">
                {["Free", "Paid"].map((t) => (
                  <label key={t} className="ce-radio">
                    <input type="radio" name="ticketType" value={t} checked={event.ticketType === t} onChange={handleChange} />
                    {t}
                  </label>
                ))}
              </div>
            </div>

            {event.ticketType === "Paid" && (
              <div className="ce-field">
                <label>Price ($)</label>
                <input name="price" type="number" placeholder="0" value={event.price} onChange={handleChange} className="ce-input" />
              </div>
            )}

            <div className="ce-field">
              <label>Capacity</label>
              <input name="capacity" type="number" placeholder="200" value={event.capacity} onChange={handleChange} className="ce-input" />
            </div>

            <div className="ce-field">
              <label>Event Banner</label>
              <div
                className="ce-dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner Preview" className="ce-banner-preview" />
                ) : (
                  <>
                    <span className="ce-upload-icon">⬆️</span>
                    <p>Click or drag & drop an image here</p>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
            </div>

            <div className="ce-actions">
              <button className="ce-btn-draft" onClick={() => submitEvent("draft")} disabled={loading}>
                Save as Draft
              </button>
              <button className="ce-btn-create" onClick={() => submitEvent("published")} disabled={loading}>
                {loading ? "Creating... ✨" : "Create Event ✨"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateEvent;