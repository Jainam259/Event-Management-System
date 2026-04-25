// backend/models/Event.js
const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true },
    description:  { type: String },
    category:     { type: String },
    format:       { type: String },
    timezone:     { type: String },
    startDate:    { type: Date },
    endDate:      { type: Date },
    venueName:    { type: String },
    address:      { type: String },
    virtualLink:  { type: String },
    capacity:     { type: Number },
    ticketType:   { type: String, default: "Free" },
    price:        { type: Number, default: 0 },
    banner:       { type: String },
    status:       { type: String, default: "published" },
    createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // ⭐ Soft delete — hides from frontend but keeps in DB
    isHidden:     { type: Boolean, default: false },
    hiddenAt:     { type: Date },
    hiddenBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Event || mongoose.model("Event", EventSchema);