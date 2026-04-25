// backend/models/EmailLog.js
const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema({
  to:         { type: String, required: true },
  name:       { type: String, default: "" },
  eventId:    { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  eventTitle: { type: String, default: "" },
  subject:    { type: String, default: "" },
  status:     { type: String, enum: ["sent", "failed"], default: "sent" },
  error:      { type: String, default: "" },
  sentAt:     { type: Date, default: Date.now },
}, { timestamps: true });

module.exports =
  mongoose.models.EmailLog ||
  mongoose.model("EmailLog", emailLogSchema);