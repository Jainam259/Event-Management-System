// backend/routes/participants.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Event = require("../models/Event");

const JWT_SECRET = process.env.JWT_SECRET;

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

router.get("/", auth, async (req, res) => {
  try {
    const Registration = require("../models/Registration");
    const users  = await User.find().select("name email createdAt").lean();
    const events = await Event.find().lean();
    const now    = new Date();

    // Build event lookup map: _id string → event object
    const eventMap = {};
    events.forEach(e => { eventMap[e._id.toString()] = e; });

    // Build maps: by userId AND by email (fallback)
    const regByUserId = {};
    const regByEmail  = {};

    // ⭐ Fetch raw registrations WITHOUT populate — handle both field names manually
    const allRegs = await Registration.find().lean();
    console.log(`📊 Total registrations: ${allRegs.length}`);

    for (const reg of allRegs) {
      // ⭐ Support BOTH old field "event" AND new field "eventId"
      const rawEventId = reg.eventId || reg.event;
      const eventIdStr = rawEventId ? rawEventId.toString() : null;
      const eventObj   = eventIdStr ? eventMap[eventIdStr] : null;

      const tickets   = parseInt(reg.ticketCount) || 1;
      const eventInfo = eventObj
        ? { eventTitle: eventObj.title || "Unknown Event", ticketCount: tickets, startDate: eventObj.startDate }
        : null;

      console.log(`  reg: ${reg.email} | userId:${reg.userId || "NONE"} | event:${eventObj?.title || "NOT FOUND"} | tickets:${tickets}`);

      // Index by userId
      if (reg.userId) {
        const uid = reg.userId.toString();
        if (!regByUserId[uid]) regByUserId[uid] = { tickets: 0, eventIds: new Set(), registrations: [] };
        regByUserId[uid].tickets += tickets;
        if (eventIdStr) {
          regByUserId[uid].eventIds.add(eventIdStr);
          if (eventInfo) regByUserId[uid].registrations.push(eventInfo);
        }
      }

      // Index by email (fallback for registrations without userId)
      if (reg.email) {
        const em = reg.email.toLowerCase().trim();
        if (!regByEmail[em]) regByEmail[em] = { tickets: 0, eventIds: new Set(), registrations: [] };
        regByEmail[em].tickets += tickets;
        if (eventIdStr) {
          regByEmail[em].eventIds.add(eventIdStr);
          if (eventInfo) regByEmail[em].registrations.push(eventInfo);
        }
      }
    }

    const participants = users.map((u) => {
      const uid   = u._id.toString();
      const email = u.email.toLowerCase().trim();

      // userId match first, then email fallback
      const regData = regByUserId[uid] || regByEmail[email]
        || { tickets: 0, eventIds: new Set(), registrations: [] };

      console.log(`👤 ${u.name} → tickets:${regData.tickets} events:${regData.eventIds.size}`);

      const userCreatedEvents = events.filter(e => e.createdBy?.toString() === uid);
      const upcomingEvents    = userCreatedEvents.filter(e => new Date(e.startDate) > now).length;
      const recentCreated     = [...userCreatedEvents].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];

      return {
        _id:              u._id,
        name:             u.name,
        email:            u.email,
        joinedAt:         u.createdAt,
        eventsRegistered: regData.eventIds.size,
        ticketsBooked:    regData.tickets,
        registrations:    regData.registrations,
        upcomingEvents,
        recentEvent:      recentCreated?.title || null,
        recentEventDate:  recentCreated?.startDate || null,
      };
    });

    const totalTicketsBooked = participants.reduce((s, p) => s + p.ticketsBooked, 0);

    res.json({
      participants,
      stats: {
        totalParticipants: users.length,
        activeUsers:       participants.filter(p => p.ticketsBooked > 0).length,
        totalEvents:       events.length,
        totalTicketsBooked,
      },
    });
  } catch (err) {
    console.error("Participants error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;