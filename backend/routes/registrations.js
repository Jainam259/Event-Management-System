// backend/routes/registrations.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Registration = require("../models/Registration");
const Event = require("../models/Event");

const JWT_SECRET = process.env.JWT_SECRET;

// ── Email transporter ─────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Confirmation email HTML ───────────────────────────────
function buildConfirmationEmail(name, event, registration) {
  const startDate = new Date(event.startDate);
  const dateStr   = startDate.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  const timeStr   = startDate.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
  const venue     = event.venueName || event.address || (event.format === "Virtual" ? "Online / Virtual" : "TBD");
  const isPaid    = event.ticketType === "Paid";
  const tickets   = registration.ticketCount || 1;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1a;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <tr><td style="background:linear-gradient(135deg,#7c3aed,#9333ea);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
    <div style="font-size:40px;margin-bottom:8px;">🎉</div>
    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">Registration Confirmed!</h1>
    <p style="margin:8px 0 0;color:#e9d5ff;font-size:14px;">You're all set for ${event.title}</p>
  </td></tr>

  <tr><td style="background:#111128;padding:36px 40px;">
    <p style="margin:0 0 8px;color:#e2e2f0;font-size:16px;">Hi <strong style="color:#c4b5fd;">${name}</strong> 👋</p>
    <p style="margin:0 0 28px;color:#9a9ab5;font-size:14px;line-height:1.7;">
      Your registration is <strong style="color:#34d399;">confirmed</strong>!
      Here are your complete booking details:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a35;border:1px solid rgba(124,58,237,0.3);border-radius:14px;overflow:hidden;margin-bottom:24px;">
      <tr><td style="background:rgba(124,58,237,0.2);padding:20px 24px;border-bottom:1px solid rgba(124,58,237,0.2);">
        <h2 style="margin:0;color:#e0d9ff;font-size:20px;font-weight:700;">${event.title}</h2>
        ${event.category ? `<span style="display:inline-block;margin-top:8px;background:rgba(139,92,246,0.25);color:#c4b5fd;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;">${event.category}</span>` : ""}
      </td></tr>
      <tr><td style="padding:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="color:#6b6b8a;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">👤 Name</span>
            <p style="margin:4px 0 0;color:#e2e2f0;font-size:14px;font-weight:600;">${name}</p>
          </td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="color:#6b6b8a;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">📅 Date</span>
            <p style="margin:4px 0 0;color:#e2e2f0;font-size:14px;font-weight:600;">${dateStr}</p>
          </td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="color:#6b6b8a;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">🕐 Time</span>
            <p style="margin:4px 0 0;color:#e2e2f0;font-size:14px;font-weight:600;">${timeStr}</p>
          </td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="color:#6b6b8a;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">📍 Venue</span>
            <p style="margin:4px 0 0;color:#e2e2f0;font-size:14px;font-weight:600;">${venue}</p>
          </td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="color:#6b6b8a;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">🎫 Tickets</span>
            <p style="margin:4px 0 0;">
              <span style="display:inline-block;background:rgba(124,58,237,0.2);color:#c4b5fd;font-size:14px;font-weight:700;padding:3px 12px;border-radius:20px;">
                ${tickets} Ticket${tickets > 1 ? "s" : ""}
              </span>
            </p>
          </td></tr>
          <tr><td style="padding:8px 0;">
            <span style="color:#6b6b8a;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">🎟️ Type</span>
            <p style="margin:4px 0 0;">
              <span style="display:inline-block;background:${isPaid ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)"};color:${isPaid ? "#fcd34d" : "#6ee7b7"};font-size:13px;font-weight:600;padding:3px 10px;border-radius:20px;">
                ${isPaid ? `💳 Paid — ₹${event.price || 0}` : "🆓 Free Entry"}
              </span>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>

    <div style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0;color:#e2e2f0;font-size:14px;line-height:1.6;">
        ✅ <strong style="color:#34d399;">You're confirmed!</strong> 
        Keep this email as your registration proof. 
        We'll also send a <strong style="color:#34d399;">reminder 1 day before</strong> the event.
      </p>
    </div>

    <p style="margin:0;color:#6b6b8a;font-size:13px;line-height:1.6;">See you at the event! 🎊</p>
  </td></tr>

  <tr><td style="background:#0d0d1a;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
    <p style="margin:0;color:#4a4a6a;font-size:12px;">You received this because you registered for this event.</p>
    <p style="margin:6px 0 0;color:#4a4a6a;font-size:12px;">© 2026 EventManager. All rights reserved.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

