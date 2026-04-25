require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Registration = require("./models/Registration");
  const Event = require("./models/Event");
  const User = require("./models/User");
  const EmailLog = require("./models/EmailLog");
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, port: parseInt(process.env.EMAIL_PORT),
    secure: false, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  const events = await Event.find({ isHidden: { $ne: true } }).lean();
  console.log("Events:", events.map(e => e.title));
  const event = events[0];
  if (!event) { console.log("No events!"); mongoose.disconnect(); return; }
  const regs = await Registration.find({ $or: [{ eventId: event._id }, { event: event._id }] });
  console.log(`Sending to ${regs.length} people for "${event.title}"`);
  for (const reg of regs) {
    try {
      await transporter.sendMail({
        from: `"EventManager" <${process.env.EMAIL_FROM}>`,
        to: reg.email,
        subject: `⏰ Reminder: "${event.title}" is tomorrow!`,
        html: `<div style="background:#111128;padding:32px;font-family:Arial;color:#e2e2f0;border-radius:16px;max-width:500px;">
          <h2 style="color:#c4b5fd;">✨ EventManager Reminder</h2>
          <p>Hi <strong style="color:#e879f9;">${reg.name}</strong> 👋</p>
          <p style="color:#9a9ab5;">Your event <strong style="color:#fff;">${event.title}</strong> is coming up!</p>
          <p style="color:#9a9ab5;">📅 <strong style="color:#fff;">${new Date(event.startDate).toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</strong></p>
          <p style="color:#9a9ab5;">📍 <strong style="color:#fff;">${event.venueName || "TBD"}</strong></p>
          <p style="color:#6b6b8a;font-size:12px;margin-top:24px;">© 2026 EventManager</p>
        </div>`
      });
      await EmailLog.create({ to: reg.email, name: reg.name, eventId: event._id, eventTitle: event.title, subject: "Reminder", status: "sent", sentAt: new Date() });
      console.log("✅ Sent to:", reg.email);
    } catch (err) {
      console.log("❌ Failed:", reg.email, err.message);
    }
  }
  mongoose.disconnect();
});