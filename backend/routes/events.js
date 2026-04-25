// backend/routes/events.js
// Add isHidden filter so hidden events don't show on the frontend

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const Event = require("../models/Event");

const JWT_SECRET = process.env.JWT_SECRET;

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Multer setup for banner uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads/banners")),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ── GET /api/events — only NON-hidden events for regular users ──
router.get("/", auth, async (req, res) => {
  try {
    const events = await Event.find({ isHidden: { $ne: true } })  // ⭐ filter hidden
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET /api/events/:id ─────────────────────────────────────────
router.get("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("createdBy", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    // Block access to hidden events for regular users
    if (event.isHidden) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/events — create event ────────────────────────────
router.post("/", auth, upload.single("banner"), async (req, res) => {
  try {
    const {
      title, description, category, format, timezone,
      startDate, endDate, venueName, address, virtualLink,
      capacity, ticketType, price, status,
    } = req.body;

    const newEvent = new Event({
      title, description, category, format, timezone,
      startDate, endDate, venueName, address, virtualLink,
      capacity: capacity ? Number(capacity) : undefined,
      ticketType, price: price ? Number(price) : 0,
      status: status || "published",
      banner: req.file ? `/uploads/banners/${req.file.filename}` : null,
      createdBy: req.userId,
      isHidden: false,
    });

    await newEvent.save();
    const populated = await newEvent.populate("createdBy", "name email");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── PUT /api/events/:id — update event ─────────────────────────
router.put("/:id", auth, upload.single("banner"), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.banner = `/uploads/banners/${req.file.filename}`;
    if (updates.capacity) updates.capacity = Number(updates.capacity);
    if (updates.price) updates.price = Number(updates.price);

    const event = await Event.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("createdBy", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── DELETE /api/events/:id — delete event ──────────────────────
router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;