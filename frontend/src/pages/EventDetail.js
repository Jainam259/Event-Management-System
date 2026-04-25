import React, { useEffect, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import "./EventDetail.css";

const API_URL = "http://localhost:5000";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registrationData, setRegistrationData] = useState(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // ⭐ Seats state
  const [bookedSeats, setBookedSeats] = useState(0);
  const [seatsLoading, setSeatsLoading] = useState(true);

  const [form, setForm] = useState({
    name: username,
    email: "",
    phone: "",
    organization: "",
    ticketCount: 1,
    message: "",
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  // Fetch event
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // ⭐ Fetch booked seats + check registration
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("token");

    const fetchSeats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/registrations/event/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const regs = await res.json();
          const total = regs.reduce((sum, r) => sum + (r.ticketCount || 1), 0);
          setBookedSeats(total);
        }
      } catch (_) {}
      finally { setSeatsLoading(false); }
    };

    const checkReg = async () => {
      try {
        const res = await fetch(`${API_URL}/api/registrations/check/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAlreadyRegistered(data.registered);
        }
      } catch (_) {}
    };

    fetchSeats();
    checkReg();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    setError("");
    if (!form.name || !form.email) { setError("Name and email are required."); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError("Please enter a valid email address."); return; }

    const remaining = getRemainingSeats();
    if (remaining !== null && parseInt(form.ticketCount) > remaining) {
      setError(`Only ${remaining} seat${remaining !== 1 ? "s" : ""} remaining.`);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ eventId: id, ...form, ticketCount: parseInt(form.ticketCount) || 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setRegistrationData(data);
      setShowForm(false);
      setShowSuccess(true);
      setAlreadyRegistered(true);
      setBookedSeats((prev) => prev + (parseInt(form.ticketCount) || 1));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ⭐ Seat helpers
  const getRemainingSeats = () => {
    if (!event?.capacity) return null;
    return Math.max(0, event.capacity - bookedSeats);
  };

  const getSeatStatus = () => {
    const r = getRemainingSeats();
    if (r === null) return "unlimited";
    if (r === 0) return "full";
    if (r <= event.capacity * 0.1) return "critical";
    if (r <= event.capacity * 0.25) return "low";
    return "available";
  };

  const getMaxTickets = () => {
    const r = getRemainingSeats();
    if (r === null) return 10;
    return Math.min(10, r);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusLabel = () => {
    if (!event) return "";
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    if (event.status === "draft") return "Draft";
    if (now >= start && now <= end) return "Live Now";
    if (now < start) return "Upcoming";
    return "Completed";
  };

  const isEventEnded = () => {
    if (!event?.endDate) return false;
    return new Date() > new Date(event.endDate);
  };

  const getCreatorName = () => {
    if (event?.createdBy && typeof event.createdBy === "object") return event.createdBy.name;
    return "Unknown";
  };

  const avatarInitials = username.split(" ").map((n) => n[0]).join("").toUpperCase();
  const ended = isEventEnded();
  const remaining = getRemainingSeats();
  const seatStatus = getSeatStatus();
  const isFull = seatStatus === "full";
  const pct = event?.capacity ? Math.min(100, Math.round((bookedSeats / event.capacity) * 100)) : 0;

  return (
    <div className="ed-layout">
      {/* Sidebar */}
      <aside className="ed-sidebar">
        <div className="ed-logo"><span>✨</span><span className="ed-logo-text">EventManager</span></div>
        <nav className="ed-nav">
          <NavLink to="/dashboard"     className="ed-nav-item"><span>📊</span> Dashboard</NavLink>
          <NavLink to="/create-event"  className="ed-nav-item"><span>➕</span> Create Event</NavLink>
          <NavLink to="/manage-events" className="ed-nav-item"><span>🗓️</span> Manage Events</NavLink>
          <NavLink to="/participants"  className="ed-nav-item"><span>👥</span> Participants</NavLink>
          <NavLink to="/analytics"     className="ed-nav-item"><span>📈</span> Analytics</NavLink>
          <NavLink to="/settings"      className="ed-nav-item"><span>⚙️</span> Settings</NavLink>
        </nav>
        <div className="ed-sidebar-footer">
          <button className="ed-logout-btn" onClick={handleLogout}><span>🚪</span> Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="ed-main">
        <header className="ed-header">
          <button className="ed-back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="ed-user-info">
            <div className="ed-bell">🔔</div>
            <div className="ed-avatar">{avatarInitials}</div>
            <span className="ed-username">{username}</span>
          </div>
        </header>

        {loading ? (
          <div className="ed-loading"><div className="ed-spinner"></div><p>Loading event...</p></div>
        ) : !event ? (
          <div className="ed-empty"><p>Event not found.</p><button onClick={() => navigate("/dashboard")}>Go Back</button></div>
        ) : (
          <div className="ed-content">
            {/* Hero */}
            <div className="ed-hero">
              {event.banner ? (
                <div className="ed-hero-bg" style={{ backgroundImage: `url(${API_URL}${event.banner})` }} />
              ) : (
                <div className="ed-hero-placeholder"><span>{event.category || "Event"}</span></div>
              )}
              <div className="ed-hero-overlay">
                <span className={`ed-status-badge ${getStatusLabel() === "Live Now" ? "live" : getStatusLabel() === "Completed" ? "completed" : "upcoming"}`}>
                  {getStatusLabel() === "Live Now" ? "🔴 Live Now" : getStatusLabel() === "Completed" ? "✅ Completed" : `⏰ ${getStatusLabel()}`}
                </span>
                <h1 className="ed-event-title">{event.title}</h1>
                <p className="ed-event-organizer">Organized by {getCreatorName()}</p>
              </div>
            </div>

            {/* Body */}
            <div className="ed-body">
              {/* Left */}
              <div className="ed-details">
                <div className="ed-info-grid">
                  <div className="ed-info-card">
                    <div className="ed-info-icon">📅</div>
                    <div>
                      <div className="ed-info-label">Start Date</div>
                      <div className="ed-info-value">{formatDate(event.startDate)}</div>
                      <div className="ed-info-sub">{formatTime(event.startDate)}</div>
                    </div>
                  </div>
                  <div className="ed-info-card">
                    <div className="ed-info-icon">🏁</div>
                    <div>
                      <div className="ed-info-label">End Date</div>
                      <div className="ed-info-value">{formatDate(event.endDate)}</div>
                      <div className="ed-info-sub">{formatTime(event.endDate)}</div>
                    </div>
                  </div>
                  <div className="ed-info-card">
                    <div className="ed-info-icon">{event.format === "Virtual" ? "🌐" : "📍"}</div>
                    <div>
                      <div className="ed-info-label">Location</div>
                      <div className="ed-info-value">{event.venueName || "Virtual"}</div>
                      <div className="ed-info-sub">{event.address || event.virtualLink || ""}</div>
                    </div>
                  </div>
                  {/* ⭐ Seats card with live remaining count */}
                  <div className="ed-info-card">
                    <div className="ed-info-icon">🎟️</div>
                    <div style={{ width: "100%" }}>
                      <div className="ed-info-label">Capacity</div>
                      <div className="ed-info-value">{event.capacity?.toLocaleString() || "Unlimited"}</div>
                      {!seatsLoading && event.capacity && (
                        <div className={`ed-seats-sub-inline ed-seats-${seatStatus}`}>
                          {remaining} seat{remaining !== 1 ? "s" : ""} remaining
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="ed-tags">
                  <span className="ed-tag ed-tag-category">{event.category || "General"}</span>
                  <span className="ed-tag ed-tag-format">{event.format}</span>
                  <span className="ed-tag ed-tag-timezone">🕐 {event.timezone}</span>
                </div>

                {/* Description */}
                {event.description && (
                  <div className="ed-section">
                    <h3 className="ed-section-title">About This Event</h3>
                    <div className="ed-description" dangerouslySetInnerHTML={{ __html: event.description }} />
                  </div>
                )}

                {event.virtualLink && (
                  <div className="ed-section">
                    <h3 className="ed-section-title">Join Online</h3>
                    <a href={event.virtualLink} target="_blank" rel="noreferrer" className="ed-virtual-link">🔗 {event.virtualLink}</a>
                  </div>
                )}
              </div>

              {/* Right — Register Card */}
              <div className="ed-register-card">
                <div className="ed-price-box">
                  {event.ticketType === "Free" ? (
                    <div className="ed-price-free">🎟️ Free Entry</div>
                  ) : (
                    <div className="ed-price-paid">
                      <span className="ed-price-amount">${event.price}</span>
                      <span className="ed-price-per">per ticket</span>
                    </div>
                  )}
                </div>

                {/* ⭐ SEATS AVAILABILITY BOX */}
                {event.capacity && !seatsLoading && (
                  <div className="ed-seats-box">
                    <div className="ed-seats-top-row">
                      <span className="ed-seats-title">Seat Availability</span>
                      <span className={`ed-seats-badge ed-seats-badge-${seatStatus}`}>
                        {seatStatus === "full"      && "🔴 Sold Out"}
                        {seatStatus === "critical"  && "🔴 Almost Full"}
                        {seatStatus === "low"       && "🟡 Filling Fast"}
                        {seatStatus === "available" && "🟢 Available"}
                        {seatStatus === "unlimited" && "🟢 Open"}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="ed-bar-track">
                      <div className={`ed-bar-fill ed-bar-${seatStatus}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="ed-bar-label">{pct}% filled</div>

                    {/* 3 numbers */}
                    <div className="ed-seats-numbers">
                      <div className="ed-seats-num-block">
                        <span className="ed-seats-big">{bookedSeats}</span>
                        <span className="ed-seats-lbl">Booked</span>
                      </div>
                      <div className="ed-seats-divider" />
                      <div className="ed-seats-num-block">
                        <span className="ed-seats-big">{event.capacity.toLocaleString()}</span>
                        <span className="ed-seats-lbl">Total</span>
                      </div>
                      <div className="ed-seats-divider" />
                      <div className="ed-seats-num-block">
                        <span className={`ed-seats-big ed-remaining-${seatStatus}`}>{remaining}</span>
                        <span className="ed-seats-lbl">Remaining</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="ed-register-meta">
                  <div className="ed-register-meta-row"><span>📅 Date</span><span>{formatDate(event.startDate)}</span></div>
                  <div className="ed-register-meta-row"><span>⏰ Time</span><span>{formatTime(event.startDate)}</span></div>
                  <div className="ed-register-meta-row"><span>📍 Venue</span><span>{event.venueName || "Online"}</span></div>
                  <div className="ed-register-meta-row"><span>👥 Capacity</span><span>{event.capacity?.toLocaleString() || "Open"}</span></div>
                </div>

                {alreadyRegistered && !showSuccess && (
                  <div className="ed-already-reg">✅ You're already registered for this event!</div>
                )}

                <button
                  className={`ed-register-btn ${(ended || isFull || alreadyRegistered) ? "ed-register-btn-disabled" : ""}`}
                  disabled={ended || isFull || alreadyRegistered}
                  onClick={() => !ended && !isFull && !alreadyRegistered && setShowForm(true)}
                >
                  {ended ? "🔒 Registration Closed" : isFull ? "🔴 Sold Out" : alreadyRegistered ? "✅ Already Registered" : "Register Now →"}
                </button>

                {ended ? (
                  <p className="ed-register-note ed-register-note-closed">This event has ended. Registration is no longer available.</p>
                ) : isFull ? (
                  <p className="ed-register-note ed-register-note-closed">All seats are booked. No spots available.</p>
                ) : (
                  <p className="ed-register-note">Free cancellation · Instant confirmation</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Registration Modal */}
      {showForm && (
        <div className="ed-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="ed-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ed-modal-close" onClick={() => setShowForm(false)}>✕</button>
            <div className="ed-modal-header">
              <div className="ed-modal-icon-wrap">🎟️</div>
              <h2>Register for Event</h2>
              <p>{event?.title}</p>
            </div>

            {/* ⭐ Seats banner inside modal */}
            {event?.capacity && !seatsLoading && (
              <div className={`ed-modal-seats ed-modal-seats-${seatStatus}`}>
                <span>🪑</span>
                <span><strong>{remaining}</strong> seat{remaining !== 1 ? "s" : ""} remaining out of {event.capacity.toLocaleString()}</span>
              </div>
            )}

            {error && <div className="ed-form-error">❌ {error}</div>}

            <div className="ed-form">
              <div className="ed-form-row">
                <div className="ed-form-field">
                  <label>Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className="ed-input" />
                </div>
                <div className="ed-form-field">
                  <label>Email Address *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className="ed-input" />
                </div>
              </div>
              <div className="ed-form-row">
                <div className="ed-form-field">
                  <label>Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 00000 00000" className="ed-input" />
                </div>
                <div className="ed-form-field">
                  <label>Organization</label>
                  <input name="organization" value={form.organization} onChange={handleChange} placeholder="Company / College" className="ed-input" />
                </div>
              </div>
              <div className="ed-form-row">
                <div className="ed-form-field">
                  <label>
                    Number of Tickets
                    {remaining !== null && remaining > 0 && (
                      <span className="ed-max-label"> (max {Math.min(10, remaining)} available)</span>
                    )}
                  </label>
                  <select name="ticketCount" value={form.ticketCount} onChange={handleChange} className="ed-input ed-select">
                    {Array.from({ length: getMaxTickets() }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} Ticket{n > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="ed-form-field">
                <label>Message (Optional)</label>
                <textarea name="message" value={form.message} onChange={handleChange} placeholder="Any special requirements or questions..." className="ed-input ed-textarea" rows={3} />
              </div>
            </div>

            <button className="ed-submit-btn" onClick={handleRegister} disabled={submitting}>
              {submitting ? "Registering..." : "✓ Confirm Registration"}
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="ed-modal-overlay">
          <div className="ed-success-modal">
            <div className="ed-confetti">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="ed-confetti-dot" style={{
                  left: `${(i * 8.3) % 100}%`,
                  background: ["#a78bfa","#e879f9","#34d399","#f59e0b","#60a5fa"][i % 5],
                  animationDelay: `${i * 0.1}s`,
                }}/>
              ))}
            </div>
            <div className="ed-success-icon">🎉</div>
            <h2 className="ed-success-title">Congratulations!</h2>
            <p className="ed-success-subtitle">You're successfully registered!</p>
            <div className="ed-success-card">
              <div className="ed-success-row"><span>🎟️ Event</span><span>{event?.title}</span></div>
              <div className="ed-success-row"><span>👤 Name</span><span>{registrationData?.registration?.name}</span></div>
              <div className="ed-success-row"><span>📧 Email</span><span>{registrationData?.registration?.email}</span></div>
              <div className="ed-success-row"><span>🎫 Tickets</span><span>{registrationData?.registration?.ticketCount}</span></div>
              <div className="ed-success-row"><span>📅 Date</span><span>{formatDate(event?.startDate)}</span></div>
              <div className="ed-success-row"><span>📍 Venue</span><span>{event?.venueName || "Online"}</span></div>
            </div>
            <button className="ed-success-btn" onClick={() => { setShowSuccess(false); navigate("/dashboard"); }}>
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;