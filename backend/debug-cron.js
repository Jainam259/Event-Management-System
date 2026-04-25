// backend/debug-cron.js
// Run: node debug-cron.js
// Shows exactly why emails are/aren't being sent

require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("✅ Connected to:", mongoose.connection.db.databaseName);

  const Event        = require("./models/Event");
  const Registration = require("./models/Registration");

  const now = new Date();
  console.log("\n🕐 Current time:", now.toISOString());
  console.log("   Local time:  ", now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), "IST");

  // What window the cron checks
  const windowStart = new Date(now); windowStart.setHours(windowStart.getHours() + 23);
  const windowEnd   = new Date(now); windowEnd.setHours(windowEnd.getHours() + 25);
  console.log("\n📆 Cron checks for events between:");
  console.log("   From:", windowStart.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), "IST");
  console.log("   To:  ", windowEnd.toLocaleString("en-IN",   { timeZone: "Asia/Kolkata" }), "IST");

  // All events
  const allEvents = await Event.find({ isHidden: { $ne: true } }).lean();
  console.log(`\n📅 ALL events in DB: ${allEvents.length}`);
  allEvents.forEach(e => {
    const start    = new Date(e.startDate);
    const diffHrs  = Math.round((start - now) / 3600000);
    const inWindow = start >= windowStart && start <= windowEnd;
    console.log(`  ${inWindow ? "✅ IN WINDOW" : "❌ NOT in window"} | "${e.title}" | startDate: ${e.startDate} | hours from now: ${diffHrs}h`);
  });

  // Events in tomorrow's window
  const tomorrowEvents = await Event.find({
    startDate: { $gte: windowStart, $lte: windowEnd },
    isHidden:  { $ne: true },
  }).lean();
  console.log(`\n🎯 Events in tomorrow's window: ${tomorrowEvents.length}`);

  if (tomorrowEvents.length === 0) {
    console.log("\n❌ REASON: No events start tomorrow (23-25 hours from now)");
    console.log("   SOLUTION: Create a new event with startDate = TOMORROW");
    console.log("   Example: If today is", now.toDateString(), "then create event for", new Date(now.getTime() + 86400000).toDateString());
  } else {
    for (const ev of tomorrowEvents) {
      const regs = await Registration.find({
        $or: [{ eventId: ev._id }, { event: ev._id }],
      });
      console.log(`\n  📌 "${ev.title}" → ${regs.length} registration(s)`);
      regs.forEach(r => console.log(`     → ${r.email} (${r.name})`));
      if (regs.length === 0) {
        console.log("     ❌ REASON: Event found but NO registrations — nobody to email!");
      }
    }
  }

  // Check email config
  console.log("\n📧 Email config check:");
  console.log("   EMAIL_USER:", process.env.EMAIL_USER || "❌ NOT SET");
  console.log("   EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ set" : "❌ NOT SET");
  console.log("   EMAIL_HOST:", process.env.EMAIL_HOST || "❌ NOT SET");
  console.log("   EMAIL_FROM:", process.env.EMAIL_FROM || "(not set — will use EMAIL_USER)");

  // Check email logs
  try {
    const EmailLog = require("./models/EmailLog");
    const logs = await EmailLog.find().sort({ sentAt: -1 }).limit(5).lean();
    console.log(`\n📋 Last 5 email log entries: ${logs.length}`);
    if (logs.length === 0) {
      console.log("   (no logs — cron may not have run yet or EmailLog model missing)");
    } else {
      logs.forEach(l => {
        console.log(`   ${l.status === "sent" ? "✅" : "❌"} ${l.to} | ${l.eventTitle} | ${new Date(l.sentAt).toLocaleString("en-IN")}`);
      });
    }
  } catch (e) {
    console.log("   ⚠️  EmailLog model not found:", e.message);
  }

  console.log("\n✅ Debug complete.\n");
  mongoose.disconnect();
});