// ── Auth middleware ────────────────────────────────────────
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* ── POST /api/registrations ─────────────────────────── */
router.post("/", auth, async (req, res) => {
  try {
    const { eventId, name, email, phone, organization, ticketCount, message } = req.body;

    if (!eventId || !name || !email)
      return res.status(400).json({ message: "eventId, name and email are required" });

    if (!mongoose.Types.ObjectId.isValid(eventId))
      return res.status(400).json({ message: "Invalid event ID" });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.isHidden) return res.status(400).json({ message: "This event is no longer available" });

    const existing = await Registration.findOne({
      eventId,
      $or: [{ userId: req.userId }, { email: email.toLowerCase() }]
    });
    if (existing)
      return res.status(409).json({ message: "You are already registered for this event" });

    const tickets = parseInt(ticketCount) || 1;

    if (event.capacity) {
      const booked = await Registration.aggregate([
        { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
        { $group: { _id: null, total: { $sum: "$ticketCount" } } }
      ]);
      const totalBooked = booked[0]?.total || 0;
      if (totalBooked + tickets > event.capacity)
        return res.status(400).json({ message: `Only ${event.capacity - totalBooked} seat(s) remaining` });
    }

    const registration = new Registration({
      eventId,
      userId:       req.userId,
      name:         name.trim(),
      email:        email.toLowerCase().trim(),
      phone:        phone || "",
      organization: organization || "",
      ticketCount:  tickets,
      message:      message || "",
    });

    await registration.save();
    console.log(`✅ Registration saved: ${email} → ${event.title} (${tickets} tickets)`);

    // ⭐ Send confirmation email immediately after registration
    try {
      const EmailLog = require("../models/EmailLog");
      const subject  = `✅ Registration Confirmed: ${event.title}`;
      const html     = buildConfirmationEmail(name.trim(), event, registration);

      await transporter.sendMail({
        from:    `"EventManager" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to:      email.toLowerCase().trim(),
        subject,
        html,
      });

      await EmailLog.create({
        to:         email.toLowerCase().trim(),
        name:       name.trim(),
        eventId:    event._id,
        eventTitle: event.title,
        subject,
        status:     "sent",
        sentAt:     new Date(),
      });

      console.log(`📧 Confirmation email sent to: ${email}`);
    } catch (emailErr) {
      console.error(`⚠️  Confirmation email failed for ${email}:`, emailErr.message);
      try {
        const EmailLog = require("../models/EmailLog");
        await EmailLog.create({
          to:         email.toLowerCase().trim(),
          name:       name.trim(),
          eventId:    event._id,
          eventTitle: event.title,
          subject:    `✅ Registration Confirmed: ${event.title}`,
          status:     "failed",
          error:      emailErr.message,
          sentAt:     new Date(),
        });
      } catch (_) {}
    }

    res.status(201).json({ message: "Successfully registered!", registration });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: "You are already registered for this event" });
    console.error("Registration POST error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ── GET /api/registrations/my ──────────────────────── */
router.get("/my", auth, async (req, res) => {
  try {
    const regs = await Registration.find({ userId: req.userId })
      .populate("eventId", "title startDate endDate venueName category banner status")
      .sort({ createdAt: -1 });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ── GET /api/registrations/event/:eventId ──────────── */
router.get("/event/:eventId", auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId))
      return res.status(400).json({ message: "Invalid event ID" });
    const regs = await Registration.find({ eventId }).sort({ createdAt: -1 });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ── GET /api/registrations/check/:eventId ──────────── */
router.get("/check/:eventId", auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const reg = await Registration.findOne({ eventId, $or: [{ userId: req.userId }] });
    res.json({ registered: !!reg, registration: reg });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ── DELETE /api/registrations/:id ─────────────────── */
router.delete("/:id", auth, async (req, res) => {
  try {
    const reg = await Registration.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!reg) return res.status(404).json({ message: "Registration not found" });
    res.json({ message: "Registration cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ── GET /api/registrations/debug ───────────────────── */
router.get("/debug", auth, async (req, res) => {
  try {
    const regs = await Registration.find().lean();
    res.json({ count: regs.length, registrations: regs.map(r => ({ id: r._id, name: r.name, email: r.email, userId: r.userId, ticketCount: r.ticketCount, eventId: r.eventId })) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;