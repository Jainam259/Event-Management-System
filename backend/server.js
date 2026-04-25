// backend/server.js
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const path     = require("path");
const fs       = require("fs");
const cron     = require("node-cron");                       // ⭐ NEW
require("dotenv").config();

const { sendEventReminders } = require("./emailReminder");  // ⭐ NEW

const app = express();

app.use(cors());
app.use(express.json());

// Upload directory
const uploadDir = path.join(__dirname, "uploads", "banners");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── MongoDB Connection ────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected to DB:", mongoose.connection.db.databaseName))
  .catch(err => console.log("❌ MongoDB Error:", err));

// ── User Model ────────────────────────────────────────────
const User = require("./models/User");

// ── Signup ────────────────────────────────────────────────
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role: "user" });
    await newUser.save();
    console.log("✅ New user registered:", email);
    res.json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

// ── Login ─────────────────────────────────────────────────
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean();
    if (!user) return res.json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    console.log("✅ Login:", email, "| role:", user.role);
    res.json({ message: "Login successful", token, username: user.name });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// ── Regular API Routes ────────────────────────────────────
app.use("/api/events",        require("./routes/events"));
app.use("/api/participants",  require("./routes/participants"));
app.use("/api/registrations", require("./routes/registrations"));

// ── Admin Routes ──────────────────────────────────────────
app.use("/api/admin", require("./routes/adminRoutes"));

// ── Debug route ───────────────────────────────────────────
app.get("/debug-user", async (req, res) => {
  try {
    const user = await User.findOne({ email: "jainamshah898@gmail.com" }).lean();
    res.json({
      dbName: mongoose.connection.db.databaseName,
      name:   user?.name,
      email:  user?.email,
      role:   user?.role,
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ── Test route ────────────────────────────────────────────
app.get("/test-admin-routes", (req, res) => {
  res.json({
    message: "Admin routes are mounted correctly",
    routes: [
      "POST /api/admin/login",
      "GET  /api/admin/events",
      "PATCH /api/admin/events/:id/hide",
      "PATCH /api/admin/events/:id/unhide",
      "DELETE /api/admin/events/:id",
      "GET  /api/admin/users",
      "GET  /api/admin/participants",
      "GET  /api/admin/registrations",
    ]
  });
});

// ── Root ──────────────────────────────────────────────────
app.get("/", (req, res) => res.send("Backend is running 🚀"));

// ── ⭐ CRON JOB — every day at 9:00 AM IST ───────────────
cron.schedule("0 9 * * *", async () => {
  console.log("\n⏰ [CRON] Running daily email reminder job...");
  await sendEventReminders();
}, {
  timezone: "Asia/Kolkata"
});
console.log("📅 Cron scheduled — email reminders fire at 9:00 AM IST daily");

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));