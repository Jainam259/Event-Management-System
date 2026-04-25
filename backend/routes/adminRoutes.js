// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const Event = require("../models/Event");

const JWT_SECRET = process.env.JWT_SECRET;

/* ── Admin Auth Middleware ─────────────────────────────── */
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).lean();
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.role !== "admin")
      return res.status(403).json({ message: "Access denied. Admins only." });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/* ── POST /api/admin/login ────────────────────────────── */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });
    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
    if (user.role !== "admin")
      return res.status(403).json({ message: "Access denied. Admins only." });
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ token, admin: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ── GET /api/admin/events ────────────────────────────── */
router.get("/events", adminAuth, async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name email").sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ── PATCH /api/admin/events/:id/hide ─────────────────── */
router.patch("/events/:id/hide", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid event ID" });
    const event = await Event.findByIdAndUpdate(id, { isHidden: true, hiddenAt: new Date() }, { new: true }).populate("createdBy", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event hidden from frontend.", event });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ── PATCH /api/admin/events/:id/unhide ───────────────── */
router.patch("/events/:id/unhide", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid event ID" });
    const event = await Event.findByIdAndUpdate(id, { isHidden: false, hiddenAt: null }, { new: true }).populate("createdBy", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event restored.", event });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ── DELETE /api/admin/events/:id ─────────────────────── */
router.delete("/events/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid event ID" });
    const event = await Event.findByIdAndDelete(id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event permanently deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ── GET /api/admin/users ─────────────────────────────── */
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ── GET /api/admin/participants ──────────────────────── */
router.get("/participants", adminAuth, async (req, res) => {
  try {
    let regs = [];
    try {
      const Registration = require("../models/Registration");
      regs = await Registration.find().populate("eventId", "title startDate venueName isHidden").sort({ createdAt: -1 });
    } catch (_) {}
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ── GET /api/admin/registrations ────────────────────── */
router.get("/registrations", adminAuth, async (req, res) => {
  try {
    let regs = [];
    try {
      const Registration = require("../models/Registration");
      regs = await Registration.find().populate("eventId", "title").sort({ createdAt: -1 });
    } catch (_) {}
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ── ⭐ GET /api/admin/email-logs ─────────────────────── */
router.get("/email-logs", adminAuth, async (req, res) => {
  try {
    const EmailLog = require("../models/EmailLog");
    const logs   = await EmailLog.find().sort({ sentAt: -1 }).limit(500).lean();
    const total  = logs.length;
    const sent   = logs.filter(l => l.status === "sent").length;
    const failed = logs.filter(l => l.status === "failed").length;
    res.json({ logs, stats: { total, sent, failed } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── ⭐ DELETE /api/admin/email-logs ─────────────────── */
router.delete("/email-logs", adminAuth, async (req, res) => {
  try {
    const EmailLog = require("../models/EmailLog");
    await EmailLog.deleteMany({});
    res.json({ message: "All email logs cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── ⭐ POST /api/admin/send-reminders ───────────────── */
router.post("/send-reminders", adminAuth, async (req, res) => {
  try {
    const { sendEventReminders } = require("../emailReminder");
    await sendEventReminders();
    res.json({ message: "Reminder job triggered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;