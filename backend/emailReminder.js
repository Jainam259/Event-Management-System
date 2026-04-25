// backend/emailReminder.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function buildEmailHTML(userName, event) {
  const startDate = new Date(event.startDate);
  const dateStr   = startDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr   = startDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const venue     = event.venueName || event.address || (event.format === "Virtual" ? "Online / Virtual" : "TBD");
  const isPaid    = event.ticketType === "Paid";

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0d0d1a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1a;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="background:linear-gradient(135deg,#7c3aed,#9333ea);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
    <div style="font-size:28px;margin-bottom:8px;">✨</div>
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:0.5px;">EventManager</h1>
    <p style="margin:8px 0 0;color:#e9d5ff;font-size:14px;">Your event is tomorrow!</p>
  </td></tr>
  <tr><td style="background:#111128;padding:36px 40px;">
    <p style="margin:0 0 20px;color:#e2e2f0;font-size:16px;">Hi <strong style="color:#c4b5fd;">${userName}</strong> 👋</p>
    <p style="margin:0 0 28px;color:#9a9ab5;font-size:15px;line-height:1.6;">
      This is a friendly reminder that you are registered for an upcoming event.
      Don't miss it — it starts <strong style="color:#e879f9;">tomorrow!</strong>
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a35;border:1px solid rgba(124,58,237,0.3);border-radius:14px;overflow:hidden;margin-bottom:28px;">
      <tr><td style="background:rgba(124,58,237,0.2);padding:20px 24px;border-bottom:1px solid rgba(124,58,237,0.2);">
        <h2 style="margin:0;color:#e0d9ff;font-size:20px;font-weight:700;">${event.title}</h2>
        ${event.category ? `<span style="display:inline-block;margin-top:8px;background:rgba(139,92,246,0.25);color:#c4b5fd;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;">${event.category}</span>` : ""}
      </td></tr>
      <tr><td style="padding:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="color:#6b6b8a;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">📅 Date</span>
            <p style="margin:4px 0 0;color:#e2e2f0;font-size:15px;font-weight:600;">${dateStr}</p>
          </td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="color:#6b6b8a;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">🕐 Time</span>
            <p style="margin:4px 0 0;color:#e2e2f0;font-size:15px;font-weight:600;">${timeStr}</p>
          </td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="color:#6b6b8a;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">📍 Venue</span>
            <p style="margin:4px 0 0;color:#e2e2f0;font-size:15px;font-weight:600;">${venue}</p>
          </td></tr>
          <tr><td style="padding:8px 0;">
            <span style="color:#6b6b8a;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">🎟️ Ticket</span>
            <p style="margin:4px 0 0;">
              <span style="display:inline-block;background:${isPaid ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)"};color:${isPaid ? "#fcd34d" : "#6ee7b7"};font-size:13px;font-weight:600;padding:3px 10px;border-radius:20px;">
                ${isPaid ? `💳 Paid — ₹${event.price || 0}` : "🆓 Free Entry"}
              </span>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
    <div style="background:rgba(232,121,249,0.08);border:1px solid rgba(232,121,249,0.2);border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;color:#e2e2f0;font-size:14px;line-height:1.6;">
        ⏰ <strong style="color:#e879f9;">Reminder:</strong> Please arrive on time. Carry your registration confirmation.
      </p>
    </div>
    <p style="margin:0;color:#6b6b8a;font-size:13px;line-height:1.6;">Looking forward to seeing you there!</p>
  </td></tr>
  <tr><td style="background:#0d0d1a;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
    <p style="margin:0;color:#4a4a6a;font-size:12px;">You received this because you registered for this event.</p>
    <p style="margin:8px 0 0;color:#4a4a6a;font-size:12px;">© 2026 EventManager. All rights reserved.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

async function sendEventReminders() {
  try {
    const Registration = require("./models/Registration");
    const Event        = require("./models/Event");
    const User         = require("./models/User");
    const EmailLog     = require("./models/EmailLog");

    const now = new Date();

    // ⭐ FIXED: Check events starting in next 1–48 hours (broader window)
    // Also skip events that already have reminder sent today
    const windowStart = new Date(now);
    windowStart.setHours(windowStart.getHours() + 1);   // at least 1 hour away

    const windowEnd = new Date(now);
    windowEnd.setHours(windowEnd.getHours() + 48);       // up to 48 hours away

    console.log(`\n📧 [Reminder] Checking events in next 1–48 hours...`);

    const upcomingEvents = await Event.find({
      startDate: { $gte: windowStart, $lte: windowEnd },
      isHidden:  { $ne: true },
    });

    console.log(`📅 Found ${upcomingEvents.length} event(s)`);
    if (upcomingEvents.length === 0) {
      console.log("✅ No upcoming events to remind about.");
      return;
    }

    let totalSent = 0;

    for (const event of upcomingEvents) {
      console.log(`\n🎯 Processing: "${event.title}"`);

      // ⭐ Skip if reminder already sent today for this event
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const alreadySent = await EmailLog.findOne({
        eventId: event._id,
        status:  "sent",
        sentAt:  { $gte: todayStart },
      });

      if (alreadySent) {
        console.log(`   ⏭️  Reminder already sent today for "${event.title}" — skipping`);
        continue;
      }

      const regs = await Registration.find({
        $or: [{ eventId: event._id }, { event: event._id }],
      });

      console.log(`   👥 ${regs.length} registration(s)`);

      for (const reg of regs) {
        let displayName = reg.name;
        if (reg.userId) {
          const user = await User.findById(reg.userId).select("name").lean();
          if (user?.name) displayName = user.name;
        }

        const subject  = `⏰ Reminder: "${event.title}" is tomorrow!`;
        const emailHtml = buildEmailHTML(displayName, event);

        try {
          await transporter.sendMail({
            from:    `"EventManager" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to:      reg.email,
            subject,
            html:    emailHtml,
          });

          await EmailLog.create({
            to: reg.email, name: displayName,
            eventId: event._id, eventTitle: event.title,
            subject, status: "sent", sentAt: new Date(),
          });

          console.log(`   ✅ Sent to: ${reg.email}`);
          totalSent++;
          await new Promise(r => setTimeout(r, 300));

        } catch (emailErr) {
          await EmailLog.create({
            to: reg.email, name: displayName,
            eventId: event._id, eventTitle: event.title,
            subject, status: "failed", error: emailErr.message, sentAt: new Date(),
          });
          console.error(`   ❌ Failed: ${reg.email} — ${emailErr.message}`);
        }
      }
    }

    console.log(`\n🎉 Done! Sent ${totalSent} reminder(s).\n`);
  } catch (err) {
    console.error("❌ Reminder error:", err.message);
  }
}

module.exports = { sendEventReminders };