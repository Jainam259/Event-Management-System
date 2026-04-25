// backend/models/Registration.js
const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    // ⭐ "event" = old field name, "eventId" = new field name — both supported
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    event:   { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User"  },

    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, lowercase: true, trim: true },
    phone:        { type: String, default: "" },
    organization: { type: String, default: "" },
    ticketCount:  { type: Number, default: 1, min: 1 },
    message:      { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Registration ||
  mongoose.model("Registration", registrationSchema);